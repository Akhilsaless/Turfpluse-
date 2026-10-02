import React from 'react';
import { useRacing } from '../context/RacingContext';
import { Flame, Calendar, Compass, Newspaper, BarChart3 } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, meeting, news } = useRacing();

  // Find next race number
  const nextRace = meeting.races.find(r => r.status === 'Next' || r.status === 'Live' || r.status === 'Going to Post');

  const navItems = [
    {
      id: 'live' as const,
      label: 'Live',
      icon: Flame,
      badge: nextRace ? `R${nextRace.raceNumber}` : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
    },
    {
      id: 'races' as const,
      label: 'Races',
      icon: Calendar,
      badge: '10',
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'horses' as const,
      label: 'Horses',
      icon: Compass,
    },
    {
      id: 'news' as const,
      label: 'News',
      icon: Newspaper,
      badge: news.length > 0 ? String(news.length) : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Desktop Top Sub-Navbar */}
      <nav className="hidden sm:block border-b border-slate-800 bg-slate-900/60 sticky top-24 z-30 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-12 items-center justify-between gap-1">
            <div className="flex items-center space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`ml-1 rounded px-1.5 py-0.2 text-[10px] ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Track Intelligence Model v1.0</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Fixed Nav Bar (5 items max) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-lg pb-safe">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition relative ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 stroke-[2.2]' : 'text-slate-400'}`} />
                  {item.badge && (
                    <span className={`absolute -top-1.5 -right-3 rounded-full px-1 py-0.2 text-[9px] font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
