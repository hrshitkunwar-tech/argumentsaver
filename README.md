# ArgumentSaver

AI-powered couple conflict mediator. Paste a heated message, pick a tone, get a calmer version that preserves your meaning.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Expo SDK 51 + React Native + TypeScript | Fast iteration, OTA updates |
| AI | Grok API (`grok-2-1212`) | Low latency, strong instruction-following |
| Storage | AsyncStorage | No backend required for MVP |
| Purchases | expo-in-app-purchases | Native StoreKit, no RevenueCat |

---

## Quick Start

```bash
# 1. Install deps
npm install

# 2. Copy env and add your Grok API key
cp .env.example .env
# → edit .env and set EXPO_PUBLIC_GROK_API_KEY

# 3. Start
npx expo start --ios
```

Get a Grok API key at https://console.x.ai

---

## Project Structure

```
src/
├── components/       # Reusable UI (InputBox, ToneSelector, OutputCard, …)
├── constants/        # Tones, prompts, model config, env config
├── screens/          # HomeScreen (rewrite + history tabs)
├── services/         # grokService.ts, purchaseService.ts
├── types/            # All shared TypeScript types
└── utils/            # storage.ts (AsyncStorage), jsonParser.ts (safe Grok parsing)
app/
├── _layout.tsx       # Root layout (SafeAreaProvider)
└── index.tsx         # Entry → HomeScreen
```

---

## IAP Setup (iOS)

1. Create a non-consumable product in App Store Connect:
   - Product ID: `com.harshit.argumentsaver.unlimited`
2. Set `EXPO_PUBLIC_IAP_PRODUCT_ID` in `.env` to match exactly
3. Test in Xcode with a sandbox Apple ID
4. **Restore Purchases** button is present (required by App Store guidelines)

> **Production hardening:** The Grok API key is bundled in the JS binary via `EXPO_PUBLIC_`. Before shipping, proxy calls through a Cloudflare Worker or similar edge function to keep the key server-side.

---

## Business Logic

- **5 free rewrites** — enforced locally in AsyncStorage (`@as:rewrite_count`)
- **Paywall** triggers on the 6th tap → `PaywallModal` → native IAP
- **Premium flag** stored in AsyncStorage after successful purchase (`@as:is_premium`)
- **History** — max 50 entries, newest first, stored locally
- Saved to history on **Copy** tap (intentional: only useful rewrites get logged)

---

## Grok Prompt Design

System prompt instructs the model to:
- Preserve original intent exactly
- Convert accusations → feelings
- Keep language natural (not clinical/therapy-speak)
- Return strict JSON: `{ primary, alternates: [string, string] }`

Per-tone instructions are injected in the user turn. Safe JSON parsing strips markdown fences and handles partial responses gracefully.

---

## Error Handling

| Error | Behaviour |
|-------|-----------|
| Network timeout (10s) | User-friendly banner, retry available |
| 401 Unauthorized | "Check your API key" message |
| 429 Rate limit | "Wait a moment" message |
| Grok parse failure | Fallback message, logged |
| IAP cancelled | Silent dismiss (not an error) |
| IAP failure | Error state in PaywallModal |

---

## Next Steps (Post-MVP)

- Server-side Grok proxy (Cloudflare Worker) to protect API key
- Share sheet on OutputCard (`expo-sharing`)
- Push notification: "Feeling heated? Tap to cool down"
- iCloud sync for history
- Couple mode (shared history between two accounts)
