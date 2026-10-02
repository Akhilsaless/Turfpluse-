/**
 * Precise, real-time countdown utility for RCTC Kolkata Autumn Meeting (Saturday, 3 October 2026).
 * No sample or randomized mock timers. Calculates exact millisecond delta to post time.
 */

import { useState, useEffect } from 'react';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPast: number;
  formattedCompact: string;
  formattedFull: string;
  isPostImminent: boolean; // Under 15 mins
}

export function calculateTimeRemaining(targetIsoOrDate?: string | Date | null): CountdownState {
  if (!targetIsoOrDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isPast: 0,
      formattedCompact: '--',
      formattedFull: 'Upcoming Race',
      isPostImminent: false,
    };
  }

  const target = new Date(targetIsoOrDate).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isPast: 1,
      formattedCompact: 'At Post',
      formattedFull: 'Race at Starting Gate',
      isPostImminent: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  let formattedCompact = '';
  if (days > 0) {
    formattedCompact = `${days}d ${hours}h ${pad(minutes)}m`;
  } else if (hours > 0) {
    formattedCompact = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else {
    formattedCompact = `${pad(minutes)}m ${pad(seconds)}s`;
  }

  let formattedFull = '';
  if (days > 0) {
    formattedFull = `${days}d ${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else if (hours > 0) {
    formattedFull = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else {
    formattedFull = `${minutes} min ${seconds} sec to Post`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isPast: 0,
    formattedCompact,
    formattedFull,
    isPostImminent: totalSeconds < 900,
  };
}

export function useRaceCountdown(targetIsoOrDate?: string | Date | null) {
  const [countdown, setCountdown] = useState<CountdownState>(() =>
    calculateTimeRemaining(targetIsoOrDate)
  );

  useEffect(() => {
    setCountdown(calculateTimeRemaining(targetIsoOrDate));

    if (!targetIsoOrDate) return;

    const interval = setInterval(() => {
      setCountdown(calculateTimeRemaining(targetIsoOrDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetIsoOrDate]);

  return countdown;
}
