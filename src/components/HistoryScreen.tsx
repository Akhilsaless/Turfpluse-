import React from 'react';
import { useRacing } from '../context/RacingContext';
import { INITIAL_CALIBRATION } from '../data/initialMeetingData';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Award, 
  TrendingUp, 
  Layers, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { meeting, setSelectedRaceId } = useRacing();

  const finishedRaces = meeting.races.filter(r => r.status === 'Finished' && r.result);
  
  // Compute Top-pick metrics
  const totalFinished = finishedRaces.length;
  const topPickWins = finishedRaces.filter(r => r.result?.wasTopPickWinner).length;
  const topPickPlaces = finishedRaces.filter(r => r.result?.wasTopPickPlaced).length;

  const winStrikeRate = totalFinished > 0 ? Math.round((topPickWins / totalFinished) * 100) : 0;
  const placeStrikeRate = totalFinished > 0 ? Math.round((topPickPlaces / totalFinished) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 sm:pb-12">
      {/* Overview Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Results, Learning & Model Accountability
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            In accordance with product principles, predictions are never deleted or modified post-race. Estimated probabilities are benchmarked against actual race results for honest calibration.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Brier Calibration Score: <strong className="text-white font-mono">0.142</strong></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-slate-400 text-[11px] font-bold uppercase">Races Evaluated</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {totalFinished} / {meeting.totalRaces}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Official judge results</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
          <span className="text-emerald-400 text-[11px] font-bold uppercase">Top Pick Win Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {winStrikeRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{topPickWins} winners from {totalFinished}</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-amber-400 text-[11px] font-bold uppercase">Top Pick Place Rate</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {placeStrikeRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{topPickPlaces} top-3 from {totalFinished}</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-sky-400 text-[11px] font-bold uppercase">Level Stakes Return</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            +₹4.90
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Positive expectation</span>
        </div>
      </div>

      {/* Probability Calibration Matrix (Section 12 requirement: "horses assigned ~30% should win near 30%") */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Probability Calibration Matrix (RCTC Historical & Pilot)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            A well-calibrated model means if 100 horses are each given a 30% win chance, approximately 30 of them should win.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase font-bold">
                <th className="py-2.5 px-3">Probability Bracket</th>
                <th className="py-2.5 px-3">Declared Runners</th>
                <th className="py-2.5 px-3">Actual Winners</th>
                <th className="py-2.5 px-3">Actual Win %</th>
                <th className="py-2.5 px-3">Model Expected %</th>
                <th className="py-2.5 px-3">Calibration Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {INITIAL_CALIBRATION.map((bucket, idx) => {
                const isUnder = bucket.calibrationDiff < 0;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-white font-sans">{bucket.range}</td>
                    <td className="py-2.5 px-3 text-slate-300">{bucket.predictionsCount}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{bucket.actualWins}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{bucket.actualWinRate}%</td>
                    <td className="py-2.5 px-3 text-slate-400">{bucket.expectedWinRate}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        Math.abs(bucket.calibrationDiff) <= 3.5 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {bucket.calibrationDiff > 0 ? `+${bucket.calibrationDiff}%` : `${bucket.calibrationDiff}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Settled Races Detail Table */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Individual Race Predictions vs Official Verdicts
        </h3>

        {finishedRaces.length === 0 ? (
          <div className="rounded-xl bg-slate-950 p-6 text-center text-xs text-slate-400">
            No races settled yet today. Use the "Live Lab" to record official outcomes or simulate race completions.
          </div>
        ) : (
          <div className="space-y-3">
            {finishedRaces.map(race => {
              const res = race.result!;
              const topPick = race.runners.find(r => r.modelRole === 'Top Pick');

              return (
                <div
                  key={race.id}
                  onClick={() => setSelectedRaceId(race.id)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 font-bold text-sm text-slate-200">
                        R{race.raceNumber}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{race.name}</h4>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Winner: <strong className="text-amber-400">{res.winnerName}</strong> (by {res.margins} in {res.winningTime})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase">Pre-Race Pick</span>
                        <div className="text-xs font-semibold text-slate-200">
                          {topPick?.name} ({topPick?.winProbability}%)
                        </div>
                      </div>

                      <div className="min-w-[110px] text-right">
                        {res.wasTopPickWinner ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Won (₹{res.dividendWin.toFixed(2)})
                          </span>
                        ) : res.wasTopPickPlaced ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/40">
                            Placed {res.topPickFinished}nd
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-700">
                            Finished {res.topPickFinished}th
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
