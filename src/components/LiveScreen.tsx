import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Race, Runner } from '../types/racing';
import { useRaceCountdown } from '../utils/countdown';
import { Card3D } from './Card3D';
import { Racecourse3D } from './Racecourse3D';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { 
  Clock, 
  ArrowRight, 
  Trophy, 
  Sparkles, 
  Bell, 
  Star,
  Bot,
  Zap,
  Share2,
  Download,
  Check,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const LiveScreen: React.FC = () => {
  const { 
    meeting, 
    news, 
    setSelectedRaceId, 
    setSelectedRunnerId, 
    toggleTrackRace, 
    isRaceTracked, 
    toggleTrackHorse, 
    isHorseTracked, 
    askAiBrain 
  } = useRacing();

  const { isInstallable, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [selected3DRunnerId, setSelected3DRunnerId] = useState<string | null>(null);

  // Find next race or first upcoming race
  const nextRace = meeting.races.find(r => r.status === 'Next' || r.status === 'Live' || r.status === 'Going to Post') 
    || meeting.races.find(r => r.status === 'Upcoming')
    || meeting.races[0];

  // Authentic countdown to October 3, 2026 post time
  const countdown = useRaceCountdown(nextRace.isoTime);

  // Remaining upcoming races (excluding Next race)
  const remainingRaces = meeting.races.filter(r => r.id !== nextRace?.id && r.status === 'Upcoming');

  // Completed races
  const completedRaces = meeting.races.filter(r => r.status === 'Finished');

  // Latest steward bulletin
  const latestAlert = news[0];

  // Top 3 runners of next race
  const sortedNextRunners = nextRace
    ? [...nextRace.runners]
        .filter(r => r.status !== 'Scratched')
        .sort((a, b) => b.winProbability - a.winProbability)
        .slice(0, 3)
    : [];

  const topPickRunner = sortedNextRunners[0];

  const handleShare = async () => {
    const shareData = {
      title: 'TurfPulse — RCTC Kolkata Racing Intelligence',
      text: `Live Telemetry & AI Brain for RCTC Kolkata Autumn Meeting (3 October 2026). Next up: Race ${nextRace.raceNumber} (${nextRace.name}).`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copy
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-20 animate-fade-in">
      {/* Broadcast Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono font-bold tracking-tight text-white uppercase">
            RCTC HASTINGS LIVE TELEMETRY
          </span>
          <span className="text-slate-600">·</span>
          <span>Saturday, 3 October 2026</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-mono font-semibold">Penetrometer 3.6cm (Good to Firm)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share App Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:border-white/20 transition shadow-sm"
            title="Share this live racecard with friends or bettors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Share App</span>
              </>
            )}
          </button>

          {/* Install PWA Button */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition"
              title="Download & Install TurfPulse PWA to Home Screen"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download App</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Stewards Verified Bulletin */}
      {latestAlert && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0c121d] p-4 text-xs text-slate-300 shadow-xl flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20 font-mono text-[10px] font-bold">
            RCTC
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white text-sm">{latestAlert.title}</span>
              <span className="text-[11px] text-slate-400 font-mono">[{latestAlert.timestamp}]</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                VERIFIED STEWARDS REPORT
              </span>
            </div>
            <p className="mt-1 text-slate-300 leading-relaxed">{latestAlert.summary}</p>
          </div>
        </div>
      )}

      {/* 3D WEBGL HASTINGS RACECOURSE STAGE */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <span>3D Interactive Racecourse Telemetry</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-emerald-400 font-normal">Hastings Turf Track (2200m Oval)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Interactive WebGL 3D Camera
          </span>
        </div>

        <Racecourse3D
          race={nextRace}
          selectedRunnerId={selected3DRunnerId || topPickRunner?.id || null}
          onSelectRunner={(id) => {
            setSelected3DRunnerId(id);
            setSelectedRunnerId(id);
          }}
        />
      </section>

      {/* Prominent NEXT RACE Panel - 3D Broadcast Presentation */}
      {nextRace && (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f172a] via-[#0a0f18] to-[#06090e] p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.12)]">
          {/* Top Edge Specular Reflection */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          {/* Race Header Info */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/10 pb-6">
            <div className="flex items-start gap-4">
              {/* 3D Embossed Race Number Badge */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-3xl shadow-[0_8px_25px_rgba(16,185,129,0.4)] border border-emerald-300/40">
                R{nextRace.raceNumber}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">
                    Next Race on Card
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-white font-bold">{nextRace.time} IST</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">{nextRace.distanceMeters}m ({nextRace.raceClass})</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold">₹{nextRace.prizeMoney}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  {nextRace.name}
                </h1>
              </div>
            </div>

            {/* Live Oct 3rd Countdown Clock & Race Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Authentic Live Countdown to Oct 3rd Post Time */}
              <div className="flex items-center gap-3 rounded-2xl bg-black/80 px-4 py-3 border border-white/15 shadow-inner">
                <Clock className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest font-mono">
                    Countdown to Oct 3rd Post
                  </div>
                  <div className="font-mono text-base sm:text-lg font-black text-emerald-400 tracking-tight">
                    {nextRace.status === 'Finished' ? 'Finished' : countdown.formattedFull}
                  </div>
                </div>
              </div>

              {/* Ask AI Brain for this race */}
              <button
                onClick={() => askAiBrain(`Give me a tactical betting analysis for Race ${nextRace.raceNumber} (${nextRace.name}) on Oct 3rd at RCTC. Focus on track bias and top 2 runners.`)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 px-4 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/70 transition shadow-md"
                title="Consult AI Brain on this race"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Ask AI Brain</span>
              </button>

              {/* Track in My Races Button */}
              <button
                onClick={() => toggleTrackRace(nextRace.id)}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-3 text-xs font-bold transition border ${
                  isRaceTracked(nextRace.id)
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'border-white/10 bg-black/60 text-slate-400 hover:text-white hover:border-white/20'
                }`}
                title={isRaceTracked(nextRace.id) ? 'Tracked in My Races' : 'Add to My Races'}
              >
                <Bell className={`w-4 h-4 ${isRaceTracked(nextRace.id) ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">
                  {isRaceTracked(nextRace.id) ? 'Tracked' : 'Track Race'}
                </span>
              </button>

              <button
                onClick={() => setSelectedRaceId(nextRace.id)}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xl hover:bg-emerald-500 transition"
              >
                <span>Full Card ({nextRace.runners.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Top Model Contenders with Authentic Thoroughbred & Jockey Visuals */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-semibold">
              <span className="text-white font-mono uppercase tracking-wider">
                Declared Contenders · Official Silks & Jockey Pairings
              </span>
              <span className="text-slate-400 font-mono">
                Model Confidence: <strong className={nextRace.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{nextRace.confidence}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedNextRunners.map((runner, index) => {
                const isTop = index === 0;
                const isDanger = index === 1;

                return (
                  <Card3D
                    key={runner.id}
                    onClick={() => {
                      setSelectedRaceId(nextRace.id);
                      setSelectedRunnerId(runner.id);
                    }}
                    glowColor={isTop ? 'rgba(16, 185, 129, 0.25)' : isDanger ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)'}
                    className={`cursor-pointer rounded-3xl border transition-all duration-300 relative group overflow-hidden ${
                      isTop
                        ? 'border-emerald-500/60 bg-gradient-to-b from-[#111e1f] to-[#080d12] shadow-xl ring-1 ring-emerald-500/30'
                        : isDanger
                        ? 'border-amber-500/50 bg-gradient-to-b from-[#1a1711] to-[#0a0c10]'
                        : 'border-white/10 bg-gradient-to-b from-[#111827] to-[#070a10]'
                    }`}
                  >
                    {/* Visualizer Row: Thoroughbred & Owner Silks Vector Artwork */}
                    <div className="p-4 flex items-start gap-3.5 border-b border-white/10">
                      <ThoroughbredVisualizer runner={runner} size="md" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                            isTop ? 'text-emerald-400' : isDanger ? 'text-amber-400' : 'text-sky-400'
                          }`}>
                            {runner.modelRole}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTrackHorse(runner.id);
                            }}
                            className={`p-1 rounded-xl transition ${
                              isHorseTracked(runner.id)
                                ? 'text-amber-400 bg-amber-400/20'
                                : 'text-slate-400 hover:text-white'
                            }`}
                            title="Track this horse"
                          >
                            <Star className={`w-3.5 h-3.5 ${isHorseTracked(runner.id) ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>

                        <h3 className="text-lg font-black text-white tracking-tight truncate mt-0.5">
                          {runner.name}
                        </h3>

                        <div className="text-xs text-slate-300 font-medium mt-1">
                          Jockey: <strong className="text-white">{runner.jockey}</strong>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Trainer: {runner.trainer}
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Row: Speed Rating, Weight, Odds & Win Probability */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1 font-mono">
                          <span className="text-slate-400">Model Win Probability</span>
                          <span className="font-extrabold text-sm text-white">{runner.winProbability}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-white/10 p-[1px]">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isTop ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : isDanger ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 'bg-gradient-to-r from-sky-500 to-cyan-400'
                            }`}
                            style={{ width: `${runner.winProbability}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1 border-t border-white/5">
                        <span>Rating: <strong className="text-emerald-400">{runner.rating}</strong></span>
                        <span>Weight: <strong>{runner.weightKg}kg</strong></span>
                        <span>Odds: <strong className="text-white">{runner.odds.toFixed(2)}</strong></span>
                      </div>

                      {/* Primary Tactical Reason */}
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 bg-slate-950/70 p-2.5 rounded-2xl border border-white/5">
                        {runner.keyReasons[0] || runner.oneSentenceSummary}
                      </p>
                    </div>
                  </Card3D>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ALL REMAINING RACES ON CARD WITH LIVE OCT 3RD COUNTDOWNS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <span>Remaining October 3 Program</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-xs font-normal">{remainingRaces.length} Upcoming Races</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Official Kolkata Autumn Meeting</span>
        </div>

        <div className="space-y-3">
          {remainingRaces.map(race => {
            const activeRunners = race.runners.filter(r => r.status !== 'Scratched');
            const topPick = activeRunners.find(r => r.modelRole === 'Top Pick') || activeRunners[0];
            const isDerby = race.raceNumber === 8;

            return (
              <Card3D
                key={race.id}
                onClick={() => setSelectedRaceId(race.id)}
                glowColor={isDerby ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.15)'}
                className={`cursor-pointer rounded-3xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 ${
                  isDerby 
                    ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 shadow-2xl ring-1 ring-amber-500/30' 
                    : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                }`}
              >
                {/* Left Race Identification */}
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-mono font-black text-xl border ${
                    isDerby 
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg' 
                      : 'bg-slate-800 text-slate-100 border-white/10'
                  }`}>
                    R{race.raceNumber}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-white">{race.time} IST</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">{race.distanceMeters}m ({race.raceClass})</span>
                      {isDerby && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-amber-400 font-extrabold uppercase">
                            👑 ₹1.5 Crore Classic
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight mt-0.5">{race.name}</h3>
                  </div>
                </div>

                {/* Center: Top Pick with Thoroughbred Silks Visualizer */}
                {topPick && (
                  <div className="flex items-center gap-3.5 bg-black/60 border border-white/10 rounded-2xl p-2.5 px-4 shadow-inner">
                    <ThoroughbredVisualizer runner={topPick} size="sm" />
                    <div>
                      <div className="text-[10px] uppercase font-mono font-black text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Top Pick (#{topPick.saddleNumber})
                      </div>
                      <div className="text-sm font-black text-white truncate max-w-[130px]">{topPick.name}</div>
                      <div className="text-xs text-slate-300 font-mono mt-0.5">
                        {topPick.jockey} · Odds {topPick.odds.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right pl-3 border-l border-white/10">
                      <div className="text-base font-black font-mono text-emerald-400">{topPick.winProbability}%</div>
                      <div className="text-[9px] text-slate-400 font-mono uppercase">Win %</div>
                    </div>
                  </div>
                )}

                {/* Right Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
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
                    title={isRaceTracked(race.id) ? 'Tracked in My Races' : 'Add to My Races'}
                  >
                    <Bell className={`w-4 h-4 ${isRaceTracked(race.id) ? 'fill-emerald-400' : ''}`} />
                  </button>

                  <button className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md">
                    <span>Racecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card3D>
            );
          })}
        </div>
      </section>

      {/* COMPLETED RACES (if any settled) */}
      {completedRaces.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">
            Settled Results & Official Dividends
          </h2>
          <div className="space-y-3">
            {completedRaces.map(race => {
              const res = race.result;
              return (
                <div
                  key={race.id}
                  onClick={() => setSelectedRaceId(race.id)}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-white/20"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">R{race.raceNumber} — {race.name}</span>
                    {res && <span className="font-mono text-amber-400 font-bold">1st: {res.winnerName} (₹{res.dividendWin.toFixed(2)})</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
