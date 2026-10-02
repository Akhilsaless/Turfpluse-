/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RacingProvider, useRacing } from './context/RacingContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LiveScreen } from './components/LiveScreen';
import { RacesScreen } from './components/RacesScreen';
import { HorsesScreen } from './components/HorsesScreen';
import { NewsScreen } from './components/NewsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { RaceDetailModal } from './components/RaceDetailModal';
import { HorseProfileModal } from './components/HorseProfileModal';
import { LiveSimulatorModal } from './components/LiveSimulatorModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ToastAlertContainer } from './components/ToastAlertContainer';
import { AIBrainModal } from './components/AIBrainModal';
import { AIBrainFloatingButton } from './components/AIBrainFloatingButton';

const MainContent: React.FC = () => {
  const { activeTab } = useRacing();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-5">
      {activeTab === 'live' && <LiveScreen />}
      {activeTab === 'races' && <RacesScreen />}
      {activeTab === 'horses' && <HorsesScreen />}
      {activeTab === 'news' && <NewsScreen />}
      {activeTab === 'history' && <HistoryScreen />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { aiBrainOpen, setAiBrainOpen, aiBrainQuery } = useRacing();

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Background Subtle Radial Lighting Mesh */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 90% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 10% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 40%)
          `
        }}
      />

      {/* Fixed Header */}
      <div className="relative z-30">
        <Header />
      </div>

      {/* Primary 5-item Navigation */}
      <div className="relative z-30">
        <Navigation />
      </div>

      {/* Dynamic View Router */}
      <div className="flex-1 relative z-10">
        <MainContent />
      </div>

      {/* Detail Modals & Drawers */}
      <RaceDetailModal />
      <HorseProfileModal />
      <LiveSimulatorModal />

      {/* TurfPulse AI Brain Modal (Grok & Gemini) */}
      <AIBrainModal
        isOpen={aiBrainOpen}
        onClose={() => setAiBrainOpen(false)}
        initialQuery={aiBrainQuery}
      />

      {/* Floating 3D AI Brain Persistent Button */}
      <AIBrainFloatingButton onClick={() => setAiBrainOpen(true)} />

      {/* Toast Alert Notifications System */}
      <ToastAlertContainer />

      {/* Connectivity Offline Banner */}
      <OfflineIndicator />

      {/* Subtle Desktop Footer */}
      <footer className="hidden sm:block border-t border-white/10 bg-slate-950/80 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TurfPulse Intelligence</span>
            <span>•</span>
            <span>Royal Calcutta Turf Club (RCTC) Kolkata Autumn Meeting • 3 October 2026</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Powered by Grok AI & Gemini Quantitative Racing Engine. Model estimates do not guarantee financial returns.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RacingProvider>
      <AppShell />
    </RacingProvider>
  );
}
