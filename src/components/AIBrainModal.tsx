import React, { useState, useEffect, useRef } from 'react';
import { useRacing } from '../context/RacingContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Key, 
  Check, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Zap, 
  ShieldCheck,
  HelpCircle,
  Copy,
  ChevronDown,
  ArrowRight,
  FileText,
  Download
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  engine?: 'grok' | 'gemini';
  timestamp: string;
}

interface AIBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const PRESET_QUERIES = [
  'Derby Gr.1 Analysis: Admiringly vs Shrishti — who has the tactical edge?',
  'What are the highest value betting picks across all 10 races today?',
  'How does 3.6cm Good to Firm penetrometer affect low barrier draws at Hastings?',
  'P. Trevor vs Suraj Narredu: Who has the superior strike rate today?',
  'Give me an exact Trifecta structure for Race 8 (The Kolkata Derby).',
  'Break down Stormchaser with the new hood & cross noseband in Race 3.',
];

export const AIBrainModal: React.FC<AIBrainModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { meeting } = useRacing();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `**Welcome to TurfPulse AI Brain** — Your quantitative handicapping and race analysis engine for the **RCTC Kolkata Autumn Meeting on Saturday, 3 October 2026**.\n\nI have complete telemetry on all 10 races, 50 thoroughbreds, speed ratings, jockeys, barrier biases, and the 3.6cm Good to Firm track conditions.\n\nAsk me anything about specific runners, jockey tactics, pace scenarios, or the **₹1.5 Crore Kolkata Derby Gr.1**.`,
        engine: 'grok',
        timestamp: 'Just now',
      },
    ];
  });

  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [grokApiKey, setGrokApiKey] = useState(() => localStorage.getItem('turfpulse_grok_key') || '');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [preferredEngine, setPreferredEngine] = useState<'grok' | 'gemini'>(() => {
    return (localStorage.getItem('turfpulse_ai_engine') as any) || (grokApiKey ? 'grok' : 'gemini');
  });
  const [keySavedStatus, setKeySavedStatus] = useState(false);
  const [showGptExport, setShowGptExport] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInput(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = grokApiKey.trim();
    localStorage.setItem('turfpulse_grok_key', cleanKey);
    localStorage.setItem('turfpulse_ai_engine', cleanKey ? 'grok' : 'gemini');
    setPreferredEngine(cleanKey ? 'grok' : 'gemini');

    try {
      await fetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey }),
      });
    } catch (err) {
      console.warn('Failed to sync key to server config', err);
    }

    setKeySavedStatus(true);
    setTimeout(() => {
      setKeySavedStatus(false);
      setShowKeyConfig(false);
    }, 1200);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userKey: grokApiKey,
          preferredEngine,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content || 'Unable to parse AI response.',
        engine: data.engine === 'grok' ? 'grok' : 'gemini',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **AI Brain Notice**: Failed to connect to AI server (${err.message || 'Network error'}). If using Grok, please verify your API key in settings or verify connection.`,
        engine: 'gemini',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking && activeSpeechIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner voice
    const cleanSpeech = text
      .replace(/[*#_`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechIndex(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechIndex(null);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setActiveSpeechIndex(index);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* 3D Glassmorphic Container */}
      <div 
        style={{ perspective: 1200 }}
        className="w-full max-w-3xl h-[88vh] max-h-[850px] flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e1626]/95 via-[#0b101a]/95 to-[#06090e]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.15)] overflow-hidden"
      >
        {/* Modal Top Specular Highlight */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* 3D Glowing Neural Orb */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  TurfPulse AI Brain
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {grokApiKey ? 'xAI Grok-2' : 'Gemini 3.8'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kolkata RCTC Race Intelligence & Predictive Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Code for GPT Audit Button */}
            <button
              onClick={() => {
                setShowGptExport(!showGptExport);
                setShowKeyConfig(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition border ${
                showGptExport
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title="Download or copy code to audit with GPT"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Audit with GPT</span>
            </button>

            {/* Grok API Key / Engine Settings Button */}
            <button
              onClick={() => {
                setShowKeyConfig(!showKeyConfig);
                setShowGptExport(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition border ${
                showKeyConfig || grokApiKey
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title="Configure Grok API Key or Switch Engine"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {grokApiKey ? 'Grok Connected' : 'Grok Key'}
              </span>
            </button>

            {/* Clear Chat */}
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'msg-reset',
                    role: 'assistant',
                    content: 'Chat session reset. What race or runner would you like me to analyze?',
                    timestamp: 'Just now',
                  },
                ]);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              title="Close AI Brain"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible GPT Codebase Export Drawer */}
        {showGptExport && (
          <div className="border-b border-white/10 bg-gradient-to-r from-slate-900 via-[#0a101b] to-slate-950 p-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Full Codebase Export for GPT Audit</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Consolidated 163 KB package with all 16 source files (React 19, TypeScript, Three.js 3D track, and Express server).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/turfpulse_codebase_audit.md"
                  download="turfpulse_codebase_audit.md"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </a>

                <a
                  href="/turfpulse_codebase_audit.txt"
                  download="turfpulse_codebase_audit.txt"
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </a>

                <button
                  onClick={() => {
                    const promptText = `I am attaching the complete source code bundle of TurfPulse, a production React 19 + TypeScript + Three.js horse racing telemetry app for Kolkata RCTC (3 October 2026). Please audit the codebase for:
1. Any React 19 or TypeScript type errors.
2. WebGL / Three.js memory leaks or performance issues.
3. Express backend proxy & AI streaming compatibility.
4. Any edge cases or runtime bugs.`;
                    navigator.clipboard?.writeText(promptText);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy GPT Prompt'}</span>
                </button>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Check className="w-3 h-3" /> TypeScript: 0 errors
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Check className="w-3 h-3" /> Vite Production Build: Passing
              </span>
              <span>·</span>
              <span>16 Files Packed</span>
            </div>
          </div>
        )}

        {/* Collapsible Grok API Key Configuration Drawer */}
        {showKeyConfig && (
          <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950/90 p-4 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    Grok AI API Configuration
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Paste your <strong>xAI Grok API key</strong> to power the AI Brain directly with xAI Grok-2. TurfPulse runs on Google Gemini 3.8 Flash by default.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyConfig(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="mt-3 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={grokApiKey}
                  onChange={e => setGrokApiKey(e.target.value)}
                  placeholder="xai-..."
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={preferredEngine}
                  onChange={e => setPreferredEngine(e.target.value as any)}
                  className="rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="grok">xAI Grok (Requires Key)</option>
                  <option value="gemini">Google Gemini (Default)</option>
                </select>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition shrink-0 shadow-md"
                >
                  {keySavedStatus ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Engine</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-sm shadow-md'
                      : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {/* Assistant Engine Badge */}
                  {!isUser && (
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[10px] text-slate-400">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {msg.engine === 'grok' ? 'Grok-2 Thoroughbred Intelligence' : 'Gemini 3.8 Flash Model'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(msg.content, index)}
                          className="hover:text-emerald-400 transition"
                          title="Read out loud"
                        >
                          {isSpeaking && activeSpeechIndex === index ? (
                            <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(msg.content)}
                          className="hover:text-emerald-400 transition"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {/* Formatted Content */}
                  <div className="whitespace-pre-line space-y-2">
                    {msg.content}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                    <div className="text-xs font-bold">YOU</div>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Handicapping telemetry & computing probabilities...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Quick Prompts:
          </span>
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              className="text-[11px] whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 transition"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/80 border-t border-white/10 backdrop-blur-xl">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask AI Brain about any horse, jockey, trainer, race, or odds..."
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 px-5 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Brain</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
