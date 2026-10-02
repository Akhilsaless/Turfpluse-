import React, { useEffect } from 'react';
import { useRacing } from '../context/RacingContext';
import { 
  Bell, 
  X, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Trophy, 
  Volume2, 
  VolumeX,
  Compass
} from 'lucide-react';

export const ToastAlertContainer: React.FC = () => {
  const { toasts, dismissToast, setSelectedRaceId, setSelectedRunnerId } = useRacing();

  // Auto-dismiss toasts after 8 seconds unless interacted with
  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[0];
    const timer = setTimeout(() => {
      dismissToast(latest.id);
    }, 8500);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-0 left-0 sm:left-auto sm:right-6 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        const isHorse = toast.type === 'horse_starting';
        const isRace = toast.type === 'race_starting';
        const isScratch = toast.type === 'scratch';
        const isResult = toast.type === 'result';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
              isScratch
                ? 'border-rose-500/50 bg-rose-950/90 text-rose-100'
                : isResult
                ? 'border-amber-500/50 bg-amber-950/90 text-amber-100'
                : isHorse
                ? 'border-emerald-500/50 bg-slate-900/95 text-slate-100 ring-1 ring-emerald-500/30'
                : 'border-sky-500/50 bg-slate-900/95 text-slate-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isScratch
                    ? 'bg-rose-500 text-white'
                    : isResult
                    ? 'bg-amber-500 text-slate-950'
                    : isHorse
                    ? 'bg-emerald-500 text-slate-950 animate-pulse'
                    : 'bg-sky-500 text-slate-950'
                }`}>
                  {isScratch ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isResult ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isScratch
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        : isResult
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : isHorse
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    }`}>
                      {isScratch ? 'Scratch Notice' : isResult ? 'Official Result' : isHorse ? 'Tracked Horse' : 'My Races'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{toast.timestamp}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 shrink-0 transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Live Race-Day Alert</span>
              </span>

              <div className="flex items-center gap-2">
                {toast.raceId && (
                  <button
                    onClick={() => {
                      setSelectedRaceId(toast.raceId!);
                      if (toast.runnerId) setSelectedRunnerId(toast.runnerId);
                      dismissToast(toast.id);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-500 transition text-xs shadow-sm"
                  >
                    <span>View Card</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
