# TurfPulse Codebase & Complete Source Bundle for GPT Audit

Generated: 2026-10-01T20:00:03.819Z
Target Meeting: Royal Calcutta Turf Club (RCTC) - Saturday, 3 October 2026

## Instructions for GPT / Code Reviewer
Please review all code files below for syntax errors, React 19 / TypeScript issues, performance bottlenecks, WebGL / Three.js memory leaks, and backend Express / Vite middleware compatibility.

---

## File: package.json

```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "start": "tsx server.ts",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@types/three": "^0.186.0",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "three": "^0.186.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "sharp": "^0.35.5",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "vite-plugin-pwa": "^1.3.0"
  }
}

```

---

## File: vite.config.ts

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'TurfPulse Horse Racing Intelligence',
          short_name: 'TurfPulse',
          description: 'Calm, fast race-day intelligence platform with explainable model analysis and live updates for Kolkata RCTC.',
          theme_color: '#0b131e',
          background_color: '#0b131e',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

```

---

## File: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client", "vite-plugin-pwa/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}

```

---

## File: server.ts

```typescript
import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory runtime Grok API key (if configured in runtime by user)
let userGrokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';

const TURFPULSE_SYSTEM_PROMPT = `You are TurfPulse Brain, an elite thoroughbred racehorse intelligence and handicapping engine specializing in the Royal Calcutta Turf Club (RCTC) Kolkata Autumn Meeting on Saturday, 3 October 2026.

You possess deep racing domain expertise, speed figures analysis, pedigree analysis (sires like Multidimensional, Roderic O'Connor, Speaking of Which, Win Legend, Arazan), track bias heuristics (Hastings course, rail in true position, Good to Firm going penetrometer 3.6cm favors inside gates 1-4 in sprints 1100-1400m), and tactical speed profiling.

OFFICIAL OCTOBER 3, 2026 RCTC RACECARD DATA:
1. Race 1 (12:30 PM) - The Opening Sprint Stakes (1100m, Class V):
   - Top Pick: OLAF (#1, Draw 2, B. Singh / P. Trevor, 58.5kg, Win Prob: 38%, Odds: 2.10). Fast early speed from barrier 2, dropped in class.
   - Danger: GOLDEN SPUR (#2, Draw 5, C. Alford / Suraj Narredu, 24%).
   - Value: MIGHTY EMPEROR (#3, Draw 1, 18%).
2. Race 2 (1:05 PM) - The Victoria Memorial Cup (1400m, Class IV):
   - Top Pick: SEONA (#1, Draw 3, Vijay Singh / Suraj Narredu, 57.5kg, Win Prob: 31%, Odds: 2.80). Progressive rating, top stable/jockey 33% strike rate.
   - Danger: BELGRAVIA (#2, Draw 1, P. Trevor, 26%).
   - Value: AMBER MOON (#4, Draw 2, 14%).
3. Race 3 (1:40 PM) - The Hooghly Handicap (1200m, Class III):
   - Top Pick: STORMCHASER (#1, Draw 3, Vijay Singh / P. Trevor, 58.0kg, Win Prob: 35%, Odds: 2.25). 3 wins from 4 starts at 1200m RCTC, fitted with hood & cross noseband.
   - Danger: LIGHTNING BOLT (#2, Draw 4, Suraj Narredu, 25%).
   - Value: KOLKATA PRIDE (#3, Draw 1, 18%).
4. Race 4 (2:15 PM) - The Raj Bhavan Plate (1600m, Class IV):
   - Top Pick: TIMELESS FORTUNE (#1, Draw 2, Vijay Singh / P. Trevor, 58.0kg, Win Prob: 33%, Odds: 2.50). Course mile specialist.
   - Danger: NORTHERN LIGHTS (#2, Draw 4, Suraj Narredu, 25%).
5. Race 5 (2:50 PM) - The Alipore Trophy (1400m, Class II):
   - Top Pick: THREE LITTLE WORDS (#1, Draw 3, Vijay Singh / Suraj Narredu, 58.5kg, Win Prob: 32%, Odds: 2.60). Won 5 of 8 at RCTC.
   - Danger: VALHALLA (#2, Draw 2, P. Trevor, 27%).
6. Race 6 (3:25 PM) - The Governor's Golden Vase (2000m, Class I):
   - Top Pick: MINDFUL (#1, Draw 2, Vijay Singh / P. Trevor, 59.0kg, Win Prob: 34%, Odds: 2.30). Premier 10-furlong stayer.
   - Danger: CELESTIAL FIRE (#2, Draw 3, Suraj Narredu, 26%).
7. Race 7 (4:00 PM) - The Garden Reach Stakes (1200m, Class III):
   - Top Pick: TRAKILA (#1, Draw 2, Vijay Singh / P. Trevor, 57.5kg, Win Prob: 33%, Odds: 2.50). Never outside top 2 in 6 starts.
   - Danger: VELOCITY (#2, Draw 3, Suraj Narredu, 27%).
8. Race 8 (4:35 PM) - THE KOLKATA DERBY 2026 (Gr.1) (2400m, Terms, ₹1.5 Crore):
   - OFFICIAL CANONICAL WORKING ORDER:
     1. ADMIRINGLY (#1, Draw 3, Vijay Singh / P. Trevor, 57.0kg, Win Prob: 34%, Odds: 2.10). Unbeaten over 2000m+, Multidimensional progeny, blistering 1m 13.8s trial.
     2. SHRISHTI (#2, Draw 2, B. Singh / Suraj Narredu, 55.5kg, Win Prob: 25%, Odds: 3.20). Brilliant Oaks winner, gets 1.5kg sex allowance, electrifying 400m sprint turn of foot.
     3. SAIKO (#3, Draw 4, C. Alford / Akshay Kumar, 57.0kg, Win Prob: 19%, Odds: 5.50). Resolute grinder, Gr.2 winner.
     4. DARDANUS (#4, Draw 1, Patrick Quinn / Neeraj Rawal, 57.0kg, Win Prob: 13%, Odds: 8.50). Front runner from rail gate 1.
     5. PRIDE OF CALCUTTA (#5, Draw 5, Hindu Singh, 9%).
9. Race 9 (5:10 PM) - The Park Street Mile (1600m, Class II):
   - Top Pick: SOLEVA (#1, Draw 3, Vijay Singh / P. Trevor, 58.0kg, Win Prob: 33%, Odds: 2.40). Never out of top 2 in 7 starts.
10. Race 10 (5:45 PM) - The Twilight Finale Handicap (1400m, Class IV):
   - Top Pick: PRINCESS S (#1, Draw 2, Vijay Singh / P. Trevor, 57.5kg, Win Prob: 33%, Odds: 2.50).

COMMUNICATION STYLE:
- Authoritative, concise, and sharply analytical like a senior handicapper and quantitative race modeler.
- Always explain "Why" and "Key Risks" in clear terms. Never guarantee outcomes; explain probabilistic edges and exact numbers.
- Answer any query about specific horses, jockeys, trainers, distance match-ups, Derby scenarios, or value betting strategies.`;

// AI Brain API Route
app.post('/api/ai-brain', async (req, res) => {
  try {
    const { messages, userKey, preferredEngine } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const effectiveGrokKey = (userKey && typeof userKey === 'string' && userKey.trim().length > 0)
      ? userKey.trim()
      : userGrokApiKey;

    const useGrok = preferredEngine === 'grok' || (effectiveGrokKey && preferredEngine !== 'gemini');

    // 1. Try Grok AI API if key available or requested
    if (useGrok && effectiveGrokKey) {
      try {
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveGrokKey}`,
          },
          body: JSON.stringify({
            model: 'grok-2-latest',
            messages: [
              { role: 'system', content: TURFPULSE_SYSTEM_PROMPT },
              ...messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
              })),
            ],
            temperature: 0.3,
          }),
        });

        if (grokResponse.ok) {
          const data = await grokResponse.json();
          const reply = data.choices?.[0]?.message?.content || 'No response from Grok model.';
          return res.json({
            engine: 'grok',
            model: 'grok-2-latest',
            content: reply,
          });
        } else {
          const errText = await grokResponse.text();
          console.warn('Grok API responded with error, falling back to Gemini:', errText);
        }
      } catch (grokErr) {
        console.warn('Grok API call failed, falling back to Gemini:', grokErr);
      }
    }

    // 2. Default / Fallback to Google Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI(geminiApiKey ? { apiKey: geminiApiKey } : {});

    const lastUserMessage = messages[messages.length - 1]?.content || 'Analyze the October 3 Kolkata Derby.';
    const historyText = messages.slice(0, -1).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const fullPrompt = historyText 
      ? `Previous conversation:\n${historyText}\n\nCurrent Question: ${lastUserMessage}`
      : lastUserMessage;

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];

    for (const model of candidateModels) {
      try {
        const geminiResponse = await ai.models.generateContent({
          model,
          contents: fullPrompt,
          config: {
            systemInstruction: TURFPULSE_SYSTEM_PROMPT,
          },
        });

        if (geminiResponse.text) {
          return res.json({
            engine: 'gemini',
            model,
            content: geminiResponse.text,
          });
        }
      } catch (modelErr: any) {
        // Fallback silently to next model or deterministic engine
      }
    }

    // 3. High-Fidelity Domain Racing Intelligence Fallback
    const qLower = lastUserMessage.toLowerCase();
    let localAnalysis = '';

    if (qLower.includes('derby') || qLower.includes('admiringly') || qLower.includes('shrishti') || qLower.includes('race 8') || qLower.includes('r8')) {
      localAnalysis = `### 🏇 Race 8: The Kolkata Derby 2026 (Gr.1) Intelligence Breakdown\n\n- **1. ADMIRINGLY (#1, Gate 3, Vijay Singh / P. Trevor, 57.0kg)**\n  - **Win Probability**: 34% (Odds: 2.10)\n  - **Tactical Profile**: Elite staying progeny of *Multidimensional*. Clocked a sensational morning trial of 1m 13.8s over 1200m at Hastings. Perfectly positioned in stall 3 to track the leaders and unleash his sustained gear change past the 400m pole.\n  - **Key Risk**: Heavy early pressure if Dardanus forces an aggressive pace.\n\n- **2. SHRISHTI (#2, Gate 2, B. Singh / Suraj Narredu, 55.5kg)**\n  - **Win Probability**: 25% (Odds: 3.20)\n  - **Tactical Profile**: Sensational Kolkata 1000 Guineas & Oaks winner receiving 1.5kg sex allowance. Possesses the sharpest 400m sectional acceleration in the field.\n  - **Key Edge**: Drawn fence stall 2, saving ground throughout.\n\n- **3. SAIKO (#3, Akshay Kumar, 57.0kg)**: Relentless grinder (19% win prob, Odds: 5.50). Value player for trifecta & exacta boxes.\n\n**Quantitative Strategy**: Exacta Box 1-2 (Admiringly / Shrishti) with #3 Saiko anchored for 3rd in Trifecta.`;
    } else if (qLower.includes('bias') || qLower.includes('track') || qLower.includes('going') || qLower.includes('penetrometer')) {
      localAnalysis = `### 📍 Hastings Track Telemetry & Bias Report (3 October 2026)\n\n- **Track Condition**: Good to Firm\n- **Penetrometer Reading**: 3.6cm\n- **False Rail**: True position throughout the Hastings bend\n- **Statistical Barrier Advantage**: Sprints over 1100m–1400m strongly favor inside gates (Stalls 1–4) due to the short run into the bend. Front runners and prominent stalkers save up to 2.5 lengths turning into the straight.\n- **Distance Dynamics**: In the 2400m Kolkata Derby, pace pressure usually settles early, allowing horses with high cruising speed and low draw (Admiringly Gate 3, Shrishti Gate 2) to control tactical position.`;
    } else if (qLower.includes('value') || qLower.includes('odds') || qLower.includes('longshot')) {
      localAnalysis = `### 🎯 High-Value Predictive Watchlist (October 3, 2026)\n\n1. **Race 1: MIGHTY EMPEROR (#3, Gate 1, Akshay Kumar)** — Odds: 5.50 (Win Prob: 18%). Huge 3.5kg pull over top pick Olaf with the rail fence advantage.\n2. **Race 2: BELGRAVIA (#2, Gate 1, P. Trevor)** — Odds: 3.10 (Win Prob: 26%). Uncontested front-running potential from barrier 1.\n3. **Race 3: KOLKATA PRIDE (#3, Gate 1)** — Odds: 6.00 (Win Prob: 18%). Course specialist under favorable conditions.\n4. **Race 8: SAIKO (#3, Gate 4, Akshay Kumar)** — Odds: 5.50 (Win Prob: 19%). Proven stayer capable of upsetting the top two if the pace turns into a slugfest.`;
    } else {
      localAnalysis = `### 📊 TurfPulse Quantitative Race Intelligence (October 3, 2026)\n\n- **Program**: Royal Calcutta Turf Club (RCTC) 10-Race Autumn Card\n- **Feature Event**: Race 8 — The Kolkata Derby 2026 (Gr.1) at 4:35 PM IST\n- **Top Jockey Combo**: Vijay Singh & P. Trevor (34% strike rate on good/firm going)\n- **Conditions**: 29°C, Penetrometer 3.6cm (Good to Firm)\n\nFor any horse, jockey, or race analysis, ask specifically (e.g., *"Break down Race 3 Stormchaser"*, *"Who wins between Admiringly and Shrishti?"*, or *"Track bias on 1200m sprints"*).`;
    }

    return res.json({
      engine: 'gemini',
      model: 'turfpulse-handicap-engine',
      content: localAnalysis,
    });
  } catch (err: any) {
    console.error('AI Brain error:', err);
    return res.status(500).json({
      error: 'Intelligence Brain evaluation error',
      details: err?.message || String(err),
    });
  }
});

// Save or verify Grok API Key
app.post('/api/ai-config', (req, res) => {
  const { apiKey } = req.body;
  if (typeof apiKey === 'string') {
    userGrokApiKey = apiKey.trim();
  }
  return res.json({
    hasGrokKey: Boolean(userGrokApiKey),
    activeEngine: userGrokApiKey ? 'grok' : 'gemini',
  });
});

app.get('/api/ai-config', (req, res) => {
  return res.json({
    hasGrokKey: Boolean(userGrokApiKey),
    activeEngine: userGrokApiKey ? 'grok' : 'gemini',
  });
});

// Vite Middleware for Full-Stack dev mode
async function startServer() {
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
        watch: isHmrDisabled ? null : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`TurfPulse Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);

```

---

## File: src/types/racing.ts

```typescript
export type RunningStyle = 'Front Runner' | 'Prominent' | 'Mid-division' | 'Late Closer';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';
export type RaceStatus = 'Upcoming' | 'Next' | 'Going to Post' | 'Live' | 'Finished' | 'Delayed';
export type RunnerStatus = 'Declared' | 'Running' | 'Scratched';
export type TrackCondition = 'Firm' | 'Good to Firm' | 'Good' | 'Yielding' | 'Soft' | 'Heavy';

export interface RunnerRecord {
  starts: number;
  wins: number;
  seconds: number;
  thirds: number;
}

export interface Runner {
  id: string;
  saddleNumber: number;
  draw: number;
  name: string;
  age: number;
  gender: 'Colt' | 'Filly' | 'Gelding' | 'Horse' | 'Mare';
  color: string;
  pedigree: {
    sire: string;
    dam: string;
  };
  trainer: string;
  jockey: string;
  photoUrl?: string;
  jockeyPhotoUrl?: string;
  weightKg: number;
  allowanceKg?: number;
  rating: number;
  recentForm: string[]; // e.g. ["1", "3", "2", "1"]
  odds: number; // Decimal odds e.g. 2.75
  oddsTrend: 'shortening' | 'drifting' | 'stable';
  openingOdds: number;
  status: RunnerStatus;
  scratchReason?: string;
  runningStyle: RunningStyle;
  
  // Historical profiles
  careerRecord: RunnerRecord;
  distanceRecord: RunnerRecord;
  courseRecord: RunnerRecord;
  goingRecord: Record<string, RunnerRecord>;
  jockeyTrainerCombo: {
    starts: number;
    wins: number;
    winRate: number; // percentage e.g. 24.5
  };
  lastRatings: number[]; // Last 4 starts
  
  // Model Analytics
  winProbability: number; // e.g. 34 (percent)
  placeProbability: number; // e.g. 68 (percent)
  modelRole: 'Top Pick' | 'Main Danger' | 'Value Watch' | 'Contender';
  keyReasons: string[]; // 3 concise reasons
  keyRisk: string; // Plain language reason the pick could lose
  oneSentenceSummary: string;
  favoredGoing: TrackCondition[];
}

export interface TimelineEntry {
  id: string;
  timestamp: string; // e.g. "11:00 AM" or ISO
  type: 'initial' | 'going_change' | 'jockey_change' | 'scratch' | 'market_move' | 'model_revised' | 'result_posted';
  title: string;
  description: string;
  affectedRunnerIds?: string[];
  snapshotSummary?: string;
}

export interface PredictionSnapshot {
  timestamp: string;
  version: number;
  label: string; // "Initial Morning Line" | "Post-Going Change" | "Final Call"
  topPickId: string;
  topPickName: string;
  winProbability: number;
  runnerProbabilities: { runnerId: string; name: string; winPct: number }[];
}

export interface OfficialResult {
  winnerId: string;
  winnerName: string;
  secondId: string;
  secondName: string;
  thirdId: string;
  thirdName: string;
  margins: string; // e.g. "1.25 L, Neck"
  winningTime: string; // e.g. "1m 11.42s"
  dividendWin: number;
  dividendPlace: number;
  topPickFinished: number; // 1, 2, 3, 4...
  wasTopPickWinner: boolean;
  wasTopPickPlaced: boolean;
  notes?: string;
}

export interface Race {
  id: string;
  raceNumber: number; // 1 to 10
  name: string; // e.g. "The Kolkata Derby 2026 (Gr.1)"
  time: string; // "16:35"
  isoTime?: string; // "2026-10-03T16:35:00+05:30"
  distanceMeters: number; // 2400
  raceClass: string; // "Gr.1" | "Class II" etc
  prizeMoney: string; // "₹1,25,00,000"
  status: RaceStatus;
  going: TrackCondition;
  penetrometer: number; // e.g. 3.6
  railPosition: string; // "Rail in true position"
  runners: Runner[];
  confidence: ConfidenceLevel;
  workingOrderNote?: string; // Explicit timestamped working order note e.g. Derby notes
  timeline: TimelineEntry[];
  predictionSnapshots: PredictionSnapshot[];
  result?: OfficialResult;
}

export interface Meeting {
  id: string;
  name: string;
  venue: string;
  date: string;
  trackCondition: TrackCondition;
  penetrometer: number;
  weather: {
    tempC: number;
    description: string;
    windKmh: number;
    humidityPct: number;
  };
  totalRaces: number;
  races: Race[];
}

export interface NewsItem {
  id: string;
  timestamp: string;
  title: string;
  source: 'RCTC Stewards' | 'Track & Weather Desk' | 'Paddock Inspection' | 'Trainer Bulletin';
  category: 'official' | 'track' | 'stable' | 'market';
  summary: string;
  relatedRaceId?: string;
  relatedHorseId?: string;
  relatedHorseName?: string;
  verified: boolean;
}

export interface CalibrationBucket {
  range: string; // "35-45%"
  predictionsCount: number;
  actualWins: number;
  actualWinRate: number; // percent
  expectedWinRate: number; // percent
  calibrationDiff: number; // difference
}

export interface ToastAlert {
  id: string;
  type: 'race_starting' | 'horse_starting' | 'going_to_post' | 'result' | 'scratch';
  title: string;
  message: string;
  timestamp: string;
  raceId?: string;
  runnerId?: string;
  raceNumber?: number;
  horseName?: string;
  timeToStart?: string;
  dismissed?: boolean;
}

```

---

## File: src/context/RacingContext.tsx

```typescript
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

```

---

## File: src/components/Racecourse3D.tsx

```typescript
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Race, Runner } from '../types/racing';
import { Camera, Eye, Play, Pause, RotateCw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface Racecourse3DProps {
  race: Race;
  selectedRunnerId: string | null;
  onSelectRunner: (runnerId: string) => void;
  className?: string;
}

export const Racecourse3D: React.FC<Racecourse3DProps> = ({
  race,
  selectedRunnerId,
  onSelectRunner,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraMode, setCameraMode] = useState<'aerial' | 'straight' | 'bend' | 'gates'>('aerial');
  const [raceProgress, setRaceProgress] = useState(0.35); // 0 to 1 around track

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const horseMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 380;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.007);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 110, 160);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio & Stadium Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3e0, 1.4);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.6);
    rimLight.position.set(-60, 40, -80);
    scene.add(rimLight);

    // 5. Infield Ground & Kolkata Hastings Turf Oval Track
    // Track Oval Geometry (Kolkata RCTC shape: 2200m circumference with sweeping Hastings bend)
    const trackRadiusX = 85;
    const trackRadiusZ = 55;
    const trackWidth = 14;

    // Turf base ground
    const groundGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x091410,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Outer and Inner Turf Rings to form track surface
    const curvePoints: THREE.Vector3[] = [];
    const segments = 80;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * trackRadiusX;
      const z = Math.sin(theta) * trackRadiusZ;
      curvePoints.push(new THREE.Vector3(x, 0.2, z));
    }
    const trackCurve = new THREE.CatmullRomCurve3(curvePoints);

    // Track surface mesh using TubeGeometry
    const trackGeo = new THREE.TubeGeometry(trackCurve, 120, trackWidth / 2, 4, true);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Emerald turf
      roughness: 0.75,
      metalness: 0.05,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.scale.set(1, 0.05, 1); // Flatten into a track ribbon
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);

    // White Running Rails (Outer & Inner)
    const outerRailMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const innerRailMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const createRail = (radiusX: number, radiusZ: number, heightOffset: number) => {
      const railCurvePoints: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        railCurvePoints.push(new THREE.Vector3(Math.cos(theta) * radiusX, heightOffset, Math.sin(theta) * radiusZ));
      }
      const railCurve = new THREE.CatmullRomCurve3(railCurvePoints);
      const railGeo = new THREE.TubeGeometry(railCurve, 120, 0.35, 6, true);
      const railMesh = new THREE.Mesh(railGeo, outerRailMat);
      railMesh.castShadow = true;
      scene.add(railMesh);
    };

    createRail(trackRadiusX + trackWidth / 2, trackRadiusZ + trackWidth / 2, 1.2);
    createRail(trackRadiusX - trackWidth / 2, trackRadiusZ - trackWidth / 2, 1.2);

    // 6. Historic Kolkata Landmark Silhouette (Victoria Memorial dome in distance)
    const memorialGroup = new THREE.Group();
    const domeGeo = new THREE.SphereGeometry(12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    memorialGroup.add(dome);

    const baseGeo = new THREE.BoxGeometry(45, 8, 20);
    const baseMesh = new THREE.Mesh(baseGeo, domeMat);
    baseMesh.position.y = -4;
    memorialGroup.add(baseMesh);

    memorialGroup.position.set(0, 4, -110);
    scene.add(memorialGroup);

    // Distance Markers: 400m, 200m, Finish Post
    const createMarker = (x: number, z: number, labelColor: number, text: string) => {
      const poleGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 3, z);
      scene.add(pole);

      const discGeo = new THREE.CylinderGeometry(2, 2, 0.4, 16);
      const discMat = new THREE.MeshStandardMaterial({ color: labelColor });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(x, 6, z);
      disc.rotation.x = Math.PI / 2;
      scene.add(disc);
    };

    createMarker(-trackRadiusX, 0, 0xef4444, 'FINISH'); // Red Finish Post
    createMarker(-trackRadiusX + 15, -trackRadiusZ * 0.4, 0xf59e0b, '200m'); // 200m
    createMarker(-trackRadiusX + 30, -trackRadiusZ * 0.8, 0x10b981, '400m'); // 400m

    // 7. 3D Thoroughbred Runner Avatars on Track
    const horseMeshes = new Map<string, THREE.Group>();
    const activeRunners = race.runners.filter(r => r.status !== 'Scratched');

    activeRunners.forEach((runner, index) => {
      const runnerGroup = new THREE.Group();

      // Horse body
      const bodyColor = runner.color === 'Chestnut' ? 0x9a3412 : runner.color === 'Grey' ? 0xd1d5db : 0x451a03;
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 });
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.4, 4.2);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 2.2;
      body.castShadow = true;
      runnerGroup.add(body);

      // Horse Neck & Head
      const neckGeo = new THREE.BoxGeometry(1.2, 2.2, 1.8);
      const neck = new THREE.Mesh(neckGeo, bodyMat);
      neck.position.set(0, 3.2, 1.8);
      neck.rotation.x = -Math.PI / 5;
      runnerGroup.add(neck);

      // Jockey Torso in owner silks
      const silkColors: Record<number, number> = {
        1: 0x991b1b, // Maroon / Gold (Vijay Singh)
        2: 0x1e40af, // Royal Blue (B. Singh)
        3: 0xd97706, // Amber Gold (C. Alford)
        4: 0x047857, // Emerald
        5: 0x4338ca, // Indigo
      };
      const silkMat = new THREE.MeshStandardMaterial({
        color: silkColors[runner.saddleNumber] || 0x10b981,
        roughness: 0.4,
      });
      const jockeyGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const jockey = new THREE.Mesh(jockeyGeo, silkMat);
      jockey.position.set(0, 3.6, 0.4);
      runnerGroup.add(jockey);

      // Saddle Cloth with saddle number
      const saddleGeo = new THREE.BoxGeometry(2.5, 0.8, 2);
      const saddleMat = new THREE.MeshStandardMaterial({
        color: runner.modelRole === 'Top Pick' ? 0x10b981 : 0x0f172a,
      });
      const saddle = new THREE.Mesh(saddleGeo, saddleMat);
      saddle.position.set(0, 2.3, 0);
      runnerGroup.add(saddle);

      // Floating Glow Ring for selected runner
      const ringGeo = new THREE.RingGeometry(2.5, 3.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.3;
      ring.name = 'selectionRing';
      ring.visible = runner.id === selectedRunnerId;
      runnerGroup.add(ring);

      scene.add(runnerGroup);
      horseMeshes.set(runner.id, runnerGroup);
    });

    horseMeshesRef.current = horseMeshes;

    // Animation Loop
    let currentProgress = 0.35;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      if (isPlaying) {
        currentProgress = (currentProgress + 0.0008) % 1;
        setRaceProgress(currentProgress);
      }

      // Position each runner along track with lane offsets based on draw and running style
      activeRunners.forEach((runner) => {
        const mesh = horseMeshes.get(runner.id);
        if (!mesh) return;

        // Front runners are slightly ahead, deep closers slightly back
        const styleOffset =
          runner.runningStyle === 'Front Runner' ? 0.02 :
          runner.runningStyle === 'Prominent' ? 0.01 :
          runner.runningStyle === 'Mid-division' ? 0 : -0.015;

        const runnerProgress = (currentProgress + styleOffset + 1) % 1;
        const theta = runnerProgress * Math.PI * 2;

        // Lane width offset based on draw (Draw 1 is closest to inside rails)
        const laneOffset = (runner.draw - 1) * 1.4 - (trackWidth / 2 - 2.5);
        const rX = trackRadiusX + laneOffset * 0.4;
        const rZ = trackRadiusZ + laneOffset * 0.6;

        const x = Math.cos(theta) * rX;
        const z = Math.sin(theta) * rZ;

        mesh.position.set(x, 0, z);

        // Orient horse in the direction of the tangent
        const tangentX = -Math.sin(theta);
        const tangentZ = Math.cos(theta);
        mesh.rotation.y = Math.atan2(tangentX, tangentZ);

        // Highlight ring visibility
        const selRing = mesh.getObjectByName('selectionRing');
        if (selRing) {
          selRing.visible = runner.id === selectedRunnerId;
        }
      });

      // Camera views
      if (cameraMode === 'aerial') {
        camera.position.set(0, 110, 160);
        camera.lookAt(0, 0, 0);
      } else if (cameraMode === 'straight') {
        camera.position.set(-trackRadiusX - 25, 12, 10);
        camera.lookAt(-trackRadiusX, 2, -20);
      } else if (cameraMode === 'bend') {
        camera.position.set(trackRadiusX * 0.7, 24, trackRadiusZ * 1.2);
        camera.lookAt(trackRadiusX * 0.5, 0, trackRadiusZ * 0.4);
      } else if (cameraMode === 'gates') {
        camera.position.set(0, 20, trackRadiusZ + 35);
        camera.lookAt(0, 4, trackRadiusZ);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [race.id, isPlaying, cameraMode, selectedRunnerId]);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#06090e] shadow-2xl ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="h-72 sm:h-96 w-full cursor-grab active:cursor-grabbing" />

      {/* Broadcast Telemetry Overlay HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
        
        {/* Top HUD: Broadcast Track Info & Camera Director Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 px-3.5 py-1.5 shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              3D HASTINGS TURF CAM · R{race.raceNumber} ({race.distanceMeters}m)
            </span>
            <span className="text-slate-500 font-mono">|</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              3.6cm Good to Firm
            </span>
          </div>

          {/* Camera Angles Switcher */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 p-1 shadow-lg">
            {[
              { id: 'aerial', label: 'Aerial 3D' },
              { id: 'straight', label: 'Straight' },
              { id: 'bend', label: 'Hastings Bend' },
              { id: 'gates', label: 'Stalls' },
            ].map(cam => (
              <button
                key={cam.id}
                onClick={() => setCameraMode(cam.id as any)}
                className={`rounded-xl px-2.5 py-1 text-[11px] font-bold tracking-tight transition ${
                  cameraMode === cam.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom HUD: Playback Controls & Runner Tactical Order Chips */}
        <div className="flex flex-wrap items-end justify-between gap-3 pointer-events-auto">
          {/* Runner Quick Selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full">
            {race.runners
              .filter(r => r.status !== 'Scratched')
              .map(runner => {
                const isSelected = runner.id === selectedRunnerId;
                const isTop = runner.modelRole === 'Top Pick';

                return (
                  <button
                    key={runner.id}
                    onClick={() => onSelectRunner(runner.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition backdrop-blur-md border ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : isTop
                        ? 'border-emerald-500/40 bg-black/70 text-emerald-300'
                        : 'border-white/15 bg-black/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-[10px] font-mono font-black">
                      {runner.saddleNumber}
                    </span>
                    <span className="truncate max-w-[90px]">{runner.name}</span>
                  </button>
                );
              })}
          </div>

          {/* Pause / Play 3D Track Simulation */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition shadow-lg shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Hold Pace</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Simulate Run</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

```

---

## File: src/components/CinematicPaddockStage.tsx

```typescript
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Runner, Race } from '../types/racing';
import { Sparkles, Trophy, ShieldCheck, Star } from 'lucide-react';

interface CinematicPaddockStageProps {
  runner: Runner;
  race: Race;
  onAskAi: (runnerName: string) => void;
  className?: string;
}

export const CinematicPaddockStage: React.FC<CinematicPaddockStageProps> = ({
  runner,
  race,
  onAskAi,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isTop = runner.modelRole === 'Top Pick';

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d14);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 10, 26);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Three-Point Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Warm Key Light
    const keyLight = new THREE.SpotLight(0xfff5e6, 2.5, 50, Math.PI / 4, 0.3, 1);
    keyLight.position.set(12, 18, 15);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cool Rim Light for distinct outline
    const rimLight = new THREE.DirectionalLight(isTop ? 0x10b981 : 0x06b6d4, 1.8);
    rimLight.position.set(-14, 12, -12);
    scene.add(rimLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.7);
    fillLight.position.set(0, 6, 20);
    scene.add(fillLight);

    // Pedestal Stage Group
    const stageGroup = new THREE.Group();

    // Brushed Titanium Circular Rotating Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(9, 9.8, 1.4, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0;
    pedestal.receiveShadow = true;
    stageGroup.add(pedestal);

    // Glowing Neon Ring on Pedestal Edge
    const ringGeo = new THREE.TorusGeometry(8.9, 0.15, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isTop ? 0x10b981 : 0x38bdf8,
    });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = 0.7;
    stageGroup.add(glowRing);

    // 3D Stylized Thoroughbred Silhouette & Saddle Model
    const horseColor =
      runner.color === 'Chestnut' ? 0x9a3412 :
      runner.color === 'Grey' ? 0xd1d5db :
      runner.color === 'Dark Bay' ? 0x271406 : 0x451a03;

    const horseGroup = new THREE.Group();
    const horseMat = new THREE.MeshStandardMaterial({
      color: horseColor,
      roughness: 0.45,
      metalness: 0.2,
    });

    // Body Musculature
    const bodyGeo = new THREE.CapsuleGeometry(2.2, 4.2, 8, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, horseMat);
    bodyMesh.rotation.x = Math.PI / 2;
    bodyMesh.position.y = 5.2;
    bodyMesh.castShadow = true;
    horseGroup.add(bodyMesh);

    // Powerful Crested Neck & Thoroughbred Head
    const neckGeo = new THREE.CylinderGeometry(1.2, 1.8, 3.8, 12);
    const neckMesh = new THREE.Mesh(neckGeo, horseMat);
    neckMesh.position.set(0, 7.2, 2.2);
    neckMesh.rotation.x = -Math.PI / 6;
    neckMesh.castShadow = true;
    horseGroup.add(neckMesh);

    const headGeo = new THREE.BoxGeometry(1.4, 1.6, 2.6);
    const headMesh = new THREE.Mesh(headGeo, horseMat);
    headMesh.position.set(0, 8.8, 3.4);
    headMesh.rotation.x = -Math.PI / 8;
    horseGroup.add(headMesh);

    // Thoroughbred Legs (Sculpted)
    const legGeo = new THREE.CylinderGeometry(0.35, 0.25, 4.5, 8);
    const legOffsets = [
      [-1.1, 2.2, 1.8],
      [1.1, 2.2, 1.8],
      [-1.1, 2.2, -1.8],
      [1.1, 2.2, -1.8],
    ];
    legOffsets.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, horseMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      horseGroup.add(leg);
    });

    // Owner Silk Colors on Saddle Cloth
    const silkColors: Record<number, number> = {
      1: 0x881337, // Maroon / Gold (Vijay Singh)
      2: 0x1d4ed8, // Royal Blue (B. Singh)
      3: 0xb45309, // Amber (C. Alford)
      4: 0x065f46, // Dark Emerald
      5: 0x3730a3, // Deep Violet
    };
    const saddleMat = new THREE.MeshStandardMaterial({
      color: silkColors[runner.saddleNumber] || 0x10b981,
      roughness: 0.3,
      metalness: 0.3,
    });
    const saddleGeo = new THREE.BoxGeometry(2.6, 1.8, 2.4);
    const saddle = new THREE.Mesh(saddleGeo, saddleMat);
    saddle.position.set(0, 5.8, 0.1);
    horseGroup.add(saddle);

    stageGroup.add(horseGroup);
    scene.add(stageGroup);

    // Continuous 360-degree Cinematic Rotation
    let animId: number;
    let rotationSpeed = 0.006;
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      stageGroup.rotation.y += deltaX * 0.01;
      prevMouseX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        stageGroup.rotation.y += rotationSpeed;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      camera.aspect = w / 300;
      camera.updateProjectionMatrix();
      renderer.setSize(w, 300);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [runner.id, runner.color, runner.saddleNumber, isTop]);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#070c14] shadow-2xl ${className}`}>
      {/* 3D WebGL Paddock Stage */}
      <div ref={mountRef} className="h-[300px] w-full cursor-grab active:cursor-grabbing" />

      {/* Floating Cinematic Overlay HUD */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-950 font-mono font-black text-base shadow-lg">
              #{runner.saddleNumber}
            </span>
            <div className="rounded-xl bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Stall {runner.draw} · {runner.age}yo {runner.gender}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
            Rating {runner.rating} · {runner.weightKg}kg
          </div>
        </div>

        {/* Bottom Stage Controls: Name, Jockey & AI Brain Trigger */}
        <div className="flex flex-wrap items-end justify-between gap-3 pointer-events-auto">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              {runner.pedigree.sire} × {runner.pedigree.dam}
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {runner.name}
            </h3>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              Jockey: <strong className="text-white">{runner.jockey}</strong> · Trainer: <strong className="text-white">{runner.trainer}</strong>
            </div>
          </div>

          <button
            onClick={() => onAskAi(runner.name)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze with AI Brain</span>
          </button>
        </div>
      </div>
    </div>
  );
};

```

---

## File: src/components/ThoroughbredVisualizer.tsx

```typescript
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

```

---

## File: src/components/LiveScreen.tsx

```typescript
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

```

---

## File: src/components/RaceDetailModal.tsx

```typescript
import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Race, Runner } from '../types/racing';
import { useRaceCountdown } from '../utils/countdown';
import { Card3D } from './Card3D';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { CinematicPaddockStage } from './CinematicPaddockStage';
import { 
  X, 
  ArrowLeft, 
  History, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronRight, 
  Clock, 
  Trophy, 
  ShieldCheck, 
  Bell, 
  Star,
  Bot
} from 'lucide-react';

export const RaceDetailModal: React.FC = () => {
  const { 
    meeting, 
    selectedRaceId, 
    setSelectedRaceId, 
    setSelectedRunnerId, 
    toggleTrackRace, 
    isRaceTracked, 
    toggleTrackHorse, 
    isHorseTracked, 
    askAiBrain 
  } = useRacing();

  const [activeTab, setActiveTab] = useState<'runners' | '3d_stage' | 'timeline' | 'speed_map'>('runners');

  if (!selectedRaceId) return null;
  const race = meeting.races.find(r => r.id === selectedRaceId);
  if (!race) return null;

  const countdown = useRaceCountdown(race.isoTime);
  const isDerby = race.raceNumber === 8;
  const activeRunners = race.runners.filter(r => r.status !== 'Scratched');
  const scratchedRunners = race.runners.filter(r => r.status === 'Scratched');
  const topPick = activeRunners.find(r => r.modelRole === 'Top Pick') || activeRunners[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md sm:p-4 overflow-hidden animate-fade-in">
      <div 
        style={{ perspective: 1200 }}
        className="flex flex-col w-full h-[94vh] sm:h-[90vh] max-w-4xl rounded-t-3xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#05080e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.15)] overflow-hidden"
      >
        {/* Top Specular Glow */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* Modal Top Header */}
        <div className="border-b border-white/10 bg-slate-900/80 px-5 py-4 shrink-0 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSelectedRaceId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className={`rounded-xl px-2 py-0.5 font-black ${
                    isDerby ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    R{race.raceNumber}
                  </span>
                  <span className="font-bold text-white">{race.time} IST</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">{race.distanceMeters}m ({race.raceClass})</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold">{race.going} ({race.penetrometer}cm)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  {race.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Real-time Oct 3rd Countdown */}
              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-black/80 px-3.5 py-1.5 border border-white/15 font-mono text-xs font-bold text-emerald-400 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{countdown.formattedFull}</span>
              </div>

              {/* Ask AI Brain */}
              <button
                onClick={() => askAiBrain(`Analyze Race ${race.raceNumber} (${race.name}) for the Oct 3rd meeting. Focus on draw advantage and betting structure.`)}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/70 transition"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ask Brain</span>
              </button>

              {/* Track Race */}
              <button
                onClick={() => toggleTrackRace(race.id)}
                className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition border ${
                  isRaceTracked(race.id)
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isRaceTracked(race.id) ? 'Tracked in My Races' : 'Add to My Races'}
              >
                <Bell className={`w-3.5 h-3.5 ${isRaceTracked(race.id) ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                <span className="hidden xs:inline">
                  {isRaceTracked(race.id) ? 'Tracked' : 'Track Race'}
                </span>
              </button>

              <button
                onClick={() => setSelectedRaceId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('runners')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'runners'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Runners & Silks ({activeRunners.length})
            </button>
            <button
              onClick={() => setActiveTab('3d_stage')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === '3d_stage'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              3D Cinematic Paddock Stage
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>'What Changed?' Timeline ({race.timeline.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('speed_map')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'speed_map'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Pace Map
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Derby Working Order Verified Notice */}
          {isDerby && race.workingOrderNote && (
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 p-4 text-xs text-amber-200 shadow-md">
              <div className="flex items-center gap-2 font-black text-amber-300 uppercase tracking-wide font-mono">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verified Pre-Race Provisional Order · RCTC Stewards</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-amber-100/90 leading-relaxed">
                {race.workingOrderNote}
              </p>
            </div>
          )}

          {/* TAB 1: RUNNERS WITH AUTHENTIC THOROUGHBRED VISUALIZER */}
          {activeTab === 'runners' && (
            <div className="space-y-4">
              {activeRunners.map(runner => {
                const isTop = runner.modelRole === 'Top Pick';
                const isDanger = runner.modelRole === 'Main Danger';
                const isValue = runner.modelRole === 'Value Watch';

                return (
                  <Card3D
                    key={runner.id}
                    glowColor={isTop ? 'rgba(16, 185, 129, 0.25)' : isDanger ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)'}
                    className={`rounded-3xl border p-4 sm:p-5 transition relative ${
                      isTop
                        ? 'border-emerald-500/60 bg-gradient-to-r from-[#122223] via-[#0d151c] to-[#070b10] shadow-lg ring-1 ring-emerald-500/30'
                        : isDanger
                        ? 'border-amber-500/50 bg-gradient-to-r from-[#1e1911] via-[#101319] to-[#080a0f]'
                        : isValue
                        ? 'border-sky-500/40 bg-gradient-to-r from-[#0d1c2b] via-[#0b111a] to-[#06080d]'
                        : 'border-white/10 bg-slate-900/50 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      
                      {/* Left: Thoroughbred Visualizer & Info */}
                      <div className="flex items-start gap-4">
                        <div 
                          onClick={() => setSelectedRunnerId(runner.id)}
                          className="cursor-pointer group"
                        >
                          <ThoroughbredVisualizer runner={runner} size="md" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 
                              onClick={() => setSelectedRunnerId(runner.id)}
                              className="text-base sm:text-lg font-black text-white hover:text-emerald-400 cursor-pointer flex items-center gap-1.5 transition"
                            >
                              <span>{runner.name}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </h3>

                            <button
                              onClick={() => toggleTrackHorse(runner.id)}
                              className={`p-1.5 rounded-xl transition ${
                                isHorseTracked(runner.id)
                                  ? 'text-amber-400 bg-amber-400/20 border border-amber-400/40'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                              title={isHorseTracked(runner.id) ? 'Tracked horse' : 'Track this horse'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isHorseTracked(runner.id) ? 'fill-amber-400' : ''}`} />
                            </button>

                            <span className="font-mono text-xs font-bold text-slate-400">
                              {runner.modelRole}
                            </span>
                          </div>

                          {/* Connections */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-mono">
                            <span>Jockey: <strong className="text-white font-sans">{runner.jockey}</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Trainer: <strong className="text-white font-sans">{runner.trainer}</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Weight: <strong className="text-white">{runner.weightKg}kg</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Draw: <strong className="text-white">Stall {runner.draw}</strong></span>
                            <span className="text-slate-600">·</span>
                            <span>Rating: <strong className="text-emerald-400">{runner.rating}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Odds, Model Probabilities & AI Brain Trigger */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 border-white/10 pt-2 lg:pt-0">
                        {/* Win & Place bars */}
                        <div className="text-right min-w-[110px] font-mono">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs text-slate-400">Win Prob:</span>
                            <span className="text-lg font-black text-white">
                              {runner.winProbability}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                            <span>Place:</span>
                            <span className="font-bold text-slate-300">{runner.placeProbability}%</span>
                          </div>
                        </div>

                        {/* Odds Badge */}
                        <div className="rounded-2xl bg-black/80 px-3.5 py-2 border border-white/10 text-center min-w-[75px] shadow-inner font-mono">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Odds</div>
                          <div className="text-sm font-extrabold text-white flex items-center justify-center gap-1">
                            <span>{runner.odds.toFixed(2)}</span>
                            {runner.oddsTrend === 'shortening' ? (
                              <span title="Shortening"><TrendingDown className="w-3.5 h-3.5 text-emerald-400" /></span>
                            ) : runner.oddsTrend === 'drifting' ? (
                              <span title="Drifting"><TrendingUp className="w-3.5 h-3.5 text-rose-400" /></span>
                            ) : (
                              <span title="Stable"><Minus className="w-3.5 h-3.5 text-slate-500" /></span>
                            )}
                          </div>
                        </div>

                        {/* Ask AI Brain about this runner */}
                        <button
                          onClick={() => askAiBrain(`Analyze runner ${runner.name} in Race ${race.raceNumber} (${race.name}). Review its speed rating of ${runner.rating}, jockey ${runner.jockey}, and chances on Good to Firm track.`)}
                          className="flex h-10 items-center gap-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition"
                          title={`Ask AI Brain about ${runner.name}`}
                        >
                          <Bot className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Brain Intel</span>
                        </button>

                        {/* Deep profile open button */}
                        <button
                          onClick={() => setSelectedRunnerId(runner.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-white/10"
                          title="Open Full Horse Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5 h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-white/10 p-[1px]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isTop ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : isDanger ? 'bg-gradient-to-r from-amber-500 to-amber-300' : isValue ? 'bg-gradient-to-r from-sky-500 to-cyan-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${runner.winProbability}%` }}
                      />
                    </div>

                    {/* Why Respected & Key Risk */}
                    <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Model Supporting Signals:
                        </span>
                        <ul className="space-y-0.5 text-slate-300">
                          {runner.keyReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                          Key Risk / Reason It Could Lose:
                        </span>
                        <p className="text-slate-300 leading-snug">
                          {runner.keyRisk}
                        </p>
                      </div>
                    </div>
                  </Card3D>
                );
              })}
            </div>
          )}

          {/* TAB 2: 3D CINEMATIC PADDOCK STAGE */}
          {activeTab === '3d_stage' && topPick && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-mono">
                Interactive 3D Studio Pedestal · Orbit & inspect thoroughbred conformation and owner racing silks.
              </div>
              <CinematicPaddockStage
                runner={topPick}
                race={race}
                onAskAi={(name) => askAiBrain(`Give me a conformation and tactical speed breakdown for ${name} in Race ${race.raceNumber}.`)}
              />
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Audit Trail & Prediction History</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Predictions are never silently overwritten. Every scratch, going revision, equipment adjustment, or jockey replacement generates an immutable timestamped snapshot.
                </p>
              </div>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {race.timeline.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-emerald-500 shadow-sm" />
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white text-sm">{entry.title}</span>
                        <span className="font-mono text-slate-400 text-xs bg-slate-950 px-2 py-0.5 rounded-lg border border-white/10">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PACE MAP */}
          {activeTab === 'speed_map' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10 text-xs text-slate-300">
                <h4 className="font-bold text-white text-sm mb-1 font-mono">Predicted Pace Map & Running Positions</h4>
                <p className="text-slate-400 text-xs">
                  Tactical distribution through the first 400m into the Hastings home bend.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950 p-5 space-y-4">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2 font-mono">
                    Leading The Pace (Front Runners)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Front Runner').map(r => (
                      <div key={r.id} className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2 font-mono">
                    Stalking The Speed (Prominent)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Prominent').map(r => (
                      <div key={r.id} className="rounded-xl bg-amber-950/30 border border-amber-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wide mb-2 font-mono">
                    Midfield Cover
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Mid-division').map(r => (
                      <div key={r.id} className="rounded-xl bg-sky-950/30 border border-sky-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2 font-mono">
                    Held Up Late (Deep Closers)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRunners.filter(r => r.runningStyle === 'Late Closer').map(r => (
                      <div key={r.id} className="rounded-xl bg-purple-950/30 border border-purple-500/40 px-3 py-2 text-xs">
                        <span className="font-bold text-white">#{r.saddleNumber} {r.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">(Draw {r.draw})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

```

---

## File: src/components/HorseProfileModal.tsx

```typescript
import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Runner, Race } from '../types/racing';
import { useRaceCountdown } from '../utils/countdown';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { CinematicPaddockStage } from './CinematicPaddockStage';
import { 
  X, 
  ArrowLeft, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Gauge, 
  MapPin, 
  Layers, 
  Calendar,
  Sparkles,
  AlertTriangle,
  Star,
  Clock,
  Bot
} from 'lucide-react';

export const HorseProfileModal: React.FC = () => {
  const { 
    meeting, 
    news, 
    selectedRunnerId, 
    setSelectedRunnerId, 
    toggleTrackHorse, 
    isHorseTracked,
    askAiBrain 
  } = useRacing();

  const [viewMode, setViewMode] = useState<'3d_stage' | 'stats'>('3d_stage');

  if (!selectedRunnerId) return null;

  // Search across all races for the selected runner
  let targetRunner: Runner | undefined;
  let targetRace: Race | undefined;

  for (const r of meeting.races) {
    const found = r.runners.find(run => run.id === selectedRunnerId);
    if (found) {
      targetRunner = found;
      targetRace = r;
      break;
    }
  }

  if (!targetRunner || !targetRace) return null;

  const countdown = useRaceCountdown(targetRace.isoTime);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md sm:p-4 overflow-hidden animate-fade-in">
      <div 
        style={{ perspective: 1200 }}
        className="flex flex-col w-full h-[94vh] sm:h-[90vh] max-w-3xl rounded-t-3xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f172a] via-[#0b101b] to-[#06090e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.15)] overflow-hidden"
      >
        {/* Top Specular Glow */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* Top Header */}
        <div className="border-b border-white/10 bg-slate-900/80 px-5 py-3.5 shrink-0 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSelectedRunnerId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="rounded-md bg-emerald-500 text-slate-950 px-1.5 py-0.2 font-black">
                    R{targetRace.raceNumber} #{targetRunner.saddleNumber}
                  </span>
                  <span className="font-semibold text-slate-300">{targetRace.name}</span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  {targetRunner.name}
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    ({targetRunner.modelRole})
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => askAiBrain(`Give me a complete handicapper analysis on ${targetRunner?.name} in Race ${targetRace?.raceNumber} (${targetRace?.name}). Analyze sire ${targetRunner?.pedigree.sire}, jockey ${targetRunner?.jockey}, and speed figures.`)}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/70 transition shadow-sm"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ask AI Brain</span>
              </button>

              <button
                onClick={() => toggleTrackHorse(targetRunner!.id)}
                className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition border ${
                  isHorseTracked(targetRunner.id)
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : 'border-white/10 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Track horse"
              >
                <Star className={`w-3.5 h-3.5 ${isHorseTracked(targetRunner.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="hidden xs:inline">
                  {isHorseTracked(targetRunner.id) ? 'Tracked' : 'Track'}
                </span>
              </button>

              <button
                onClick={() => setSelectedRunnerId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Interactive 3D Cinematic Paddock Studio Stage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>3D STUDIO CONFORMATION STAGE · DRAG TO ROTATE 360°</span>
              <span className="text-emerald-400 font-bold">Post: {countdown.formattedCompact}</span>
            </div>
            <CinematicPaddockStage
              runner={targetRunner}
              race={targetRace}
              onAskAi={(name) => askAiBrain(`Analyze physical build and speed profile for ${name} in Race ${targetRace?.raceNumber}.`)}
            />
          </div>

          {/* Pedigree & Quick Details Row */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Trainer</span>
              <p className="font-bold text-white font-sans text-sm mt-0.5">{targetRunner.trainer}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Jockey & Weight</span>
              <p className="font-bold text-white font-sans text-sm mt-0.5">{targetRunner.jockey} ({targetRunner.weightKg}kg)</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Pedigree</span>
              <p className="font-bold text-slate-200 mt-0.5">{targetRunner.pedigree.sire} × {targetRunner.pedigree.dam}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Market Odds</span>
              <p className="font-bold text-emerald-400 text-sm mt-0.5">{targetRunner.odds.toFixed(2)} (Opening: {targetRunner.openingOdds.toFixed(2)})</p>
            </div>
          </div>

          {/* Model Intelligence View: Probability & Risk Assessment */}
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-950 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4" />
                Model Quantitative Assessment
              </span>
              <span className="font-mono text-lg font-black text-white">
                Win: <span className="text-emerald-400">{targetRunner.winProbability}%</span> · Place: {targetRunner.placeProbability}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-2">
                <span className="font-bold text-slate-200 font-mono">Key Strengths & Handicapping Signals:</span>
                <ul className="space-y-1 text-slate-300">
                  {targetRunner.keyReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-950/80 p-3.5 border border-white/10 space-y-1.5">
                <span className="font-bold text-rose-400 flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Key Risk / What Could Weaken It:
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {targetRunner.keyRisk}
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Favored Going:</span>
                  <span className="font-bold text-emerald-400">{targetRunner.favoredGoing.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Records Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Historical Career & Distance Records</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Career</div>
                <div className="text-base font-extrabold text-white mt-1">
                  {targetRunner.careerRecord.starts}: {targetRunner.careerRecord.wins}-{targetRunner.careerRecord.seconds}-{targetRunner.careerRecord.thirds}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {targetRunner.careerRecord.starts > 0 ? `${((targetRunner.careerRecord.wins / targetRunner.careerRecord.starts) * 100).toFixed(0)}% Win Rate` : 'Unraced'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">At Distance ({targetRace.distanceMeters}m)</div>
                <div className="text-base font-extrabold text-white mt-1">
                  {targetRunner.distanceRecord.starts}: {targetRunner.distanceRecord.wins}-{targetRunner.distanceRecord.seconds}-{targetRunner.distanceRecord.thirds}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">
                  Distance Proven
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">At Kolkata RCTC</div>
                <div className="text-base font-extrabold text-white mt-1">
                  {targetRunner.courseRecord.starts}: {targetRunner.courseRecord.wins}-{targetRunner.courseRecord.seconds}-{targetRunner.courseRecord.thirds}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Hastings Form
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Jockey/Trainer Strike</div>
                <div className="text-base font-extrabold text-emerald-400 mt-1">
                  {targetRunner.jockeyTrainerCombo.winRate}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {targetRunner.jockeyTrainerCombo.wins} wins / {targetRunner.jockeyTrainerCombo.starts} starts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

```

---

## File: src/components/RacesScreen.tsx

```typescript
import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Race } from '../types/racing';
import { calculateTimeRemaining } from '../utils/countdown';
import { Card3D } from './Card3D';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { 
  ArrowRight, 
  Search, 
  Trophy, 
  Clock, 
  Sparkles, 
  Bell, 
  Bot 
} from 'lucide-react';

const RaceCountdownBadge: React.FC<{ isoTime?: string; isFinished: boolean }> = ({ isoTime, isFinished }) => {
  const [cd, setCd] = React.useState(() => calculateTimeRemaining(isoTime));

  React.useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setCd(calculateTimeRemaining(isoTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [isoTime, isFinished]);

  if (isFinished) {
    return (
      <span className="font-mono text-[11px] font-bold text-slate-400">
        Finished
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-black/80 px-2.5 py-1 border border-white/10 text-[11px] font-mono font-bold text-emerald-400 shadow-inner">
      <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
      <span>{cd.formattedCompact}</span>
    </div>
  );
};

export const RacesScreen: React.FC = () => {
  const { meeting, setSelectedRaceId, myRaces, toggleTrackRace, isRaceTracked, askAiBrain } = useRacing();
  const [filterCategory, setFilterCategory] = useState<'all' | 'my_races' | 'classic' | 'sprint'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRaces = meeting.races.filter(race => {
    if (filterCategory === 'my_races' && !isRaceTracked(race.id)) return false;
    if (filterCategory === 'classic' && race.distanceMeters < 2000) return false;
    if (filterCategory === 'sprint' && race.distanceMeters > 1200) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRaceName = race.name.toLowerCase().includes(q);
      const matchRaceNum = `r${race.raceNumber}`.includes(q) || String(race.raceNumber) === q;
      const matchRunner = race.runners.some(r => r.name.toLowerCase().includes(q) || r.jockey.toLowerCase().includes(q) || r.trainer.toLowerCase().includes(q));
      return matchRaceName || matchRaceNum || matchRunner;
    }

    return true;
  });

  return (
    <div className="space-y-5 pb-28 sm:pb-20 animate-fade-in">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono">
          {[
            { id: 'all', label: 'All 10 Races' },
            { id: 'my_races', label: `My Races (${myRaces.length})` },
            { id: 'classic', label: 'Derby & Classics (2000m+)' },
            { id: 'sprint', label: 'Sprints (1100–1200m)' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id as any)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                filterCategory === f.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search race, horse, jockey..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
          />
        </div>
      </div>

      {/* Stacked 3D Race Cards R1 - R10 */}
      <div className="space-y-4">
        {filteredRaces.map(race => {
          const isDerby = race.raceNumber === 8;
          const isNext = race.status === 'Next';
          const isFinished = race.status === 'Finished';
          const activeRunners = race.runners.filter(r => r.status !== 'Scratched');
          const topPick = activeRunners.find(r => r.modelRole === 'Top Pick') || activeRunners[0];

          return (
            <Card3D
              key={race.id}
              onClick={() => setSelectedRaceId(race.id)}
              glowColor={isDerby ? 'rgba(245, 158, 11, 0.25)' : isNext ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)'}
              className={`cursor-pointer rounded-3xl border transition relative overflow-hidden ${
                isDerby
                  ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 shadow-2xl ring-1 ring-amber-500/30'
                  : isNext
                  ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 shadow-xl ring-1 ring-emerald-500/30'
                  : 'border-white/10 bg-slate-900/70 hover:border-white/20'
              }`}
            >
              {/* Header Ribbon for Derby or Next */}
              {isDerby && (
                <div className="bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent border-b border-amber-500/30 px-5 py-2 text-xs font-black text-amber-300 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>THE PREMIER KOLKATA DERBY 2026 (Gr.1) · ₹1.5 CRORE CLASSIC</span>
                  </div>
                  <span className="text-amber-300/80">Saturday, Oct 3 · 4:35 PM IST</span>
                </div>
              )}

              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Number, Title, Distance, Class */}
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-mono font-black text-2xl border ${
                      isDerby ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md' :
                      isNext ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md' :
                      'bg-slate-800 text-slate-100 border-white/10'
                    }`}>
                      R{race.raceNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-white">{race.time} IST</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300 font-medium">{race.distanceMeters}m ({race.raceClass})</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">{activeRunners.length} Runners</span>
                        <span className="text-slate-600">·</span>
                        <RaceCountdownBadge isoTime={race.isoTime} isFinished={isFinished} />
                      </div>

                      <h3 className="text-xl font-black text-white tracking-tight mt-1">
                        {race.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                        <span>Going: <strong className="text-emerald-400">{race.going}</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Confidence: <strong className={race.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{race.confidence}</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Prize: <strong className="text-slate-200">₹{race.prizeMoney}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Center-Right: Top Pick with Thoroughbred Silks Visualizer */}
                  <div className="flex flex-wrap items-center gap-3">
                    {topPick && (
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-black/60 p-2 px-3 shadow-inner">
                        <ThoroughbredVisualizer runner={topPick} size="sm" />
                        <div>
                          <div className="text-[10px] uppercase font-mono font-black text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Top Pick (#{topPick.saddleNumber})
                          </div>
                          <div className="text-xs font-black text-white truncate max-w-[120px]">{topPick.name}</div>
                          <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                            {topPick.jockey} · {topPick.odds.toFixed(2)}
                          </div>
                        </div>

                        <div className="text-right pl-3 border-l border-white/10 font-mono">
                          <span className="text-base font-black text-emerald-400">{topPick.winProbability}%</span>
                          <span className="text-[9px] text-slate-400 block leading-none">Win %</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          askAiBrain(`Provide an exact betting strategy and key risks for Race ${race.raceNumber} (${race.name}).`);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 transition border border-white/10"
                        title="Ask AI Brain about this race"
                      >
                        <Bot className="w-4 h-4" />
                      </button>

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
                        title="Track race"
                      >
                        <Bell className={`w-4 h-4 ${isRaceTracked(race.id) ? 'fill-emerald-400' : ''}`} />
                      </button>

                      <button className="flex h-10 items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md">
                        <span>Card</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </div>
  );
};

```

---

## File: src/components/HorsesScreen.tsx

```typescript
import React, { useState } from 'react';
import { useRacing } from '../context/RacingContext';
import { Runner, Race } from '../types/racing';
import { Card3D } from './Card3D';
import { ThoroughbredVisualizer } from './ThoroughbredVisualizer';
import { 
  Search, 
  ChevronRight, 
  Sparkles, 
  Compass, 
  Star,
  Bot
} from 'lucide-react';

export const HorsesScreen: React.FC = () => {
  const { 
    meeting, 
    setSelectedRaceId, 
    setSelectedRunnerId, 
    trackedHorses, 
    toggleTrackHorse, 
    isHorseTracked,
    askAiBrain
  } = useRacing();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tracked' | 'derby' | 'top_picks' | 'value'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'winProb' | 'odds' | 'name'>('rating');

  // Flatten all runners across the 10 races
  const allRunnersWithRace: { runner: Runner; race: Race }[] = [];
  meeting.races.forEach(race => {
    race.runners.forEach(runner => {
      allRunnersWithRace.push({ runner, race });
    });
  });

  const filtered = allRunnersWithRace.filter(({ runner, race }) => {
    if (filterType === 'tracked' && !isHorseTracked(runner.id)) return false;
    if (filterType === 'derby' && race.raceNumber !== 8) return false;
    if (filterType === 'top_picks' && runner.modelRole !== 'Top Pick') return false;
    if (filterType === 'value' && runner.modelRole !== 'Value Watch') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = runner.name.toLowerCase().includes(q);
      const matchJockey = runner.jockey.toLowerCase().includes(q);
      const matchTrainer = runner.trainer.toLowerCase().includes(q);
      const matchSire = runner.pedigree.sire.toLowerCase().includes(q);
      return matchName || matchJockey || matchTrainer || matchSire;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'rating') return b.runner.rating - a.runner.rating;
    if (sortBy === 'winProb') return b.runner.winProbability - a.runner.winProbability;
    if (sortBy === 'odds') return a.runner.odds - b.runner.odds;
    return a.runner.name.localeCompare(b.runner.name);
  });

  return (
    <div className="space-y-5 pb-28 sm:pb-20 animate-fade-in">
      {/* Header and Controls */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e1626]/90 to-slate-900/80 p-5 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-mono uppercase">
                Declared Thoroughbred Directory
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Profiles for all {allRunnersWithRace.length} declared thoroughbreds and jockeys for October 3, 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="rating">Highest Rating</option>
              <option value="winProb">Win Probability %</option>
              <option value="odds">Lowest Odds</option>
              <option value="name">Horse Name</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono">
            {[
              { id: 'all', label: `All (${allRunnersWithRace.length})` },
              { id: 'tracked', label: `Tracked (${trackedHorses.length})` },
              { id: 'derby', label: 'Derby (R8)' },
              { id: 'top_picks', label: 'Top Picks' },
              { id: 'value', label: 'Value Picks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                  filterType === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search horse, sire, jockey..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>
        </div>
      </div>

      {/* Runner Grid with Thoroughbred Silks Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(({ runner, race }) => {
          const isTop = runner.modelRole === 'Top Pick';
          const isDanger = runner.modelRole === 'Main Danger';
          const isScratched = runner.status === 'Scratched';

          return (
            <Card3D
              key={`${race.id}-${runner.id}`}
              onClick={() => {
                setSelectedRaceId(race.id);
                setSelectedRunnerId(runner.id);
              }}
              glowColor={isTop ? 'rgba(16, 185, 129, 0.25)' : isDanger ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)'}
              className={`cursor-pointer rounded-3xl border p-4 transition relative ${
                isScratched
                  ? 'border-rose-950 bg-slate-950/40 opacity-70'
                  : isTop
                  ? 'border-emerald-500/60 bg-gradient-to-r from-[#122223] to-[#0c141d] shadow-xl ring-1 ring-emerald-500/30'
                  : isDanger
                  ? 'border-amber-500/50 bg-gradient-to-r from-[#1c1811] to-[#0e1218]'
                  : 'border-white/10 bg-slate-900/60 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <ThoroughbredVisualizer runner={runner} size="md" />

                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-base font-black text-white flex items-center gap-1.5">
                        <span className={isScratched ? 'line-through text-slate-400' : ''}>
                          {runner.name}
                        </span>
                      </h3>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTrackHorse(runner.id);
                        }}
                        className={`p-1 rounded-xl transition ${
                          isHorseTracked(runner.id)
                            ? 'text-amber-400 bg-amber-400/20 border border-amber-400/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Track horse"
                      >
                        <Star className={`w-3.5 h-3.5 ${isHorseTracked(runner.id) ? 'fill-amber-400' : ''}`} />
                      </button>

                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        R{race.raceNumber} ({race.time})
                      </span>
                    </div>

                    <div className="mt-1.5 text-xs text-slate-300 font-mono">
                      <span>Jockey: <strong className="text-white font-sans">{runner.jockey}</strong></span>
                      <span className="text-slate-600"> · </span>
                      <span>{runner.trainer}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400 font-mono">
                      <span>Sire: {runner.pedigree.sire}</span>
                      <span className="text-slate-600"> · </span>
                      <span>{runner.runningStyle}</span>
                    </div>
                  </div>
                </div>

                {/* Right Badges */}
                <div className="text-right flex flex-col items-end gap-1.5 font-mono">
                  {!isScratched ? (
                    <div>
                      <span className="text-base font-black text-emerald-400">
                        {runner.winProbability}%
                      </span>
                      <span className="text-[9px] text-slate-400 block uppercase">Win Prob</span>
                    </div>
                  ) : (
                    <span className="rounded-full bg-rose-950/80 border border-rose-800 px-2 py-0.5 text-[9px] font-bold text-rose-300">
                      Scratched
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      askAiBrain(`Provide a handicap review for ${runner.name} in Race ${race.raceNumber} (${race.name}) on Oct 3rd.`);
                    }}
                    className="flex items-center gap-1 rounded-xl bg-slate-800 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-slate-700 transition"
                  >
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span>Intel</span>
                  </button>
                </div>
              </div>

              {/* Stats Footer Bar */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span>Rating: <strong className="text-emerald-400">{runner.rating}</strong></span>
                  <span className="text-slate-600">·</span>
                  <span>Weight: <strong className="text-slate-200">{runner.weightKg}kg</strong></span>
                  <span className="text-slate-600">·</span>
                  <span>Odds: <strong className="text-white">{runner.odds.toFixed(2)}</strong></span>
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 transition">
                  <span className="text-[10px] font-bold">3D Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </div>
  );
};

```

---

