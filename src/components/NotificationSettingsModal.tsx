import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Race } from '../types/racing';
import { 
  Bell, 
  X, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Check, 
  Trash2, 
  Sparkles, 
  Play, 
  ShieldCheck, 
  Compass, 
  Calendar 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    myRaces, 
    toggleTrackRace, 
    trackedHorses, 
    toggleTrackHorse, 
    meeting, 
    pushPermission, 
    requestPushPermission, 
    soundEnabled, 
    setSoundEnabled, 
    triggerTestAlert,
    setSelectedRaceId,
    setSelectedRunnerId
  } = useRacing();

  const [requestingPush, setRequestingPush] = useState(false);

  if (!isOpen) return null;

  const handlePushClick = async () => {
    setRequestingPush(true);
    await requestPushPermission();
    setRequestingPush(false);
  };

  // Find runner details for tracked horses
  const trackedHorseDetails = trackedHorses.map(runnerId => {
    for (const r of meeting.races) {
      const runner = r.runners.find(h => h.id === runnerId);
      if (runner) {
        return { runner, race: r };
      }
    }
    return null;
  }).filter(Boolean) as { runner: any; race: any }[];

  // Find race details for My Races
  const myRaceDetails = myRaces.map(raceId => {
    return meeting.races.find(r => r.id === raceId);
  }).filter((r): r is Race => Boolean(r));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alerts & Watchlist Centre</h3>
              <p className="text-xs text-slate-400">Manage race start notifications and tracked contenders.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Audio & Push Permissions Controls */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="font-bold text-white text-xs">Audio Chime Alerts</div>
                  <div className="text-[11px] text-slate-400">Plays track chime when a tracked horse goes to post.</div>
                </div>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Browser Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-bold text-white text-xs">Device Push Notifications</div>
                  <div className="text-[11px] text-slate-400">
                    Status: <span className="font-semibold text-slate-200 uppercase">{pushPermission}</span>
                  </div>
                </div>
              </div>

              {pushPermission === 'granted' ? (
                <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                  Enabled
                </span>
              ) : (
                <button
                  onClick={handlePushClick}
                  disabled={requestingPush || pushPermission === 'denied'}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 font-semibold text-white hover:bg-sky-500 transition disabled:opacity-50 text-[11px]"
                >
                  {pushPermission === 'denied' ? 'Blocked in Browser' : 'Enable Push'}
                </button>
              )}
            </div>

            {/* Send Test Alert Button */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Want to test sound and toast preview?</span>
              <button
                onClick={triggerTestAlert}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 hover:text-white hover:bg-slate-700 font-medium transition text-[11px]"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Test Alert Now</span>
              </button>
            </div>
          </div>

          {/* Section: Tracked Horses */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tracked Horses ({trackedHorses.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">Notifies when horse goes to post</span>
            </div>

            {trackedHorseDetails.length === 0 ? (
              <div className="rounded-xl bg-slate-900/40 p-4 text-center text-slate-400 border border-slate-800/80">
                No horses currently tracked. Tap the bell/star icon on any horse in the racecard to track it.
              </div>
            ) : (
              <div className="space-y-2">
                {trackedHorseDetails.map(({ runner, race }) => (
                  <div
                    key={runner.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between"
                  >
                    <div 
                      onClick={() => {
                        setSelectedRaceId(race.id);
                        setSelectedRunnerId(runner.id);
                        onClose();
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white hover:text-emerald-400 transition">{runner.name}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
                          R{race.raceNumber} (#{runner.saddleNumber})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {runner.jockey} • Odds {runner.odds.toFixed(2)} • {runner.winProbability}% Win
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTrackHorse(runner.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Untrack horse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: My Races */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>My Races Watchlist ({myRaces.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">Notifies 5m & 2m before post</span>
            </div>

            {myRaceDetails.length === 0 ? (
              <div className="rounded-xl bg-slate-900/40 p-4 text-center text-slate-400 border border-slate-800/80">
                No races added to My Races. Tap the bell icon on any race card to track it.
              </div>
            ) : (
              <div className="space-y-2">
                {myRaceDetails.map(race => (
                  <div
                    key={race.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between"
                  >
                    <div 
                      onClick={() => {
                        setSelectedRaceId(race.id);
                        onClose();
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800 font-mono font-bold px-1.5 py-0.2 text-[10px] text-emerald-400">
                          R{race.raceNumber}
                        </span>
                        <span className="font-bold text-white hover:text-emerald-400 transition">{race.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {race.time} IST • {race.distanceMeters}m • {race.status}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTrackRace(race.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Remove from My Races"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-900/60 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
