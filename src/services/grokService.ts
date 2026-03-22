/**
 * Grok API service — ArgumentSaver
 *
 * Direct mobile → Grok calls (no backend required for MVP).
 * API key lives in EXPO_PUBLIC_GROK_API_KEY (never committed).
 *
 * Security note: EXPO_PUBLIC_ vars are bundled into the JS bundle.
 * For production, consider proxying through a lightweight edge function
 * (e.g. Cloudflare Worker) so the key isn't visible in the binary.
 */

import type { ToneId, GrokRequest, GrokResponse, RewriteResult } from '@/types';
import { parseRewritePayload, GrokParseError } from '@/utils/jsonParser';
import {
  SYSTEM_PROMPT,
  buildRewritePrompt,
  GROK_MODEL,
  GROK_TEMPERATURE,
  GROK_MAX_TOKENS,
  GROK_TIMEOUT_MS,
  GROK_RETRY_ATTEMPTS,
  GROK_RETRY_DELAY_MS,
} from '@/constants/prompts';
import { CONFIG } from '@/constants/config';

// ─── Errors ───────────────────────────────────────────────────────────────────

export class GrokNetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GrokNetworkError';
  }
}

export class GrokApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string
  ) {
    super(message);
    this.name = 'GrokApiError';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

async function fetchGrok(body: GrokRequest): Promise<GrokResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROK_TIMEOUT_MS);

  try {
    const url = CONFIG.proxyUrl ? CONFIG.proxyUrl : `${CONFIG.grokApiBase}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (CONFIG.proxyUrl && CONFIG.proxySecret) {
      headers['X-App-Secret'] = CONFIG.proxySecret;
    }

    if (!CONFIG.proxyUrl && CONFIG.grokApiKey) {
      if (__DEV__) {
        console.warn('ArgumentSaver: Using EXPO_PUBLIC_GROK_API_KEY directly. Please configure a proxy URL for production.');
      }
      headers.Authorization = `Bearer ${CONFIG.grokApiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new GrokApiError(
        `Grok/Proxy API returned ${res.status}`,
        res.status,
        text
      );
    }

    return (await res.json()) as GrokResponse;
  } catch (err) {
    clearTimeout(timer);

    if (err instanceof GrokApiError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      throw new GrokNetworkError('Request timed out after 10 seconds');
    }

    throw new GrokNetworkError('Network request failed', err);
  }
}

// ─── Retry wrapper ────────────────────────────────────────────────────────────

async function fetchGrokWithRetry(body: GrokRequest): Promise<GrokResponse> {
  let lastErr: unknown;

  for (let attempt = 0; attempt <= GROK_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fetchGrok(body);
    } catch (err) {
      lastErr = err;

      // Don't retry on 4xx (auth / bad request) or parse errors
      if (err instanceof GrokApiError && err.status < 500) throw err;
      if (err instanceof GrokParseError) throw err;

      if (attempt < GROK_RETRY_ATTEMPTS) {
        await sleep(GROK_RETRY_DELAY_MS * (attempt + 1)); // linear backoff
      }
    }
  }

  throw lastErr;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Rewrite a message using the Grok API.
 * Returns a RewriteResult with primary + 2 alternates.
 *
 * @throws GrokNetworkError | GrokApiError | GrokParseError
 */
export async function rewriteMessage(
  message: string,
  tone: ToneId
): Promise<RewriteResult> {
  const body: GrokRequest = {
    model: GROK_MODEL,
    temperature: GROK_TEMPERATURE,
    max_tokens: GROK_MAX_TOKENS,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildRewritePrompt(message, tone) },
    ],
  };

  const response = await fetchGrokWithRetry(body);

  const rawContent = response.choices?.[0]?.message?.content ?? '';
  const payload = parseRewritePayload(rawContent);

  return {
    id: nanoid(),
    original: message,
    rewrites: [payload.primary, ...payload.alternates],
    tone,
    createdAt: Date.now(),
  };
}
