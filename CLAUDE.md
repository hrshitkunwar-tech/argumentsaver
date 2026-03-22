# Memory

## Me
Harshit (hrshit.kunwar@gmail.com) — founder/builder of ArgumentSaver.

## Project
**ArgumentSaver** — iOS-first Expo/React Native app. AI-powered couple conflict mediator.
Rewrites heated messages into calmer, empathetic versions using the Grok API.

## Stack
| Layer | Tech |
|-------|------|
| Framework | Expo SDK 51 + React Native + TypeScript |
| AI | Grok API (xAI) — `grok-2-1212` model |
| Storage | AsyncStorage (local only, no backend) |
| Purchases | expo-in-app-purchases (native IAP, no RevenueCat) |
| Nav | Single-screen first, React Navigation optional |

## Key Files
| File | Purpose |
|------|---------|
| `src/services/grokService.ts` | Grok API calls, retry/timeout |
| `src/services/purchaseService.ts` | IAP logic, free tier enforcement |
| `src/utils/storage.ts` | AsyncStorage wrapper |
| `src/constants/prompts.ts` | Rewrite prompt templates per tone |
| `src/constants/tones.ts` | Tone definitions |
| `src/types/index.ts` | All shared TypeScript types |

## Business Rules
- 5 free rewrites (enforced locally via AsyncStorage)
- Paywall after limit — one-time unlock via IAP
- History stored locally, max 50 entries

## Preferences
- No backend unless absolutely required
- No RevenueCat, no Sendbird, no chat infra
- Lean deps, fast load, accessible UI
- Production-minded from day one
