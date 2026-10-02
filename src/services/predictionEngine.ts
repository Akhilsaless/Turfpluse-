import { Runner, TrackCondition, ConfidenceLevel } from '../types/racing';

interface ScoreBreakdown {
  formScore: number;
  distanceScore: number;
  courseScore: number;
  goingScore: number;
  weightDrawScore: number;
  jockeyTrainerScore: number;
  paceScore: number;
  rawTotal: number;
}

export function scoreRunner(
  runner: Runner,
  raceDistance: number,
  going: TrackCondition
): ScoreBreakdown {
  if (runner.status === 'Scratched') {
    return {
      formScore: 0,
      distanceScore: 0,
      courseScore: 0,
      goingScore: 0,
      weightDrawScore: 0,
      jockeyTrainerScore: 0,
      paceScore: 0,
      rawTotal: 0,
    };
  }

  // 1. Form & Class (0-30 pts)
  let formScore = 15;
  const recentStarts = runner.recentForm.slice(0, 4);
  recentStarts.forEach((pos, idx) => {
    const decay = 1 / (idx + 1);
    if (pos === '1') formScore += 5 * decay;
    else if (pos === '2') formScore += 3 * decay;
    else if (pos === '3') formScore += 1.5 * decay;
    else if (pos === '4') formScore += 0.5 * decay;
    else if (pos === '0' || pos === '9') formScore -= 2 * decay;
  });
  // Rating factor
  formScore += Math.max(0, (runner.rating - 30) * 0.25);

  // 2. Distance Suitability (0-15 pts)
  let distanceScore = 8;
  const dRec = runner.distanceRecord;
  if (dRec.starts > 0) {
    const winRate = dRec.wins / dRec.starts;
    const placeRate = (dRec.wins + dRec.seconds + dRec.thirds) / dRec.starts;
    distanceScore = (winRate * 9) + (placeRate * 6);
  }

  // 3. Course / Track Suitability (0-15 pts)
  let courseScore = 7;
  const cRec = runner.courseRecord;
  if (cRec.starts > 0) {
    const winRate = cRec.wins / cRec.starts;
    const placeRate = (cRec.wins + cRec.seconds + cRec.thirds) / cRec.starts;
    courseScore = (winRate * 9) + (placeRate * 6);
  }

  // 4. Going / Surface Suitability (0-15 pts)
  let goingScore = 8;
  if (runner.favoredGoing.includes(going)) {
    goingScore += 5;
  }
  const gRec = runner.goingRecord[going];
  if (gRec && gRec.starts > 0) {
    const gRate = (gRec.wins * 2 + gRec.seconds) / (gRec.starts * 2);
    goingScore = Math.min(15, goingScore + gRate * 5);
  }

  // 5. Weight & Draw Impact (0-15 pts)
  let weightDrawScore = 8;
  // Lower weight is advantageous
  if (runner.weightKg <= 52) weightDrawScore += 4;
  else if (runner.weightKg <= 55) weightDrawScore += 2;
  else if (runner.weightKg >= 60) weightDrawScore -= 3;

  // Draw impact: inside barriers (1-4) advantageous on turning sprints, neutral on 2400m
  if (raceDistance <= 1400) {
    if (runner.draw <= 4) weightDrawScore += 3;
    else if (runner.draw >= 10) weightDrawScore -= 2;
  } else {
    // 1600m - 2400m
    if (runner.draw >= 1 && runner.draw <= 6) weightDrawScore += 1.5;
  }

  // 6. Jockey & Trainer Combination (0-15 pts)
  let jockeyTrainerScore = 7;
  const jt = runner.jockeyTrainerCombo;
  if (jt.starts > 0) {
    jockeyTrainerScore = Math.min(15, (jt.winRate / 100) * 45);
  }

  // 7. Pace Matchup (0-10 pts)
  let paceScore = 6;
  if (runner.runningStyle === 'Front Runner' && raceDistance <= 1200) paceScore += 3;
  if (runner.runningStyle === 'Late Closer' && raceDistance >= 2000) paceScore += 3;
  if (runner.runningStyle === 'Prominent') paceScore += 2; // versatile

  const rawTotal = Math.max(
    1,
    formScore + distanceScore + courseScore + goingScore + weightDrawScore + jockeyTrainerScore + paceScore
  );

  return {
    formScore: Number(formScore.toFixed(1)),
    distanceScore: Number(distanceScore.toFixed(1)),
    courseScore: Number(courseScore.toFixed(1)),
    goingScore: Number(goingScore.toFixed(1)),
    weightDrawScore: Number(weightDrawScore.toFixed(1)),
    jockeyTrainerScore: Number(jockeyTrainerScore.toFixed(1)),
    paceScore: Number(paceScore.toFixed(1)),
    rawTotal: Number(rawTotal.toFixed(1)),
  };
}

export function recalibrateRaceRunners(
  runners: Runner[],
  raceDistance: number,
  going: TrackCondition
): Runner[] {
  const activeRunners = runners.filter(r => r.status !== 'Scratched');

  if (activeRunners.length === 0) {
    return runners.map(r => ({
      ...r,
      winProbability: 0,
      placeProbability: 0,
      modelRole: 'Contender',
    }));
  }

  // Calculate raw scores with exponent to heighten separation
  const scored = runners.map(runner => {
    if (runner.status === 'Scratched') {
      return { runner, score: 0 };
    }
    const breakdown = scoreRunner(runner, raceDistance, going);
    // Exponential weighting for natural probability distribution
    const expScore = Math.pow(breakdown.rawTotal, 2.2);
    return { runner, score: expScore };
  });

  const totalScore = scored.reduce((acc, curr) => acc + curr.score, 0);

  // Normalize into probabilities summing to 100%
  const withProbs = scored.map(item => {
    if (item.runner.status === 'Scratched' || totalScore === 0) {
      return {
        ...item.runner,
        winProbability: 0,
        placeProbability: 0,
      };
    }
    const winPct = Math.round((item.score / totalScore) * 100);
    // Place probability heuristic (in fields of 8+, top 3 place)
    const placePct = Math.min(94, Math.round(winPct * 1.95 + 12));
    return {
      ...item.runner,
      winProbability: winPct,
      placeProbability: placePct,
    };
  });

  // Ensure active probabilities sum precisely to 100
  const activeOnly = withProbs.filter(r => r.status !== 'Scratched');
  const sum = activeOnly.reduce((acc, r) => acc + r.winProbability, 0);
  if (activeOnly.length > 0 && sum !== 100) {
    const diff = 100 - sum;
    // Add delta to highest probability runner
    const maxRunner = activeOnly.reduce((prev, curr) => (curr.winProbability > prev.winProbability ? curr : prev));
    maxRunner.winProbability = Math.max(1, maxRunner.winProbability + diff);
  }

  // Sort active to assign roles
  const sortedActive = [...activeOnly].sort((a, b) => b.winProbability - a.winProbability);

  const topPickId = sortedActive[0]?.id;
  const mainDangerId = sortedActive[1]?.id;

  // Identify outsider / value watch: odds >= 5.0 with win probability >= 14% or best odds/probability mismatch
  let valueWatchId: string | undefined;
  for (const r of sortedActive.slice(2)) {
    if (r.odds >= 5.0 && r.winProbability >= 12) {
      valueWatchId = r.id;
      break;
    }
  }
  if (!valueWatchId && sortedActive[2]) {
    valueWatchId = sortedActive[2].id;
  }

  return withProbs.map(r => {
    if (r.status === 'Scratched') {
      return { ...r, modelRole: 'Contender' as const };
    }
    if (r.id === topPickId) {
      return { ...r, modelRole: 'Top Pick' as const };
    }
    if (r.id === mainDangerId) {
      return { ...r, modelRole: 'Main Danger' as const };
    }
    if (r.id === valueWatchId) {
      return { ...r, modelRole: 'Value Watch' as const };
    }
    return { ...r, modelRole: 'Contender' as const };
  });
}

export function determineConfidence(topWinPct: number, runnerCount: number): ConfidenceLevel {
  if (topWinPct >= 34) return 'High';
  if (topWinPct >= 25 && runnerCount <= 8) return 'High';
  if (topWinPct >= 22) return 'Medium';
  return 'Low';
}
