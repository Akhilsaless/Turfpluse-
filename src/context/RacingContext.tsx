import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Meeting, 
  NewsItem, 
  Race, 
  TrackCondition, 
  OfficialResult, 
  TimelineEntry, 
  PredictionSnapshot,
  ToastAlert
} from '../types/racing';
import { INITIAL_MEETING, INITIAL_NEWS } from '../data/initialMeetingData';
import { recalibrateRaceRunners, determineConfidence } from '../services/predictionEngine';
import { playAlertChime } from '../utils/audioChime';

interface RacingContextType {
  meeting: Meeting;
  news: NewsItem[];
  activeTab: 'live' | 'races' | 'horses' | 'news' | 'history';
  setActiveTab: (tab: 'live' | 'races' | 'horses' | 'news' | 'history') => void;
  selectedRaceId: string | null;
  setSelectedRaceId: (id: string | null) => void;
  selectedRunnerId: string | null;
  setSelectedRunnerId: (id: string | null) => void;
  simulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;
  aiBrainOpen: boolean;
  setAiBrainOpen: (open: boolean) => void;
  aiBrainQuery: string;
  setAiBrainQuery: (query: string) => void;
  askAiBrain: (query?: string) => void;
  
  // Tracked Watchlists
  myRaces: string[];
  toggleTrackRace: (raceId: string) => void;
  isRaceTracked: (raceId: string) => boolean;
  trackedHorses: string[];
  toggleTrackHorse: (runnerId: string) => void;
  isHorseTracked: (runnerId: string) => boolean;

  // Alerts & Notifications
  toasts: ToastAlert[];
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  addToast: (toast: Omit<ToastAlert, 'id' | 'timestamp'>) => void;
  pushPermission: NotificationPermission;
  requestPushPermission: () => Promise<boolean>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  triggerTestAlert: () => void;

  // Actions
  scratchRunner: (raceId: string, runnerId: string, reason: string) => void;
  changeGoing: (newGoing: TrackCondition, penetrometer: number) => void;
  changeJockey: (raceId: string, runnerId: string, newJockey: string) => void;
  postOfficialResult: (
    raceId: string,
    winnerId: string,
    secondId: string,
    thirdId: string,
    margins: string,
    winningTime: string,
    dividendWin: number,
    dividendPlace: number,
    notes?: string
  ) => void;
  resetToInitialMeeting: () => void;
  lastUpdateTimestamp: string;
}

const STORAGE_KEY = 'turfpulse_rctc_oct3_meeting_v2';
const NEWS_STORAGE_KEY = 'turfpulse_rctc_oct3_news_v2';
const MY_RACES_STORAGE = 'turfpulse_my_races_v2';
const TRACKED_HORSES_STORAGE = 'turfpulse_tracked_horses_v2';
const SOUND_STORAGE = 'turfpulse_sound_enabled_v2';

const RacingContext = createContext<RacingContextType | undefined>(undefined);

export const RacingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meeting, setMeeting] = useState<Meeting>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEETING;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem(NEWS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NEWS;
  });

  // Tracked items default to Derby and Next Race + top picks
  const [myRaces, setMyRaces] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MY_RACES_STORAGE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['r3', 'r8']; // Race 3 (Next) and Race 8 (Derby)
  });

  const [trackedHorses, setTrackedHorses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(TRACKED_HORSES_STORAGE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['r8-h1', 'r3-h1']; // ADMIRINGLY and STORMCHASER
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const firedAlertKeysRef = useRef<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<'live' | 'races' | 'horses' | 'news' | 'history'>('live');
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRunnerId, setSelectedRunnerId] = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [aiBrainOpen, setAiBrainOpen] = useState(false);
  const [aiBrainQuery, setAiBrainQuery] = useState('');
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<string>('12:20 PM');

  const askAiBrain = (query?: string) => {
    if (query) {
      setAiBrainQuery(query);
    }
    setAiBrainOpen(true);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(SOUND_STORAGE, JSON.stringify(enabled));
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meeting));
    } catch {}
  }, [meeting]);

  useEffect(() => {
    try {
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
    } catch {}
  }, [news]);

  useEffect(() => {
    try {
      localStorage.setItem(MY_RACES_STORAGE, JSON.stringify(myRaces));
    } catch {}
  }, [myRaces]);

  useEffect(() => {
    try {
      localStorage.setItem(TRACKED_HORSES_STORAGE, JSON.stringify(trackedHorses));
    } catch {}
  }, [trackedHorses]);

  const getCurrentTimeString = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Browser Push Permission Request
  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      return perm === 'granted';
    } catch (e) {
      console.warn('Failed to request notification permission', e);
      return false;
    }
  };

  // Dispatch an alert toast & native browser push notification
  const addToast = (toastInput: Omit<ToastAlert, 'id' | 'timestamp'>) => {
    const nowTime = getCurrentTimeString();
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newToast: ToastAlert = {
      ...toastInput,
      id,
      timestamp: nowTime,
      dismissed: false,
    };

    setToasts(prev => [newToast, ...prev.slice(0, 5)]);

    // Play synthesized Web Audio chime if enabled
    if (soundEnabled) {
      playAlertChime();
    }

    // Fire native browser notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newToast.title, {
          body: newToast.message,
          icon: '/pwa-192x192.png',
          badge: '/favicon.ico',
          tag: id,
        });
      } catch (err) {
        console.debug('Browser push notification could not be shown', err);
      }
    }
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Toggle Track Race
  const toggleTrackRace = (raceId: string) => {
    setMyRaces(prev => {
      const isTracked = prev.includes(raceId);
      const next = isTracked ? prev.filter(id => id !== raceId) : [...prev, raceId];
      
      const race = meeting.races.find(r => r.id === raceId);
      if (!isTracked && race) {
        addToast({
          type: 'race_starting',
          title: `Added to My Races: R${race.raceNumber}`,
          message: `${race.name} is now in your watchlist. You will receive alert toasts before post time.`,
          raceId: race.id,
          raceNumber: race.raceNumber,
        });
      }
      return next;
    });
  };

  const isRaceTracked = (raceId: string) => myRaces.includes(raceId);

  // Toggle Track Horse
  const toggleTrackHorse = (runnerId: string) => {
    setTrackedHorses(prev => {
      const isTracked = prev.includes(runnerId);
      const next = isTracked ? prev.filter(id => id !== runnerId) : [...prev, runnerId];

      let foundRunner: { runner: any; race: Race } | undefined;
      for (const r of meeting.races) {
        const run = r.runners.find(h => h.id === runnerId);
        if (run) {
          foundRunner = { runner: run, race: r };
          break;
        }
      }

      if (!isTracked && foundRunner) {
        addToast({
          type: 'horse_starting',
          title: `Tracking Horse: ${foundRunner.runner.name}`,
          message: `${foundRunner.runner.name} (R${foundRunner.race.raceNumber}) added to alerts. You will be notified when it goes to post.`,
          raceId: foundRunner.race.id,
          runnerId,
          horseName: foundRunner.runner.name,
          raceNumber: foundRunner.race.raceNumber,
        });
      }
      return next;
    });
  };

  const isHorseTracked = (runnerId: string) => trackedHorses.includes(runnerId);

  // Test Alert Trigger for immediate demo
  const triggerTestAlert = () => {
    const nextRace = meeting.races.find(r => r.status === 'Next') || meeting.races[2];
    const derbyRace = meeting.races[7]; // Race 8 Derby

    addToast({
      type: 'horse_starting',
      title: 'Tracked Horse Alert: ADMIRINGLY (Derby R8)',
      message: 'Your tracked runner ADMIRINGLY is currently 2.10 favorite in The Kolkata Derby. Post time approaching in 15 minutes.',
      raceId: derbyRace.id,
      runnerId: 'r8-h1',
      horseName: 'ADMIRINGLY',
      raceNumber: 8,
      timeToStart: '15m',
    });
  };

  // Scratch a runner
  const scratchRunner = (raceId: string, runnerId: string, reason: string) => {
    const nowTime = getCurrentTimeString();
    setLastUpdateTimestamp(nowTime);

    setMeeting(prev => {
      const targetRace = prev.races.find(r => r.id === raceId);
      if (!targetRace) return prev;

      const targetRunner = targetRace.runners.find(r => r.id === runnerId);
      if (!targetRunner) return prev;

      const isTracked = trackedHorses.includes(runnerId);
      const isRaceInWatchlist = myRaces.includes(raceId);

      // Notify if horse is tracked or race is in My Races
      if (isTracked || isRaceInWatchlist) {
        addToast({
          type: 'scratch',
          title: `URGENT SCRATCH: ${targetRunner.name} (R${targetRace.raceNumber})`,
          message: `Your ${isTracked ? 'tracked horse' : 'watchlisted race runner'} ${targetRunner.name} has been withdrawn (${reason}). Model probabilities recalibrated.`,
          raceId,
          runnerId,
          horseName: targetRunner.name,
          raceNumber: targetRace.raceNumber,
        });
      }

      // Update runner status
      const updatedRunners = targetRace.runners.map(r => {
        if (r.id === runnerId) {
          return {
            ...r,
            status: 'Scratched' as const,
            scratchReason: reason,
            winProbability: 0,
            placeProbability: 0,
          };
        }
        return r;
      });

      const recalibrated = recalibrateRaceRunners(updatedRunners, targetRace.distanceMeters, targetRace.going);
      const topPick = recalibrated.find(r => r.modelRole === 'Top Pick');
      const newConfidence = determineConfidence(
        topPick?.winProbability || 0,
        recalibrated.filter(r => r.status !== 'Scratched').length
      );

      const newSnapshot: PredictionSnapshot = {
        timestamp: nowTime,
        version: targetRace.predictionSnapshots.length + 1,
        label: `Post-Scratch: ${targetRunner.name} Withdrawn`,
        topPickId: topPick?.id || '',
        topPickName: topPick?.name || '',
        winProbability: topPick?.winProbability || 0,
        runnerProbabilities: recalibrated
          .filter(r => r.status !== 'Scratched')
          .map(r => ({ runnerId: r.id, name: r.name, winPct: r.winProbability }))
      };

      const timelineEntry: TimelineEntry = {
        id: `tl-${Date.now()}`,
        timestamp: nowTime,
        type: 'scratch',
        title: `Scratch: ${targetRunner.name} Withdrawn`,
        description: `Steward notice: ${targetRunner.name} scratched (${reason}). Field probabilities re-normalized across active runners. ${topPick ? `${topPick.name} is now top pick at ${topPick.winProbability}%.` : ''}`,
        affectedRunnerIds: [runnerId],
        snapshotSummary: recalibrated
          .filter(r => r.status !== 'Scratched')
          .map(r => `${r.name} ${r.winProbability}%`)
          .join(', ')
      };

      const updatedRaces = prev.races.map(r => {
        if (r.id === raceId) {
          return {
            ...r,
            runners: recalibrated,
            confidence: newConfidence,
            timeline: [timelineEntry, ...r.timeline],
            predictionSnapshots: [...r.predictionSnapshots, newSnapshot],
          };
        }
        return r;
      });

      return {
        ...prev,
        races: updatedRaces,
      };
    });

    setNews(prevNews => [
      {
        id: `news-${Date.now()}`,
        timestamp: nowTime,
        title: `Official Scratching: Horse Withdrawn in RCTC Kolkata Meeting`,
        source: 'RCTC Stewards',
        category: 'official',
        summary: `Runner scratched under official veterinarian advice. Prediction engine has recalibrated all win/place probabilities without overwriting historical baseline data.`,
        relatedRaceId: raceId,
        verified: true,
      },
      ...prevNews
    ]);
  };

  // Change Track Going
  const changeGoing = (newGoing: TrackCondition, penetrometer: number) => {
    const nowTime = getCurrentTimeString();
    setLastUpdateTimestamp(nowTime);

    setMeeting(prev => {
      const updatedRaces = prev.races.map(r => {
        if (r.status === 'Finished') return r;

        const recalibrated = recalibrateRaceRunners(r.runners, r.distanceMeters, newGoing);
        const topPick = recalibrated.find(run => run.modelRole === 'Top Pick');
        const newConfidence = determineConfidence(
          topPick?.winProbability || 0,
          recalibrated.filter(run => run.status !== 'Scratched').length
        );

        const newSnapshot: PredictionSnapshot = {
          timestamp: nowTime,
          version: r.predictionSnapshots.length + 1,
          label: `Track Condition Changed to ${newGoing}`,
          topPickId: topPick?.id || '',
          topPickName: topPick?.name || '',
          winProbability: topPick?.winProbability || 0,
          runnerProbabilities: recalibrated
            .filter(run => run.status !== 'Scratched')
            .map(run => ({ runnerId: run.id, name: run.name, winPct: run.winProbability }))
        };

        const timelineEntry: TimelineEntry = {
          id: `tl-${Date.now()}-${r.id}`,
          timestamp: nowTime,
          type: 'going_change',
          title: `Track Condition Revised: ${newGoing} (Penetrometer ${penetrometer})`,
          description: `Surface suitability coefficients adjusted for ${newGoing}. Runners with verified soft/firm ground form experienced score adjustment.`,
          snapshotSummary: recalibrated
            .filter(run => run.status !== 'Scratched')
            .slice(0, 3)
            .map(run => `${run.name} ${run.winProbability}%`)
            .join(', ')
        };

        return {
          ...r,
          going: newGoing,
          penetrometer,
          runners: recalibrated,
          confidence: newConfidence,
          timeline: [timelineEntry, ...r.timeline],
          predictionSnapshots: [...r.predictionSnapshots, newSnapshot],
        };
      });

      return {
        ...prev,
        trackCondition: newGoing,
        penetrometer,
        races: updatedRaces,
      };
    });

    addToast({
      type: 'race_starting',
      title: `Track Going Revision: ${newGoing}`,
      message: `RCTC Kolkata surface officially updated to ${newGoing} (${penetrometer}cm). Model probabilities recalibrated across active races.`,
    });

    setNews(prevNews => [
      {
        id: `news-${Date.now()}`,
        timestamp: nowTime,
        title: `Official Going Revision: Track Now Rated ${newGoing} (${penetrometer}cm)`,
        source: 'Track & Weather Desk',
        category: 'track',
        summary: `Course inspection committee has officially updated the track rating to ${newGoing}. Penetrometer recorded at ${penetrometer}cm. All model ratings recalculated.`,
        verified: true,
      },
      ...prevNews
    ]);
  };

  // Change Jockey
  const changeJockey = (raceId: string, runnerId: string, newJockey: string) => {
    const nowTime = getCurrentTimeString();
    setLastUpdateTimestamp(nowTime);

    setMeeting(prev => {
      const targetRace = prev.races.find(r => r.id === raceId);
      if (!targetRace) return prev;

      const targetRunner = targetRace.runners.find(r => r.id === runnerId);
      if (!targetRunner) return prev;

      const oldJockey = targetRunner.jockey;

      const updatedRunners = targetRace.runners.map(r => {
        if (r.id === runnerId) {
          return {
            ...r,
            jockey: newJockey,
            jockeyTrainerCombo: {
              ...r.jockeyTrainerCombo,
              starts: r.jockeyTrainerCombo.starts + 1,
            }
          };
        }
        return r;
      });

      const recalibrated = recalibrateRaceRunners(updatedRunners, targetRace.distanceMeters, targetRace.going);

      const timelineEntry: TimelineEntry = {
        id: `tl-${Date.now()}`,
        timestamp: nowTime,
        type: 'jockey_change',
        title: `Jockey Change: ${newJockey} replaces ${oldJockey} on ${targetRunner.name}`,
        description: `Official steward replacement: ${newJockey} will take the ride on ${targetRunner.name}. Model stats updated.`,
        affectedRunnerIds: [runnerId]
      };

      const updatedRaces = prev.races.map(r => {
        if (r.id === raceId) {
          return {
            ...r,
            runners: recalibrated,
            timeline: [timelineEntry, ...r.timeline],
          };
        }
        return r;
      });

      if (trackedHorses.includes(runnerId) || myRaces.includes(raceId)) {
        addToast({
          type: 'horse_starting',
          title: `Jockey Change on Tracked Horse: ${targetRunner.name}`,
          message: `${newJockey} has taken the ride replacing ${oldJockey} in R${targetRace.raceNumber}.`,
          raceId,
          runnerId,
          horseName: targetRunner.name,
          raceNumber: targetRace.raceNumber,
        });
      }

      return {
        ...prev,
        races: updatedRaces,
      };
    });
  };

  // Post Official Result
  const postOfficialResult = (
    raceId: string,
    winnerId: string,
    secondId: string,
    thirdId: string,
    margins: string,
    winningTime: string,
    dividendWin: number,
    dividendPlace: number,
    notes?: string
  ) => {
    const nowTime = getCurrentTimeString();
    setLastUpdateTimestamp(nowTime);

    setMeeting(prev => {
      const targetRace = prev.races.find(r => r.id === raceId);
      if (!targetRace) return prev;

      const winnerRunner = targetRace.runners.find(r => r.id === winnerId);
      const secondRunner = targetRace.runners.find(r => r.id === secondId);
      const thirdRunner = targetRace.runners.find(r => r.id === thirdId);
      const topPick = targetRace.runners.find(r => r.modelRole === 'Top Pick');

      let topPickFinished = 4;
      if (topPick?.id === winnerId) topPickFinished = 1;
      else if (topPick?.id === secondId) topPickFinished = 2;
      else if (topPick?.id === thirdId) topPickFinished = 3;

      const result: OfficialResult = {
        winnerId,
        winnerName: winnerRunner?.name || 'Winner',
        secondId,
        secondName: secondRunner?.name || 'Second',
        thirdId,
        thirdName: thirdRunner?.name || 'Third',
        margins,
        winningTime,
        dividendWin,
        dividendPlace,
        topPickFinished,
        wasTopPickWinner: topPickFinished === 1,
        wasTopPickPlaced: topPickFinished <= 3,
        notes: notes || `Official judge order confirmed. Top pick ${topPick?.name} finished ${topPickFinished === 1 ? '1st (WON)' : topPickFinished <= 3 ? `${topPickFinished}rd (PLACED)` : 'Unplaced'}.`,
      };

      const timelineEntry: TimelineEntry = {
        id: `tl-${Date.now()}`,
        timestamp: nowTime,
        type: 'result_posted',
        title: `Official Result: 1st ${winnerRunner?.name}, 2nd ${secondRunner?.name}`,
        description: `Official judge verdict confirmed: Won by ${margins} in ${winningTime}. Dividend: Win ₹${dividendWin.toFixed(2)}, Place ₹${dividendPlace.toFixed(2)}. ${result.wasTopPickWinner ? 'Top pick WON.' : result.wasTopPickPlaced ? 'Top pick PLACED.' : 'Top pick unplaced.'}`,
      };

      const updatedRaces: Race[] = prev.races.map(r => {
        if (r.id === raceId) {
          return {
            ...r,
            status: 'Finished' as const,
            result,
            timeline: [timelineEntry, ...r.timeline],
          };
        }
        return r;
      });

      const hasNext = updatedRaces.some(r => r.status === 'Next' || r.status === 'Live' || r.status === 'Going to Post');
      if (!hasNext) {
        const nextUpcoming = updatedRaces.find(r => r.status === 'Upcoming');
        if (nextUpcoming) {
          nextUpcoming.status = 'Next';
        }
      }

      // Check if tracked horse won or placed
      if (trackedHorses.includes(winnerId) || myRaces.includes(raceId)) {
        addToast({
          type: 'result',
          title: `Result Declared: R${targetRace.raceNumber} — ${winnerRunner?.name} WON!`,
          message: `Official winner: ${winnerRunner?.name} (Win dividend ₹${dividendWin.toFixed(2)}). Second: ${secondRunner?.name}. Check History for updated calibration.`,
          raceId,
          raceNumber: targetRace.raceNumber,
        });
      }

      return {
        ...prev,
        races: updatedRaces,
      };
    });

    setNews(prevNews => [
      {
        id: `news-${Date.now()}`,
        timestamp: nowTime,
        title: `Race Result Confirmed for RCTC Race`,
        source: 'RCTC Stewards',
        category: 'official',
        summary: `Official results recorded with dividends. Post-race analysis and prediction calibration metric updated in History.`,
        relatedRaceId: raceId,
        verified: true,
      },
      ...prevNews
    ]);
  };

  const resetToInitialMeeting = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(NEWS_STORAGE_KEY);
      localStorage.removeItem(MY_RACES_STORAGE);
      localStorage.removeItem(TRACKED_HORSES_STORAGE);
    } catch {}
    setMeeting(INITIAL_MEETING);
    setNews(INITIAL_NEWS);
    setMyRaces(['r3', 'r8']);
    setTrackedHorses(['r8-h1', 'r3-h1']);
    setLastUpdateTimestamp('12:20 PM');
    clearAllToasts();
  };

  return (
    <RacingContext.Provider
      value={{
        meeting,
        news,
        activeTab,
        setActiveTab,
        selectedRaceId,
        setSelectedRaceId,
        selectedRunnerId,
        setSelectedRunnerId,
        simulatorOpen,
        setSimulatorOpen,
        aiBrainOpen,
        setAiBrainOpen,
        aiBrainQuery,
        setAiBrainQuery,
        askAiBrain,
        myRaces,
        toggleTrackRace,
        isRaceTracked,
        trackedHorses,
        toggleTrackHorse,
        isHorseTracked,
        toasts,
        dismissToast,
        clearAllToasts,
        addToast,
        pushPermission,
        requestPushPermission,
        soundEnabled,
        setSoundEnabled,
        triggerTestAlert,
        scratchRunner,
        changeGoing,
        changeJockey,
        postOfficialResult,
        resetToInitialMeeting,
        lastUpdateTimestamp,
      }}
    >
      {children}
    </RacingContext.Provider>
  );
};

export function useRacing(): RacingContextType {
  const context = useContext(RacingContext);
  if (!context) {
    throw new Error('useRacing must be used within a RacingProvider');
  }
  return context;
}
