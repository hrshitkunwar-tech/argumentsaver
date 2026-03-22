import { Ionicons } from '@expo/vector-icons';
import type { Tone } from '@/types';

export const TONES: (Tone & { icon: keyof typeof Ionicons.glyphMap })[] = [
  {
    id: 'gentle',
    label: 'Gentle',
    emoji: '🌸',
    icon: 'flower-outline',
    description: 'Soft and caring, keeps the peace',
  },
  {
    id: 'honest',
    label: 'Honest',
    emoji: '💬',
    icon: 'chatbubbles-outline',
    description: 'Clear and truthful, still kind',
  },
  {
    id: 'direct',
    label: 'Direct',
    emoji: '🎯',
    icon: 'pin-outline',
    description: 'Straightforward but respectful',
  },
  {
    id: 'apology',
    label: 'Apology',
    emoji: '🤝',
    icon: 'heart-outline',
    description: 'Takes accountability, repairs trust',
  },
  {
    id: 'boundary',
    label: 'Boundary',
    emoji: '🛡️',
    icon: 'shield-checkmark-outline',
    description: 'Firm yet respectful self-advocacy',
  },
];

export const DEFAULT_TONE_ID = 'gentle' as const;
