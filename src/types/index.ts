// ─── Tone ────────────────────────────────────────────────────────────────────

export type ToneId =
  | 'gentle'
  | 'honest'
  | 'direct'
  | 'apology'
  | 'boundary';

export interface Tone {
  id: ToneId;
  label: string;
  emoji: string;
  description: string;
}

// ─── Rewrite ─────────────────────────────────────────────────────────────────

export interface RewriteResult {
  id: string;
  original: string;
  rewrites: string[];     // 1 primary + 2 alternates
  tone: ToneId;
  createdAt: number;      // unix ms
}

// ─── Grok API ────────────────────────────────────────────────────────────────

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokRequest {
  model: string;
  messages: GrokMessage[];
  temperature: number;
  max_tokens: number;
}

export interface GrokChoice {
  message: GrokMessage;
  finish_reason: string;
}

export interface GrokResponse {
  choices: GrokChoice[];
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export interface AppStorage {
  rewriteCount: number;       // total rewrites used (free tier gate)
  isPremium: boolean;
  history: RewriteResult[];   // max 50 entries, newest first
  lastToneId: ToneId;
  onboardingCompleted: boolean;
}

// ─── Purchase ────────────────────────────────────────────────────────────────

export type PurchaseState = 'idle' | 'loading' | 'success' | 'error';

// ─── Component Props ─────────────────────────────────────────────────────────

export interface InputBoxProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

export interface ToneSelectorProps {
  selected: ToneId;
  onSelect: (tone: ToneId) => void;
  disabled?: boolean;
}

export interface RewriteButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}

export interface OutputCardProps {
  result: RewriteResult;
  onSaveToHistory: () => void;
}

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => Promise<void>;
  onRestore: () => Promise<void>;
  purchaseState: PurchaseState;
}
