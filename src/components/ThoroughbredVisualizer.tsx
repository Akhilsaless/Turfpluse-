import React from 'react';
import { Runner } from '../types/racing';

interface ThoroughbredVisualizerProps {
  runner: Runner;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThoroughbredVisualizer: React.FC<ThoroughbredVisualizerProps> = ({
  runner,
  size = 'md',
  className = '',
}) => {
  // Coat colors
  const coatHex =
    runner.color === 'Chestnut' ? '#9a3412' :
    runner.color === 'Grey' ? '#94a3b8' :
    runner.color === 'Dark Bay' ? '#1c1007' :
    runner.color === 'Brown' ? '#2e1807' : '#451a03'; // Bay

  // Authentic RCTC Owner Racing Silks
  const getSilkPattern = (saddleNum: number) => {
    switch (saddleNum) {
      case 1: // Vijay Singh (Maroon & Gold)
        return {
          bodyColor: '#7f1d1d', // Maroon
          sashColor: '#f59e0b', // Gold
          sleevesColor: '#7f1d1d',
          capColor: '#f59e0b',
          pattern: 'hoops',
        };
      case 2: // B. Singh (Royal Blue & White Stars)
        return {
          bodyColor: '#1d4ed8', // Royal Blue
          sashColor: '#ffffff', // White stars
          sleevesColor: '#1d4ed8',
          capColor: '#1d4ed8',
          pattern: 'stars',
        };
      case 3: // C. Alford (Scarlet & Emerald)
        return {
          bodyColor: '#dc2626', // Scarlet
          sashColor: '#059669', // Emerald
          sleevesColor: '#059669',
          capColor: '#dc2626',
          pattern: 'chevron',
        };
      case 4: // Patrick Quinn (Canary Yellow & Black)
        return {
          bodyColor: '#eab308',
          sashColor: '#0f172a',
          sleevesColor: '#eab308',
          capColor: '#0f172a',
          pattern: 'sash',
        };
      default:
        return {
          bodyColor: '#0284c7',
          sashColor: '#f8fafc',
          sleevesColor: '#0284c7',
          capColor: '#f8fafc',
          pattern: 'halves',
        };
    }
  };

  const silks = getSilkPattern(runner.saddleNumber);

  const dimensions =
    size === 'sm' ? { width: 72, height: 72 } :
    size === 'lg' ? { width: 180, height: 180 } :
    { width: 110, height: 110 };

  return (
    <div
      style={{ width: dimensions.width, height: dimensions.height }}
      className={`relative shrink-0 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 shadow-lg ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`glow-${runner.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#06090e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`coat-${runner.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={coatHex} />
            <stop offset="100%" stopColor="#0a0502" />
          </linearGradient>
        </defs>

        {/* Ambient Backdrop Ring */}
        <circle cx="60" cy="60" r="56" fill={`url(#glow-${runner.id})`} />

        {/* Thoroughbred Silhouette / Profile */}
        <g id="horse-sculpt">
          {/* Muscular Neck & Head */}
          <path
            d="M28 85 Q35 62 48 50 Q56 42 68 38 Q74 36 78 30 Q80 26 84 27 Q88 28 87 34 Q86 38 82 44 Q88 47 92 53 Q94 56 90 60 Q85 64 78 62 Q72 68 62 76 Q52 84 42 88 Z"
            fill={`url(#coat-${runner.id})`}
            stroke="#000000"
            strokeWidth="0.8"
          />
          {/* Thoroughbred Muzzle */}
          <ellipse cx="89" cy="54" rx="4" ry="3.5" fill="#1c0f06" />
          {/* Nostril */}
          <circle cx="90.5" cy="54.5" r="1" fill="#050302" />
          {/* Thoroughbred Alert Eye */}
          <circle cx="78" cy="40" r="2.2" fill="#000000" />
          <circle cx="78.6" cy="39.6" r="0.8" fill="#ffffff" />
          {/* Pricked Ear */}
          <polygon points="76,33 80,24 83,31" fill={coatHex} stroke="#1c0f06" strokeWidth="0.5" />
          {/* White Star/Blaze Marking if Chestnut */}
          {runner.color === 'Chestnut' && (
            <polygon points="75,41 78,38 79,42 76,44" fill="#ffffff" opacity="0.9" />
          )}
          {/* Mane Highlights */}
          <path
            d="M48 52 Q58 45 68 39 M42 62 Q52 54 62 46 M36 72 Q46 64 54 56"
            stroke="#0a0502"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Reins & Bridle */}
          <path d="M86 52 L78 40 M78 40 L65 52 M88 56 L68 62" stroke="#d97706" strokeWidth="1" fill="none" />
        </g>

        {/* Jockey Portrait Inset on Top Right */}
        <g id="jockey-silks" transform="translate(14, 10)">
          {/* Jockey Helmet */}
          <ellipse cx="32" cy="22" rx="9" ry="7.5" fill={silks.capColor} stroke="#000000" strokeWidth="0.8" />
          {/* Helmet Peak */}
          <path d="M37 23 Q44 24 43 28 Q37 28 35 25 Z" fill="#0f172a" />
          {/* Goggles on Helmet */}
          <rect x="26" y="20" width="13" height="3" rx="1.5" fill="#38bdf8" opacity="0.85" stroke="#000000" strokeWidth="0.5" />
          {/* Jockey Face */}
          <path d="M26 25 Q32 30 38 25 L37 31 Q32 35 27 31 Z" fill="#fbcfe8" />
          {/* Jockey Silk Collar & Body */}
          <path d="M22 33 L42 33 L45 52 L19 52 Z" fill={silks.bodyColor} stroke="#000000" strokeWidth="0.8" />
          {/* Silk Pattern: Sash, Chevron or Hoops */}
          {silks.pattern === 'hoops' && (
            <>
              <line x1="20" y1="39" x2="44" y2="39" stroke={silks.sashColor} strokeWidth="3" />
              <line x1="19" y1="46" x2="45" y2="46" stroke={silks.sashColor} strokeWidth="3" />
            </>
          )}
          {silks.pattern === 'stars' && (
            <>
              <polygon points="32,36 33,39 36,39 33.5,41 34.5,44 32,42 29.5,44 30.5,41 28,39 31,39" fill="#ffffff" />
            </>
          )}
          {silks.pattern === 'chevron' && (
            <polyline points="20,40 32,46 44,40" fill="none" stroke={silks.sashColor} strokeWidth="4" />
          )}
          {silks.pattern === 'sash' && (
            <line x1="22" y1="34" x2="43" y2="51" stroke={silks.sashColor} strokeWidth="4" />
          )}
        </g>

        {/* Saddle Cloth Number Shield on Bottom Left */}
        <g id="saddle-number">
          <rect
            x="8"
            y="82"
            width="26"
            height="26"
            rx="8"
            fill={runner.modelRole === 'Top Pick' ? '#10b981' : '#0f172a'}
            stroke="#ffffff"
            strokeWidth="1.2"
          />
          <text
            x="21"
            y="100"
            fontFamily="monospace"
            fontSize="14"
            fontWeight="900"
            textAnchor="middle"
            fill={runner.modelRole === 'Top Pick' ? '#022c22' : '#ffffff'}
          >
            {runner.saddleNumber}
          </text>
        </g>

        {/* Stall / Draw Badge */}
        <g id="draw-badge">
          <rect x="76" y="94" width="36" height="18" rx="6" fill="#000000" opacity="0.85" stroke="#ffffff" strokeWidth="0.6" />
          <text x="94" y="106" fontFamily="sans-serif" fontSize="9" fontWeight="800" textAnchor="middle" fill="#38bdf8">
            STALL {runner.draw}
          </text>
        </g>
      </svg>
    </div>
  );
};
