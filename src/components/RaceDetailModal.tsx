import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Race, Runner } from '../types/racing';
import { useRaceCountdown } from '../utils/countdown';
import { Card3D } from './Card3D';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { CinematicPaddockStage } from './CinematicPaddockStage';
import { 
  X, 
  ArrowLeft, 
  History, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronRight, 
  Clock, 
  Trophy, 
  ShieldCheck, 
  Bell, 
  Star,
  Bot
} from 'lucide-react';

export const RaceDetailModal: React.FC = () => {
  const { 
    meeting, 
    selectedRaceId, 
    setSelectedRaceId, 
    setSelectedRunnerId, 
    toggleTrackRace, 
    isRaceTracked, 
    toggleTrackHorse, 
    isHorseTracked, 
    askAiBrain 
  } = useRacing();

  const [activeTab, setActiveTab] = useState<'runners' | '3d_stage' | 'timeline' | 'speed_map'>('runners');

  const race = meeting.races.find(r => r.id === selectedRaceId);
  const countdown = useRaceCountdown(race?.isoTime ?? "2026-10-03T12:30:00+05:30");

  if (!selectedRaceId || !race) return null;
  const isDerby = race.raceNumber === 8;
  const activeRunners = race.runners.filter(r => r.status !== 'Scratched');
  const scratchedRunners = race.runners.filter(r => r.status === 'Scratched');
  const topPick = activeRunners.find(r => r.modelRole === 'Top Pick') || activeRunners[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md sm:p-4 overflow-hidden animate-fade-in">
      <div 
        style={{ perspective: 1200 }}
        className="flex flex-col w-full h-[94vh] sm:h-[90vh] max-w-4xl rounded-t-3xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#05080e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.15)] overflow-hidden"
      >
        {/* Top Specular Glow */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* Modal Top Header */}
        <div className="border-b border-white/10 bg-slate-900/80 px-5 py-4 shrink-0 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSelectedRaceId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className={`rounded-xl px-2 py-0.5 font-black ${
                    isDerby ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    R{race.raceNumber}
                  </span>
                  <span className="font-bold text-white">{race.time} IST</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">{race.distanceMeters}m ({race.raceClass})</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold">{race.going} ({race.penetrometer}cm)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  {race.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Real-time Oct 3rd Countdown */}
              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-black/80 px-3.5 py-1.5 border border-white/15 font-mono text-xs font-bold text-emerald-400 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{countdown.formattedFull}</span>
              </div>

              {/* Ask AI Brain */}
              <button
                onClick={() => askAiBrain(`Analyze Race ${race.raceNumber} (${race.name}) for the Oct 3rd meeting. Focus on draw advantage and betting structure.`)}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/70 transition"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ask Brain</span>
              </button>

              {/* Track Race */}
              <button
                onClick={() => toggleTrackRace(race.id)}
                className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition border ${
                  isRaceTracked(race.id)
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isRaceTracked(race.id) ? 'Tracked in My Races' : 'Add to My Races'}
              >
                <Bell className={`w-3.5 h-3.5 ${isRaceTracked(race.id) ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                <span className="hidden xs:inline">
                  {isRaceTracked(race.id) ? 'Tracked' : 'Track Race'}
                </span>
              </button>

              <button
                onClick={() => setSelectedRaceId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('runners')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'runners'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Runners & Silks ({activeRunners.length})
            </button>
            <button
              onClick={() => setActiveTab('3d_stage')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === '3d_stage'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              3D Cinematic Paddock Stage
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>'What Changed?' Timeline ({race.timeline.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('speed_map')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'speed_map'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Pace Map
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Derby Working Order Verified Notice */}
          {isDerby && race.workingOrderNote && (
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 p-4 text-xs text-amber-200 shadow-md">
              <div className="flex items-center gap-2 font-black text-amber-300 uppercase tracking-wide font-mono">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verified Pre-Race Provisional Order · RCTC Stewards</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-amber-100/90 leading-relaxed">
                {race.workingOrderNote}
              </p>
            </div>
          )}

          {/* TAB 1: RUNNERS WITH AUTHENTIC THOROUGHBRED VISUALIZER */}
          {activeTab === 'runners' && (
            <div className="space-y-4">
              {activeRunners.map(runner => {
                const isTop = runner.modelRole === 'Top Pick';
                const isDanger = runner.modelRole === 'Main Danger';
                const isValue = runner.modelRole === 'Value Watch';

                return (
                  <Card3D
                    key={runner.id}
                    glowColor={isTop ? 'rgba(16, 185, 129, 0.25)' : isDanger ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)'}
                    className={`rounded-3xl border p-4 sm:p-5 transition relative ${
                      isTop
                        ? 'border-emerald-500/60 bg-gradient-to-r from-[#122223] via-[#0d151c] to-[#070b10] shadow-lg ring-1 ring-emerald-500/30'
                        : isDanger
                        ? 'border-amber-500/50 bg-gradient-to-r from-[#1e1911] via-[#101319] to-[#080a0f]'
                        : isValue
                        ? 'border-sky-500/40 bg-gradient-to-r from-[#0d1c2b] via-[#0b111a] to-[#06080d]'
                        : 'border-white/10 bg-slate-900/50 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      
                      {/* Left: Thoroughbred Visualizer & Info */}
                      <div className="flex items-start gap-4">
                        <div 
                          onClick={() => setSelectedRunnerId(runner.id)}
                          className="cursor-pointer group"
                        >
                          <ThoroughbredVisualizer runner={runner} size="md" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 
                              onClick={() => setSelectedRunnerId(runner.id)}
                              className="text-base sm:text-lg font-black text-white hover:text-emerald-400 cursor-pointer flex items-center gap-1.5 transition"
                            >
                              <span>{runner.name}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </h3>

                            <button
                              onClick={() => toggleTrackHorse(runner.id)}
                              className={`p-1.5 rounded-xl transition ${
                                isHorseTracked(runner.id)
                                  ? 'text-amber-400 bg-amber-400/20 border border-amber-400/40'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                              title={isHorseTracked(runner.id) ? 'Tracked horse' : 'Track this horse'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isHorseTracked(runner.id) ? 'fill-amber-400' : ''}`} />
                            </button>

                            <span className="font-mono text-xs font-bold text-slate-400">
                              {runner.modelRole}
                            </span>
                          </div>

                          {/* Connections */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-mono">
                            <span>Jockey: <strong className="text-white font-sans">{runner.jockey}</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Trainer: <strong className="text-white font-sans">{runner.trainer}</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Weight: <strong className="text-white">{runner.weightKg}kg</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Draw: <strong className="text-white">Stall {runner.draw}</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Rating: <strong className="text-emerald-400">{runner.rating}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Odds, Model Probabilities & AI Brain Trigger */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 border-white/10 pt-2 lg:pt-0">
                        {/* Win & Place bars */}
                        <div className="text-right min-w-[110px] font-mono">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs text-slate-400">Win Prob:</span>
                            <span className="text-lg font-black text-white">
                              {runner.winProbability}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                            <span>Place:</span>
                            <span className="font-bold text-slate-300">{runner.placeProbability}%</span>
                          </div>
                        </div>

                        {/* Odds Badge */}
                        <div className="rounded-2xl bg-black/80 px-3.5 py-2 border border-white/10 text-center min-w-[75px] shadow-inner font-mono">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Odds</div>
                          <div className="text-sm font-extrabold text-white flex items-center justify-center gap-1">
                            <span>{runner.odds.toFixed(2)}</span>
                            {runner.oddsTrend === 'shortening' ? (
                              <span title="Shortening"><TrendingDown className="w-3.5 h-3.5 text-emerald-400" /></span>
                            ) : runner.oddsTrend === 'drifting' ? (
                              <span title="Drifting"><TrendingUp className="w-3.5 h-3.5 text-rose-400" /></span>
                            ) : (
                              <span title="Stable"><Minus className="w-3.5 h-3.5 text-slate-500" /></span>
                            )}
                          </div>
                        </div>

                        {/* Ask AI Brain about this runner */}
                        <button
                          onClick={() => askAiBrain(`Analyze runner ${runner.name} in Race ${race.raceNumber} (${race.name}). Review its speed rating of ${runner.rating}, jockey ${runner.jockey}, and chances on Good to Firm track.`)}
                          className="flex h-10 items-center gap-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition"
                          title={`Ask AI Brain about ${runner.name}`}
                        >
                          <Bot className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Brain Intel</span>
                        </button>

                        {/* Deep profile open button */}
                        <button
                          onClick={() => setSelectedRunnerId(runner.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-white/10"
                          title="Open Full Horse Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5 h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-white/10 p-[1px]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isTop ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : isDanger ? 'bg-gradient-to-r from-amber-500 to-amber-300' : isValue ? 'bg-gradient-to-r from-sky-500 to-cyan-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${runner.winProbability}%` }}
                      />
                    </div>

                    {/* Why Respected & Key Risk */}
                    <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Model Supporting Signals:
                        </span>
                        <ul className="space-y-0.5 text-slate-300">
                          {runner.keyReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                          Key Risk / Reason It Could Lose:
                        </span>
                        <p className="text-slate-300 leading-snug">
                          {runner.keyRisk}
                        </p>
                      </div>
                    </div>
                  </Card3D>
                );
              })}
            </div>
          )}

          {/* TAB 2: 3D CINEMATIC PADDOCK STAGE */}
          {activeTab === '3d_stage' && topPick && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-mono">
                Interactive 3D Studio Pedestal · Orbit & inspect thoroughbred conformation and owner racing silks.
              </div>
              <CinematicPaddockStage
                runner={topPick}
                race={race}
                onAskAi={(name) => askAiBrain(`Give me a conformation and tactical speed breakdown for ${name} in Race ${race.raceNumber}.`)}
              />
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Audit Trail & Prediction History</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Predictions are never silently overwritten. Every scratch, going revision, equipment adjustment, or jockey replacement generates an immutable timestamped snapshot.
                </p>
              </div>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {race.timeline.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-emerald-500 shadow-sm" />
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white text-sm">{entry.title}</span>
                        <span className="font-mono text-slate-400 text-xs bg-slate-950 px-2 py-0.5 rounded-lg border border-white/10">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PACE MAP */}
          {activeTab === 'speed_map' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10 text-xs text-slate-300">
                <h4 className="font-bold text-white text-sm mb-1 font-mono">Predicted Pace Map & Running Positions</h4>
                <p className="text-slate-400 text-xs">
                  Tactical distribution through the first 400m into the Hastings home bend.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950 p-5 space-y-4">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2 font-mono">
                    Leading The Pace (Front Runners)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Front Runner').map(r => (
                      <div key={r.id} className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2 font-mono">
                    Stalking The Speed (Prominent)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Prominent').map(r => (
                      <div key={r.id} className="rounded-xl bg-amber-950/30 border border-amber-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wide mb-2 font-mono">
                    Midfield Cover
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Mid-division').map(r => (
                      <div key={r.id} className="rounded-xl bg-sky-950/30 border border-sky-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2 font-mono">
                    Held Up Late (Deep Closers)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Late Closer').map(r => (
                      <div key={r.id} className="rounded-xl bg-purple-950/30 border border-purple-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

