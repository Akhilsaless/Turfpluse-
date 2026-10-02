import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Runner, Race } from '../types/racing';
import { Card3D } from './Card3D';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { 
  Search, 
  ChevronRight, 
  Sparkles, 
  Compass, 
  Star,
  Bot
} from 'lucide-react';

export const HorsesScreen: React.FC = () => {
  const { 
    meeting, 
    setSelectedRaceId, 
    setSelectedRunnerId, 
    trackedHorses, 
    toggleTrackHorse, 
    isHorseTracked,
    askAiBrain
  } = useRacing();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tracked' | 'derby' | 'top_picks' | 'value'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'winProb' | 'odds' | 'name'>('rating');

  // Flatten all runners across the 10 races
  const allRunnersWithRace: { runner: Runner; race: Race }[] = [];
  meeting.races.forEach(race => {
    race.runners.forEach(runner => {
      allRunnersWithRace.push({ runner, race });
    });
  });

  const filtered = allRunnersWithRace.filter(({ runner, race }) => {
    if (filterType === 'tracked' && !isHorseTracked(runner.id)) return false;
    if (filterType === 'derby' && race.raceNumber !== 8) return false;
    if (filterType === 'top_picks' && runner.modelRole !== 'Top Pick') return false;
    if (filterType === 'value' && runner.modelRole !== 'Value Watch') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = runner.name.toLowerCase().includes(q);
      const matchJockey = runner.jockey.toLowerCase().includes(q);
      const matchTrainer = runner.trainer.toLowerCase().includes(q);
      const matchSire = runner.pedigree.sire.toLowerCase().includes(q);
      return matchName || matchJockey || matchTrainer || matchSire;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'rating') return b.runner.rating - a.runner.rating;
    if (sortBy === 'winProb') return b.runner.winProbability - a.runner.winProbability;
    if (sortBy === 'odds') return a.runner.odds - b.runner.odds;
    return a.runner.name.localeCompare(b.runner.name);
  });

  return (
    <div className="space-y-5 pb-28 sm:pb-20 animate-fade-in">
      {/* Header and Controls */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e1626]/90 to-slate-900/80 p-5 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-mono uppercase">
                Declared Thoroughbred Directory
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Profiles for all {allRunnersWithRace.length} declared thoroughbreds and jockeys for October 3, 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="rating">Highest Rating</option>
              <option value="winProb">Win Probability %</option>
              <option value="odds">Lowest Odds</option>
              <option value="name">Horse Name</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono">
            {[
              { id: 'all', label: `All (${allRunnersWithRace.length})` },
              { id: 'tracked', label: `Tracked (${trackedHorses.length})` },
              { id: 'derby', label: 'Derby (R8)' },
              { id: 'top_picks', label: 'Top Picks' },
              { id: 'value', label: 'Value Picks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                  filterType === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search horse, sire, jockey..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>
        </div>
      </div>

      {/* Runner Grid with Thoroughbred Silks Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(({ runner, race }) => {
          const isTop = runner.modelRole === 'Top Pick';
          const isDanger = runner.modelRole === 'Main Danger';
          const isScratched = runner.status === 'Scratched';

          return (
            <Card3D
              key={`${race.id}-${runner.id}`}
              onClick={() => {
                setSelectedRaceId(race.id);
                setSelectedRunnerId(runner.id);
              }}
              glowColor={isTop ? 'rgba(16, 185, 129, 0.25)' : isDanger ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)'}
              className={`cursor-pointer rounded-3xl border p-4 transition relative ${
                isScratched
                  ? 'border-rose-950 bg-slate-950/40 opacity-70'
                  : isTop
                  ? 'border-emerald-500/60 bg-gradient-to-r from-[#122223] to-[#0c141d] shadow-xl ring-1 ring-emerald-500/30'
                  : isDanger
                  ? 'border-amber-500/50 bg-gradient-to-r from-[#1c1811] to-[#0e1218]'
                  : 'border-white/10 bg-slate-900/60 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <ThoroughbredVisualizer runner={runner} size="md" />

                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-base font-black text-white flex items-center gap-1.5">
                        <span className={isScratched ? 'line-through text-slate-400' : ''}>
                          {runner.name}
                        </span>
                      </h3>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTrackHorse(runner.id);
                        }}
                        className={`p-1 rounded-xl transition ${
                          isHorseTracked(runner.id)
                            ? 'text-amber-400 bg-amber-400/20 border border-amber-400/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Track horse"
                      >
                        <Star className={`w-3.5 h-3.5 ${isHorseTracked(runner.id) ? 'fill-amber-400' : ''}`} />
                      </button>

                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        R{race.raceNumber} ({race.time})
                      </span>
                    </div>

                    <div className="mt-1.5 text-xs text-slate-300 font-mono">
                      <span>Jockey: <strong className="text-white font-sans">{runner.jockey}</strong></span>
                      <span className="text-slate-600"> · </span>
                      <span>{runner.trainer}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400 font-mono">
                      <span>Sire: {runner.pedigree.sire}</span>
                      <span className="text-slate-600"> · </span>
                      <span>{runner.runningStyle}</span>
                    </div>
                  </div>
                </div>

                {/* Right Badges */}
                <div className="text-right flex flex-col items-end gap-1.5 font-mono">
                  {!isScratched ? (
                    <div>
                      <span className="text-base font-black text-emerald-400">
                        {runner.winProbability}%
                      </span>
                      <span className="text-[9px] text-slate-400 block uppercase">Win Prob</span>
                    </div>
                  ) : (
                    <span className="rounded-full bg-rose-950/80 border border-rose-800 px-2 py-0.5 text-[9px] font-bold text-rose-300">
                      Scratched
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      askAiBrain(`Provide a handicap review for ${runner.name} in Race ${race.raceNumber} (${race.name}) on Oct 3rd.`);
                    }}
                    className="flex items-center gap-1 rounded-xl bg-slate-800 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-slate-700 transition"
                  >
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span>Intel</span>
                  </button>
                </div>
              </div>

              {/* Stats Footer Bar */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span>Rating: <strong className="text-emerald-400">{runner.rating}</strong></span>
                  <span className="text-slate-600">·</span>
                  <span>Weight: <strong className="text-slate-200">{runner.weightKg}kg</strong></span>
                  <span className="text-slate-600">·</span>
                  <span>Odds: <strong className="text-white">{runner.odds.toFixed(2)}</strong></span>
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 transition">
                  <span className="text-[10px] font-bold">3D Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </div>
  );
};
