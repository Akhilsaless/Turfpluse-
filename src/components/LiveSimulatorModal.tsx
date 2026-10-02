import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { TrackCondition } from '../types/racing';
import { 
  X, 
  SlidersHorizontal, 
  AlertTriangle, 
  CloudRain, 
  UserCheck, 
  Trophy, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Bell,
  Clock
} from 'lucide-react';

export const LiveSimulatorModal: React.FC = () => {
  const { 
    meeting, 
    simulatorOpen, 
    setSimulatorOpen, 
    scratchRunner, 
    changeGoing, 
    changeJockey, 
    postOfficialResult,
    resetToInitialMeeting,
    addToast,
    myRaces,
    trackedHorses
  } = useRacing();

  const [activeTab, setActiveTab] = useState<'scratch' | 'going' | 'jockey' | 'result' | 'alerts'>('scratch');

  // Scratch Form State
  const [scratchRaceId, setScratchRaceId] = useState<string>(meeting.races[2]?.id || meeting.races[0].id); // R3
  const [scratchRunnerId, setScratchRunnerId] = useState<string>('');
  const [scratchReason, setScratchReason] = useState<string>('Veterinary advice: sore left foreleg');

  // Going Form State
  const [selectedGoing, setSelectedGoing] = useState<TrackCondition>('Yielding');
  const [penetrometer, setPenetrometer] = useState<number>(4.4);

  // Jockey Form State
  const [jockeyRaceId, setJockeyRaceId] = useState<string>(meeting.races[2]?.id || meeting.races[0].id);
  const [jockeyRunnerId, setJockeyRunnerId] = useState<string>('');
  const [replacementJockey, setReplacementJockey] = useState<string>('Neeraj Rawal');

  // Result Form State
  const [resultRaceId, setResultRaceId] = useState<string>(
    meeting.races.find(r => r.status === 'Next')?.id || meeting.races[2]?.id || meeting.races[0].id
  );
  const [winnerId, setWinnerId] = useState<string>('');
  const [secondId, setSecondId] = useState<string>('');
  const [thirdId, setThirdId] = useState<string>('');
  const [margins, setMargins] = useState<string>('1.5 L, Head');
  const [winningTime, setWinningTime] = useState<string>('1m 11.84s');
  const [dividendWin, setDividendWin] = useState<number>(2.40);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!simulatorOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedScratchRace = meeting.races.find(r => r.id === scratchRaceId);
  const activeScratchRunners = selectedScratchRace?.runners.filter(r => r.status !== 'Scratched') || [];

  const selectedJockeyRace = meeting.races.find(r => r.id === jockeyRaceId);
  const activeJockeyRunners = selectedJockeyRace?.runners.filter(r => r.status !== 'Scratched') || [];

  const selectedResultRace = meeting.races.find(r => r.id === resultRaceId);
  const activeResultRunners = selectedResultRace?.runners.filter(r => r.status !== 'Scratched') || [];

  const handleExecuteScratch = (e: React.FormEvent) => {
    e.preventDefault();
    const runnerIdToScratch = scratchRunnerId || activeScratchRunners[0]?.id;
    if (!runnerIdToScratch) return;

    const runner = activeScratchRunners.find(r => r.id === runnerIdToScratch);
    scratchRunner(scratchRaceId, runnerIdToScratch, scratchReason);
    triggerToast(`Scratched ${runner?.name || 'horse'}. Model recalculated & timeline entry logged!`);
  };

  const handleExecuteGoingChange = (e: React.FormEvent) => {
    e.preventDefault();
    changeGoing(selectedGoing, penetrometer);
    triggerToast(`Track updated to ${selectedGoing} (${penetrometer}cm). Model probabilities re-scored!`);
  };

  const handleExecuteJockeyChange = (e: React.FormEvent) => {
    e.preventDefault();
    const runnerId = jockeyRunnerId || activeJockeyRunners[0]?.id;
    if (!runnerId) return;

    const runner = activeJockeyRunners.find(r => r.id === runnerId);
    changeJockey(jockeyRaceId, runnerId, replacementJockey);
    triggerToast(`Jockey changed to ${replacementJockey} on ${runner?.name}. Model updated!`);
  };

  const handleExecuteResult = (e: React.FormEvent) => {
    e.preventDefault();
    const wId = winnerId || activeResultRunners[0]?.id;
    const sId = secondId || activeResultRunners[1]?.id;
    const tId = thirdId || activeResultRunners[2]?.id;

    if (!wId || !sId || !tId) return;

    postOfficialResult(
      resultRaceId,
      wId,
      sId,
      tId,
      margins,
      winningTime,
      dividendWin,
      1.40
    );
    triggerToast(`Official result posted for R${selectedResultRace?.raceNumber}. Accuracy logged to History!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-emerald-500/40 bg-slate-950 shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Live Simulator & Telemetry Lab
                <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 font-semibold">
                  Section 8 & 9 Trust Demo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Test real-time events to see dynamic recalculation and 'What Changed?' audit logging.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSimulatorOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('scratch')}
            className={`flex-1 min-w-[120px] py-3 text-center font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'scratch'
                ? 'border-b-2 border-emerald-400 text-emerald-400 bg-emerald-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>1. Scratch Runner</span>
          </button>

          <button
            onClick={() => setActiveTab('going')}
            className={`flex-1 min-w-[120px] py-3 text-center font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'going'
                ? 'border-b-2 border-emerald-400 text-emerald-400 bg-emerald-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>2. Change Going</span>
          </button>

          <button
            onClick={() => setActiveTab('jockey')}
            className={`flex-1 min-w-[120px] py-3 text-center font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'jockey'
                ? 'border-b-2 border-emerald-400 text-emerald-400 bg-emerald-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. Jockey Change</span>
          </button>

          <button
            onClick={() => setActiveTab('result')}
            className={`flex-1 min-w-[110px] py-3 text-center font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'result'
                ? 'border-b-2 border-emerald-400 text-emerald-400 bg-emerald-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>4. Post Result</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 min-w-[110px] py-3 text-center font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'border-b-2 border-emerald-400 text-emerald-400 bg-emerald-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>5. Test Alerts</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5">
          {toastMessage && (
            <div className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: SCRATCH RUNNER */}
          {activeTab === 'scratch' && (
            <form onSubmit={handleExecuteScratch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Race:</label>
                <select
                  value={scratchRaceId}
                  onChange={e => {
                    setScratchRaceId(e.target.value);
                    setScratchRunnerId('');
                  }}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {meeting.races.map(r => (
                    <option key={r.id} value={r.id}>
                      R{r.raceNumber} — {r.name} ({r.runners.filter(run => run.status !== 'Scratched').length} active runners)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Runner to Scratch:</label>
                <select
                  value={scratchRunnerId || activeScratchRunners[0]?.id || ''}
                  onChange={e => setScratchRunnerId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {activeScratchRunners.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.saddleNumber} {r.name} — Current Win Prob: {r.winProbability}% (Odds {r.odds.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Reason for Withdrawal:</label>
                <input
                  type="text"
                  value={scratchReason}
                  onChange={e => setScratchReason(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Veterinary advice: lame near foreleg"
                />
              </div>

              <div className="rounded-xl bg-slate-900/60 p-3 text-[11px] text-slate-400 border border-slate-800/80">
                <strong>What will happen:</strong> Runner will be marked scratched, remaining runners will be mathematically re-normalized to 100%, and an immutable entry will be written to that race's 'What Changed?' timeline.
              </div>

              <button
                type="submit"
                disabled={activeScratchRunners.length === 0}
                className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition shadow-md disabled:opacity-50"
              >
                Withdraw Runner & Trigger Model Recalibration
              </button>
            </form>
          )}

          {/* TAB 2: CHANGE GOING */}
          {activeTab === 'going' && (
            <form onSubmit={handleExecuteGoingChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Going: <span className="text-emerald-400 font-bold">{meeting.trackCondition} ({meeting.penetrometer}cm)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['Good to Firm', 'Good', 'Yielding', 'Soft', 'Heavy'] as TrackCondition[]).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setSelectedGoing(g);
                        if (g === 'Good to Firm') setPenetrometer(3.6);
                        else if (g === 'Good') setPenetrometer(4.0);
                        else if (g === 'Yielding') setPenetrometer(4.4);
                        else if (g === 'Soft') setPenetrometer(4.9);
                        else if (g === 'Heavy') setPenetrometer(5.4);
                      }}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                        selectedGoing === g
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Penetrometer Reading (cm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={penetrometer}
                  onChange={e => setPenetrometer(parseFloat(e.target.value))}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="rounded-xl bg-slate-900/60 p-3 text-[11px] text-slate-400 border border-slate-800/80">
                <strong>What will happen:</strong> All unfinished races will have their surface suitability curves recalculated. Horses with proven wet/yielding pedigree will surge, while firm-ground sprinters drop slightly.
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
              >
                Apply Going Revision & Re-score Meeting
              </button>
            </form>
          )}

          {/* TAB 3: JOCKEY CHANGE */}
          {activeTab === 'jockey' && (
            <form onSubmit={handleExecuteJockeyChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Race:</label>
                <select
                  value={jockeyRaceId}
                  onChange={e => {
                    setJockeyRaceId(e.target.value);
                    setJockeyRunnerId('');
                  }}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {meeting.races.filter(r => r.status !== 'Finished').map(r => (
                    <option key={r.id} value={r.id}>
                      R{r.raceNumber} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Horse to Substitute Jockey:</label>
                <select
                  value={jockeyRunnerId || activeJockeyRunners[0]?.id || ''}
                  onChange={e => setJockeyRunnerId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {activeJockeyRunners.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.saddleNumber} {r.name} (Current: {r.jockey})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Replacement Jockey:</label>
                <select
                  value={replacementJockey}
                  onChange={e => setReplacementJockey(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Suraj Narredu">Suraj Narredu (Champion Jockey, 25% Strike)</option>
                  <option value="P. Trevor">P. Trevor (Classic specialist, 33% Strike)</option>
                  <option value="Akshay Kumar">Akshay Kumar (Premier Tactical, 22% Strike)</option>
                  <option value="Neeraj Rawal">Neeraj Rawal (Patience specialist)</option>
                  <option value="Hindu Singh">Hindu Singh (Local Kolkata veteran)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-md"
              >
                Confirm Jockey Replacement
              </button>
            </form>
          )}

          {/* TAB 4: POST RESULT */}
          {activeTab === 'result' && (
            <form onSubmit={handleExecuteResult} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Race to Settle:</label>
                <select
                  value={resultRaceId}
                  onChange={e => {
                    setResultRaceId(e.target.value);
                    setWinnerId('');
                    setSecondId('');
                    setThirdId('');
                  }}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {meeting.races.filter(r => r.status !== 'Finished').map(r => (
                    <option key={r.id} value={r.id}>
                      R{r.raceNumber} — {r.name} ({r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">1st (Winner):</label>
                  <select
                    value={winnerId || activeResultRunners[0]?.id || ''}
                    onChange={e => setWinnerId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  >
                    {activeResultRunners.map(r => (
                      <option key={r.id} value={r.id}>#{r.saddleNumber} {r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">2nd Place:</label>
                  <select
                    value={secondId || activeResultRunners[1]?.id || ''}
                    onChange={e => setSecondId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  >
                    {activeResultRunners.map(r => (
                      <option key={r.id} value={r.id}>#{r.saddleNumber} {r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">3rd Place:</label>
                  <select
                    value={thirdId || activeResultRunners[2]?.id || ''}
                    onChange={e => setThirdId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  >
                    {activeResultRunners.map(r => (
                      <option key={r.id} value={r.id}>#{r.saddleNumber} {r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Winning Margin:</label>
                  <input
                    type="text"
                    value={margins}
                    onChange={e => setMargins(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Winning Time:</label>
                  <input
                    type="text"
                    value={winningTime}
                    onChange={e => setWinningTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={activeResultRunners.length < 3}
                className="w-full rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-500 transition shadow-md disabled:opacity-50"
              >
                Post Official Result & Grade Model Accountability
              </button>
            </form>
          )}

          {/* TAB 5: TEST ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block text-sm mb-1">Interactive Alert Triggers</span>
                <p className="text-slate-400 text-xs">
                  Click any of the scenarios below to trigger the real-time alert system: synthetic audio chime, in-app alert toast, and browser push notification (if enabled).
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      type: 'race_starting',
                      title: 'My Races Alert: R3 The Hooghly Handicap',
                      message: 'Post time in 2 minutes! Runners are leaving the paddock and entering stalls at RCTC Hastings.',
                      raceId: 'r3',
                      raceNumber: 3,
                      timeToStart: '2m',
                    });
                    triggerToast('Dispatched 2-minute post alert for R3!');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-sky-500/40 bg-sky-950/20 hover:bg-sky-900/30 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>Simulate 'Race About to Start' (2-Min Warning)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Sends countdown alert for watchlisted race (R3 Hooghly Handicap).
                    </div>
                  </div>
                  <span className="rounded bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white shrink-0">
                    Fire Alert
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      type: 'horse_starting',
                      title: 'Tracked Horse Alert: ADMIRINGLY (Derby R8)',
                      message: 'Your tracked runner ADMIRINGLY (Top Pick, 34%) is entering the gate for The Kolkata Derby (Gr.1)!',
                      raceId: 'r8',
                      runnerId: 'r8-h1',
                      horseName: 'ADMIRINGLY',
                      raceNumber: 8,
                      timeToStart: 'Going to Post',
                    });
                    triggerToast('Dispatched Tracked Horse Post Alert for ADMIRINGLY!');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/30 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Simulate 'Tracked Horse Going to Post'</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Sends prompt notification that your tracked contender is at the gate.
                    </div>
                  </div>
                  <span className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shrink-0">
                    Fire Alert
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      type: 'scratch',
                      title: 'URGENT SCRATCH: Tracked Horse Withdrawn',
                      message: 'Runner scratched at the barrier on veterinary advice. Probabilities re-normalized.',
                      raceId: 'r3',
                      raceNumber: 3,
                    });
                    triggerToast('Dispatched Tracked Runner Scratch Alert!');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/30 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Simulate 'Tracked Runner Scratching'</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Urgent steward alert when a tracked contender is withdrawn.
                    </div>
                  </div>
                  <span className="rounded bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shrink-0">
                    Fire Alert
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      type: 'result',
                      title: 'Official Result: Tracked Horse WON!',
                      message: 'ADMIRINGLY wins the Kolkata Derby in 2m 31.40s. Payout dividend ₹2.10. Accountability score logged.',
                      raceId: 'r8',
                      raceNumber: 8,
                    });
                    triggerToast('Dispatched Tracked Winner Result Alert!');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Simulate 'Tracked Winner Declared'</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Immediate confirmation when your tracked pick captures the victory.
                    </div>
                  </div>
                  <span className="rounded bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shrink-0">
                    Fire Alert
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Reset All Action */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Want to start fresh?</span>
            <button
              onClick={() => {
                resetToInitialMeeting();
                triggerToast('Reset to canonical October 3 declarations successfully.');
              }}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white underline font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Official 3 Oct Declarations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
