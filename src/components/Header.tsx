import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Download, 
  RotateCcw, 
  SlidersHorizontal, 
  Thermometer, 
  Wind, 
  Activity, 
  Info,
  X,
  Bell,
  Bot,
  Zap,
  FileText
} from 'lucide-react';
import { NotificationSettingsModal } from './NotificationSettingsModal';

export const Header: React.FC = () => {
  const { 
    meeting, 
    lastUpdateTimestamp, 
    resetToInitialMeeting, 
    setSimulatorOpen, 
    myRaces, 
    trackedHorses,
    setAiBrainOpen
  } = useRacing();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  const totalTracked = myRaces.length + trackedHorses.length;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-amber-500/20 p-1 border border-emerald-500/30 shadow-inner">
                <img src="/icon.svg" alt="TurfPulse Logo" className="h-full w-full object-contain" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    TURFPULSE
                    <span className="hidden sm:inline-block rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
                      RCTC Kolkata
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                  <span>Sat, 3 Oct 2026</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">{meeting.trackCondition} ({meeting.penetrometer}cm)</span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Environmental Status */}
            <div className="flex items-center gap-2">
              {/* Meeting info modal button */}
              <button
                onClick={() => setShowMeetingInfo(!showMeetingInfo)}
                className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                title="View course condition & weather"
              >
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>29°C</span>
                <span className="text-slate-600">|</span>
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>9 km/h</span>
              </button>

              {/* AI Brain Button */}
              <button
                onClick={() => setAiBrainOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-950/60 to-slate-900 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:border-emerald-400 hover:text-white transition shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                title="Open TurfPulse AI Brain (Grok & Gemini Intelligence)"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">AI Brain</span>
                <span className="rounded bg-emerald-400/20 px-1 py-0.2 text-[9px] font-black text-emerald-400 uppercase">
                  Grok
                </span>
              </button>

              {/* Alerts & Watchlist Center Button */}
              <button
                onClick={() => setShowAlertsModal(true)}
                className={`relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  totalTracked > 0
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Manage Tracked Horses & My Races Alerts"
              >
                <Bell className={`w-3.5 h-3.5 ${totalTracked > 0 ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden xs:inline">Alerts</span>
                {totalTracked > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-slate-950">
                    {totalTracked}
                  </span>
                )}
              </button>

              {/* Live Simulator Button */}
              <button
                onClick={() => setSimulatorOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition shadow-sm"
                title="Simulate scratches, going changes, jockey changes & official results"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Live Lab</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              {/* Export Code for GPT Audit Button */}
              <a
                href="/turfpulse_codebase_audit.md"
                download="turfpulse_codebase_audit.md"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/20 transition shadow-sm"
                title="Download full codebase bundle to verify or share with GPT"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Code (GPT)</span>
              </a>

              {/* Install PWA Button */}
              {!isInstalled && isInstallable && (
                <button
                  onClick={install}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
                  title="Install TurfPulse PWA to Home Screen"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )}

              {!isInstalled && isIOS && (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Install iOS</span>
                </button>
              )}

              {/* Reset to initial meeting data */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Reset to official 3 October declarations"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Sub-bar */}
        <div className="border-t border-slate-800/60 bg-slate-950/50 px-4 py-1 sm:px-6">
          <div className="mx-auto max-w-6xl flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                PILOT MEETING
              </span>
              <span className="text-slate-700">•</span>
              <span className="truncate">RCTC Kolkata Derby Race Day (10 Declared Races)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 shrink-0">
              <span>Updated:</span>
              <span className="font-mono text-slate-300 font-medium">{lastUpdateTimestamp}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Course Info Modal */}
      {showMeetingInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">RCTC Kolkata Meeting Brief</h3>
              </div>
              <button 
                onClick={() => setShowMeetingInfo(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Venue:</span>
                  <span className="font-semibold text-white">Royal Calcutta Turf Club, Kolkata</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Track Type:</span>
                  <span className="font-semibold text-white">Right-Hand Turf Course (Hastings)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Official Going:</span>
                  <span className="font-semibold text-emerald-400">Good to Firm (Penetrometer 3.6cm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rail Configuration:</span>
                  <span className="font-semibold text-white">True position (No false rail)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Weather Telemetry:</span>
                  <span className="font-semibold text-white">29°C • Clear • Easterly 9 km/h</span>
                </div>
              </div>

              <p className="text-slate-400">
                <strong className="text-slate-200">Track Bias Note:</strong> Under current Good to Firm readings with the rail in true position, low barrier draws (1-4) hold a noticeable statistical edge in sprints (1100m-1400m). In distance races (2000m-2400m Derby), tactical stamina and closing turns take precedence.
              </p>
            </div>

            <button
              onClick={() => setShowMeetingInfo(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari PWA Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Install TurfPulse on iPhone
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              To install this race intelligence web app on your home screen for rapid trackside access:
            </p>
            <ol className="mt-3 space-y-2 rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">1</span>
                <span>Tap the <strong className="text-white">Share</strong> icon in the bottom Safari toolbar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">2</span>
                <span>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">3</span>
                <span>Tap <strong className="text-emerald-400">Add</strong> at top right to launch full-screen.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Reset Official Declarations?
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              This will restore the canonical October 3 RCTC meeting state, clearing any simulated scratches, custom going adjustments, or test results.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToInitialMeeting();
                  setShowResetConfirm(false);
                }}
                className="flex-1 rounded-xl bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts & Watchlist Settings Modal */}
      <NotificationSettingsModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
      />
    </>
  );
};
