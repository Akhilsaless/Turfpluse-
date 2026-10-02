import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Race } from '../types/racing';
import { calculateTimeRemaining } from '../utils/countdown';
import { Card3D } from './Card3D';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { 
  ArrowRight, 
  Search, 
  Trophy, 
  Clock, 
  Sparkles, 
  Bell, 
  Bot 
} from 'lucide-react';

const RaceCountdownBadge: React.FC<{ isoTime?: string; isFinished: boolean }> = ({ isoTime, isFinished }) => {
  const [cd, setCd] = React.useState(() => calculateTimeRemaining(isoTime));

  React.useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setCd(calculateTimeRemaining(isoTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [isoTime, isFinished]);

  if (isFinished) {
    return (
      <span className="font-mono text-[11px] font-bold text-slate-400">
        Finished
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-black/80 px-2.5 py-1 border border-white/10 text-[11px] font-mono font-bold text-emerald-400 shadow-inner">
      <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
      <span>{cd.formattedCompact}</span>
    </div>
  );
};

export const RacesScreen: React.FC = () => {
  const { meeting, setSelectedRaceId, myRaces, toggleTrackRace, isRaceTracked, askAiBrain } = useRacing();
  const [filterCategory, setFilterCategory] = useState<'all' | 'my_races' | 'classic' | 'sprint'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRaces = meeting.races.filter(race => {
    if (filterCategory === 'my_races' && !isRaceTracked(race.id)) return false;
    if (filterCategory === 'classic' && race.distanceMeters < 2000) return false;
    if (filterCategory === 'sprint' && race.distanceMeters > 1200) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRaceName = race.name.toLowerCase().includes(q);
      const matchRaceNum = `r${race.raceNumber}`.includes(q) || String(race.raceNumber) === q;
      const matchRunner = race.runners.some(r => r.name.toLowerCase().includes(q) || r.jockey.toLowerCase().includes(q) || r.trainer.toLowerCase().includes(q));
      return matchRaceName || matchRaceNum || matchRunner;
    }

    return true;
  });

  return (
    <div className="space-y-5 pb-28 sm:pb-20 animate-fade-in">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono">
          {[
            { id: 'all', label: 'All 10 Races' },
            { id: 'my_races', label: `My Races (${myRaces.length})` },
            { id: 'classic', label: 'Derby & Classics (2000m+)' },
            { id: 'sprint', label: 'Sprints (1100–1200m)' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id as any)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                filterCategory === f.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search race, horse, jockey..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
          />
        </div>
      </div>

      {/* Stacked 3D Race Cards R1 - R10 */}
      <div className="space-y-4">
        {filteredRaces.map(race => {
          const isDerby = race.raceNumber === 8;
          const isNext = race.status === 'Next';
          const isFinished = race.status === 'Finished';
          const activeRunners = race.runners.filter(r => r.status !== 'Scratched');
          const topPick = activeRunners.find(r => r.modelRole === 'Top Pick') || activeRunners[0];

          return (
            <Card3D
              key={race.id}
              onClick={() => setSelectedRaceId(race.id)}
              glowColor={isDerby ? 'rgba(245, 158, 11, 0.25)' : isNext ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)'}
              className={`cursor-pointer rounded-3xl border transition relative overflow-hidden ${
                isDerby
                  ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 shadow-2xl ring-1 ring-amber-500/30'
                  : isNext
                  ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 shadow-xl ring-1 ring-emerald-500/30'
                  : 'border-white/10 bg-slate-900/70 hover:border-white/20'
              }`}
            >
              {/* Header Ribbon for Derby or Next */}
              {isDerby && (
                <div className="bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent border-b border-amber-500/30 px-5 py-2 text-xs font-black text-amber-300 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>THE PREMIER KOLKATA DERBY 2026 (Gr.1) · ₹1.5 CRORE CLASSIC</span>
                  </div>
                  <span className="text-amber-300/80">Saturday, Oct 3 · 4:35 PM IST</span>
                </div>
              )}

              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Number, Title, Distance, Class */}
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-mono font-black text-2xl border ${
                      isDerby ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md' :
                      isNext ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md' :
                      'bg-slate-800 text-slate-100 border-white/10'
                    }`}>
                      R{race.raceNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-white">{race.time} IST</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300 font-medium">{race.distanceMeters}m ({race.raceClass})</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">{activeRunners.length} Runners</span>
                        <span className="text-slate-600">·</span>
                        <RaceCountdownBadge isoTime={race.isoTime} isFinished={isFinished} />
                      </div>

                      <h3 className="text-xl font-black text-white tracking-tight mt-1">
                        {race.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                        <span>Going: <strong className="text-emerald-400">{race.going}</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Confidence: <strong className={race.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{race.confidence}</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Prize: <strong className="text-slate-200">₹{race.prizeMoney}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Center-Right: Top Pick with Thoroughbred Silks Visualizer */}
                  <div className="flex flex-wrap items-center gap-3">
                    {topPick && (
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-black/60 p-2 px-3 shadow-inner">
                        <ThoroughbredVisualizer runner={topPick} size="sm" />
                        <div>
                          <div className="text-[10px] uppercase font-mono font-black text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Top Pick (#{topPick.saddleNumber})
                          </div>
                          <div className="text-xs font-black text-white truncate max-w-[120px]">{topPick.name}</div>
                          <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                            {topPick.jockey} · {topPick.odds.toFixed(2)}
                          </div>
                        </div>

                        <div className="text-right pl-3 border-l border-white/10 font-mono">
                          <span className="text-base font-black text-emerald-400">{topPick.winProbability}%</span>
                          <span className="text-[9px] text-slate-400 block leading-none">Win %</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          askAiBrain(`Provide an exact betting strategy and key risks for Race ${race.raceNumber} (${race.name}).`);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 transition border border-white/10"
                        title="Ask AI Brain about this race"
                      >
                        <Bot className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTrackRace(race.id);
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl transition border ${
                          isRaceTracked(race.id)
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-white/10'
                        }`}
                        title="Track race"
                      >
                        <Bell className={`w-4 h-4 ${isRaceTracked(race.id) ? 'fill-emerald-400' : ''}`} />
                      </button>

                      <button className="flex h-10 items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md">
                        <span>Card</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </div>
  );
};
