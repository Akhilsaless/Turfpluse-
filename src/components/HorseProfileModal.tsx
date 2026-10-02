import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Runner, Race } from '../types/racing';
import { useRaceCountdown } from '../utils/countdown';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { CinematicPaddockStage } from './CinematicPaddockStage';
import { 
  X, 
  ArrowLeft, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Gauge, 
  MapPin, 
  Layers, 
  Calendar,
  Sparkles,
  AlertTriangle,
  Star,
  Clock,
  Bot
} from 'lucide-react';

export const HorseProfileModal: React.FC = () => {
  const { 
    meeting, 
    news, 
    selectedRunnerId, 
    setSelectedRunnerId, 
    toggleTrackHorse, 
    isHorseTracked,
    askAiBrain 
  } = useRacing();

  const [viewMode, setViewMode] = useState<'3d_stage' | 'stats'>('3d_stage');

  if (!selectedRunnerId) return null;

  // Search across all races for the selected runner
  let targetRunner: Runner | undefined;
  let targetRace: Race | undefined;

  for (const r of meeting.races) {
    const found = r.runners.find(run => run.id === selectedRunnerId);
    if (found) {
      targetRunner = found;
      targetRace = r;
      break;
    }
  }

  if (!targetRunner || !targetRace) return null;

  const countdown = useRaceCountdown(targetRace.isoTime);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md sm:p-4 overflow-hidden animate-fade-in">
      <div 
        style={{ perspective: 1200 }}
        className="flex flex-col w-full h-[94vh] sm:h-[90vh] max-w-3xl rounded-t-3xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f172a] via-[#0b101b] to-[#06090e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.15)] overflow-hidden"
      >
        {/* Top Specular Glow */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* Top Header */}
        <div className="border-b border-white/10 bg-slate-900/80 px-5 py-3.5 shrink-0 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSelectedRunnerId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="rounded-md bg-emerald-500 text-slate-950 px-1.5 py-0.2 font-black">
                    R{targetRace.raceNumber} #{targetRunner.saddleNumber}
                  </span>
                  <span className="font-semibold text-slate-300">{targetRace.name}</span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  {targetRunner.name}
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    ({targetRunner.modelRole})
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => askAiBrain(`Give me a complete handicapper analysis on ${targetRunner?.name} in Race ${targetRace?.raceNumber} (${targetRace?.name}). Analyze sire ${targetRunner?.pedigree.sire}, jockey ${targetRunner?.jockey}, and speed figures.`)}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/70 transition shadow-sm"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ask AI Brain</span>
              </button>

              <button
                onClick={() => toggleTrackHorse(targetRunner!.id)}
                className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition border ${
                  isHorseTracked(targetRunner.id)
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : 'border-white/10 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Track horse"
              >
                <Star className={`w-3.5 h-3.5 ${isHorseTracked(targetRunner.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="hidden xs:inline">
                  {isHorseTracked(targetRunner.id) ? 'Tracked' : 'Track'}
                </span>
              </button>

              <button
                onClick={() => setSelectedRunnerId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Interactive 3D Cinematic Paddock Studio Stage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>3D STUDIO CONFORMATION STAGE · DRAG TO ROTATE 360°</span>
              <span className="text-emerald-400 font-bold">Post: {countdown.formattedCompact}</span>
            </div>
            <CinematicPaddockStage
              runner={targetRunner}
              race={targetRace}
              onAskAi={(name) => askAiBrain(`Analyze physical build and speed profile for ${name} in Race ${targetRace?.raceNumber}.`)}
            />
          </div>

          {/* Pedigree & Quick Details Row */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Trainer</span>
              <p className="font-bold text-white font-sans text-sm mt-0.5">{targetRunner.trainer}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Jockey & Weight</span>
              <p className="font-bold text-white font-sans text-sm mt-0.5">{targetRunner.jockey} ({targetRunner.weightKg}kg)</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Pedigree</span>
              <p className="font-bold text-slate-200 mt-0.5">{targetRunner.pedigree.sire} × {targetRunner.pedigree.dam}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Market Odds</span>
              <p className="font-bold text-emerald-400 text-sm mt-0.5">{targetRunner.odds.toFixed(2)} (Opening: {targetRunner.openingOdds.toFixed(2)})</p>
            </div>
          </div>

          {/* Model Intelligence View: Probability & Risk Assessment */}
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-950 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4" />
                Model Quantitative Assessment
              </span>
              <span className="font-mono text-lg font-black text-white">
                Win: <span className="text-emerald-400">{targetRunner.winProbability}%</span> · Place: {targetRunner.placeProbability}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-2">
                <span className="font-bold text-slate-200 font-mono">Key Strengths & Handicapping Signals:</span>
                <ul className="space-y-1 text-slate-300">
                  {targetRunner.keyReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-950/80 p-3.5 border border-white/10 space-y-1.5">
                <span className="font-bold text-rose-400 flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Key Risk / What Could Weaken It:
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {targetRunner.keyRisk}
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Favored Going:</span>
                  <span className="font-bold text-emerald-400">{targetRunner.favoredGoing.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Records Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Historical Career & Distance Records</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Career</div>
                <div className="text-base font-extrabold text-white mt-1">
                  {targetRunner.careerRecord.starts}: {targetRunner.careerRecord.wins}-{targetRunner.careerRecord.seconds}-{targetRunner.careerRecord.thirds}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {targetRunner.careerRecord.starts > 0 ? `${((targetRunner.careerRecord.wins / targetRunner.careerRecord.starts) * 100).toFixed(0)}% Win Rate` : 'Unraced'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">At Distance ({targetRace.distanceMeters}m)</div>
                <div className="text-base font-extrabold text-white mt-1">
                  {targetRunner.distanceRecord.starts}: {targetRunner.distanceRecord.wins}-{targetRunner.distanceRecord.seconds}-{targetRunner.distanceRecord.thirds}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">
                  Distance Proven
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">At Kolkata RCTC</div>
                <div className="text-base font-extrabold text-white mt-1">
                  {targetRunner.courseRecord.starts}: {targetRunner.courseRecord.wins}-{targetRunner.courseRecord.seconds}-{targetRunner.courseRecord.thirds}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Hastings Form
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Jockey/Trainer Strike</div>
                <div className="text-base font-extrabold text-emerald-400 mt-1">
                  {targetRunner.jockeyTrainerCombo.winRate}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {targetRunner.jockeyTrainerCombo.wins} wins / {targetRunner.jockeyTrainerCombo.starts} starts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
