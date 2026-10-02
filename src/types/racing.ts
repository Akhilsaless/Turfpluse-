export type RunningStyle = 'Front Runner' | 'Prominent' | 'Mid-division' | 'Late Closer';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';
export type RaceStatus = 'Upcoming' | 'Next' | 'Going to Post' | 'Live' | 'Finished' | 'Delayed';
export type RunnerStatus = 'Declared' | 'Running' | 'Scratched';
export type TrackCondition = 'Firm' | 'Good to Firm' | 'Good' | 'Yielding' | 'Soft' | 'Heavy';

export interface RunnerRecord {
  starts: number;
  wins: number;
  seconds: number;
  thirds: number;
}

export interface Runner {
  id: string;
  saddleNumber: number;
  draw: number;
  name: string;
  age: number;
  gender: 'Colt' | 'Filly' | 'Gelding' | 'Horse' | 'Mare';
  color: string;
  pedigree: {
    sire: string;
    dam: string;
  };
  trainer: string;
  jockey: string;
  photoUrl?: string;
  jockeyPhotoUrl?: string;
  weightKg: number;
  allowanceKg?: number;
  rating: number;
  recentForm: string[]; // e.g. ["1", "3", "2", "1"]
  odds: number; // Decimal odds e.g. 2.75
  oddsTrend: 'shortening' | 'drifting' | 'stable';
  openingOdds: number;
  status: RunnerStatus;
  scratchReason?: string;
  runningStyle: RunningStyle;
  
  // Historical profiles
  careerRecord: RunnerRecord;
  distanceRecord: RunnerRecord;
  courseRecord: RunnerRecord;
  goingRecord: Record<string, RunnerRecord>;
  jockeyTrainerCombo: {
    starts: number;
    wins: number;
    winRate: number; // percentage e.g. 24.5
  };
  lastRatings: number[]; // Last 4 starts
  
  // Model Analytics
  winProbability: number; // e.g. 34 (percent)
  placeProbability: number; // e.g. 68 (percent)
  modelRole: 'Top Pick' | 'Main Danger' | 'Value Watch' | 'Contender';
  keyReasons: string[]; // 3 concise reasons
  keyRisk: string; // Plain language reason the pick could lose
  oneSentenceSummary: string;
  favoredGoing: TrackCondition[];
}

export interface TimelineEntry {
  id: string;
  timestamp: string; // e.g. "11:00 AM" or ISO
  type: 'initial' | 'going_change' | 'jockey_change' | 'scratch' | 'market_move' | 'model_revised' | 'result_posted';
  title: string;
  description: string;
  affectedRunnerIds?: string[];
  snapshotSummary?: string;
}

export interface PredictionSnapshot {
  timestamp: string;
  version: number;
  label: string; // "Initial Morning Line" | "Post-Going Change" | "Final Call"
  topPickId: string;
  topPickName: string;
  winProbability: number;
  runnerProbabilities: { runnerId: string; name: string; winPct: number }[];
}

export interface OfficialResult {
  winnerId: string;
  winnerName: string;
  secondId: string;
  secondName: string;
  thirdId: string;
  thirdName: string;
  margins: string; // e.g. "1.25 L, Neck"
  winningTime: string; // e.g. "1m 11.42s"
  dividendWin: number;
  dividendPlace: number;
  topPickFinished: number; // 1, 2, 3, 4...
  wasTopPickWinner: boolean;
  wasTopPickPlaced: boolean;
  notes?: string;
}

export interface Race {
  id: string;
  raceNumber: number; // 1 to 10
  name: string; // e.g. "The Kolkata Derby 2026 (Gr.1)"
  time: string; // "16:35"
  isoTime?: string; // "2026-10-03T16:35:00+05:30"
  distanceMeters: number; // 2400
  raceClass: string; // "Gr.1" | "Class II" etc
  prizeMoney: string; // "₹1,25,00,000"
  status: RaceStatus;
  going: TrackCondition;
  penetrometer: number; // e.g. 3.6
  railPosition: string; // "Rail in true position"
  runners: Runner[];
  confidence: ConfidenceLevel;
  workingOrderNote?: string; // Explicit timestamped working order note e.g. Derby notes
  timeline: TimelineEntry[];
  predictionSnapshots: PredictionSnapshot[];
  result?: OfficialResult;
}

export interface Meeting {
  id: string;
  name: string;
  venue: string;
  date: string;
  trackCondition: TrackCondition;
  penetrometer: number;
  weather: {
    tempC: number;
    description: string;
    windKmh: number;
    humidityPct: number;
  };
  totalRaces: number;
  races: Race[];
}

export interface NewsItem {
  id: string;
  timestamp: string;
  title: string;
  source: 'RCTC Stewards' | 'Track & Weather Desk' | 'Paddock Inspection' | 'Trainer Bulletin';
  category: 'official' | 'track' | 'stable' | 'market';
  summary: string;
  relatedRaceId?: string;
  relatedHorseId?: string;
  relatedHorseName?: string;
  verified: boolean;
}

export interface CalibrationBucket {
  range: string; // "35-45%"
  predictionsCount: number;
  actualWins: number;
  actualWinRate: number; // percent
  expectedWinRate: number; // percent
  calibrationDiff: number; // difference
}

export interface ToastAlert {
  id: string;
  type: 'race_starting' | 'horse_starting' | 'going_to_post' | 'result' | 'scratch';
  title: string;
  message: string;
  timestamp: string;
  raceId?: string;
  runnerId?: string;
  raceNumber?: number;
  horseName?: string;
  timeToStart?: string;
  dismissed?: boolean;
}
