import React from 'react';
import { Bot, Sparkles, Zap } from 'lucide-react';

interface AIBrainFloatingButtonProps {
  onClick: () => void;
}

export const AIBrainFloatingButton: React.FC<AIBrainFloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 sm:bottom-6 right-5 z-40 group flex items-center gap-2.5 rounded-full p-1.5 pr-4 border border-emerald-400/40 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/90 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-xl hover:scale-105 hover:border-emerald-400 transition-all duration-300"
      title="Open TurfPulse AI Brain (Grok & Gemini Handicapper)"
    >
      {/* 3D Glowing Orb */}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(16,185,129,0.6)]">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
          <Bot className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>

      <div className="text-left">
        <div className="flex items-center gap-1">
          <span className="text-xs font-black tracking-tight text-white group-hover:text-emerald-300 transition">
            AI Brain
          </span>
          <span className="rounded bg-emerald-400/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400 uppercase">
            Grok
          </span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>Ask Anything</span>
        </div>
      </div>
    </button>
  );
};
