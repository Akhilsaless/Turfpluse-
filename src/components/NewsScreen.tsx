import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { NewsItem } from '../types/racing';
import { 
  Newspaper, 
  ShieldCheck, 
  CloudSun, 
  Activity, 
  ArrowRight, 
  Tag, 
  Search,
  Filter
} from 'lucide-react';

export const NewsScreen: React.FC = () => {
  const { news, setSelectedRaceId } = useRacing();
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = news.filter(item => {
    if (filterSource !== 'all' && item.category !== filterSource) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        (item.relatedHorseName && item.relatedHorseName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-20 sm:pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              RCTC Official News & Steward Bulletins
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified race-day notices, track telemetry revisions, and paddock reports.
          </p>
        </div>

        {/* Source Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'official', label: 'Stewards' },
            { id: 'track', label: 'Track & Weather' },
            { id: 'stable', label: 'Stable Reports' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterSource(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                filterSource === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed List */}
      <div className="space-y-3">
        {filteredNews.map(item => {
          const isSteward = item.category === 'official';
          const isTrack = item.category === 'track';

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 sm:p-5 transition ${
                isSteward
                  ? 'border-amber-500/40 bg-slate-900/80 shadow-sm'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isSteward
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : isTrack
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.source}
                  </span>

                  {item.verified && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Official
                    </span>
                  )}
                </div>

                <span className="font-mono text-xs text-slate-400">{item.timestamp}</span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Action Link to affected race if available */}
              {item.relatedRaceId && (
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Linked to: {item.relatedHorseName ? `${item.relatedHorseName} in ` : ''}Race {item.relatedRaceId.toUpperCase()}
                  </span>

                  <button
                    onClick={() => setSelectedRaceId(item.relatedRaceId!)}
                    className="flex items-center gap-1 text-emerald-400 font-semibold hover:underline"
                  >
                    <span>View Racecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
