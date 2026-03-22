import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

function getEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? extra[key] ?? fallback;
}

export const CONFIG = {
  proxyUrl: getEnv('EXPO_PUBLIC_API_PROXY_URL'),
  proxySecret: getEnv('EXPO_PUBLIC_API_PROXY_SECRET'), // Security handshake
  grokApiKey: getEnv('EXPO_PUBLIC_GROK_API_KEY', ''),
  grokApiBase: 'https://api.x.ai/v1',
  iapProductId: getEnv('EXPO_PUBLIC_IAP_PRODUCT_ID', 'com.harshit.argumentsaver.unlimited') || 'com.harshit.argumentsaver.unlimited',
  freeRewriteLimit: parseInt(
    getEnv('EXPO_PUBLIC_FREE_REWRITE_LIMIT', '5') || '5',
    10
  ),
} as const;

// Ensure at least one way to reach the AI is configured
if (!CONFIG.proxyUrl && !CONFIG.grokApiKey) {
  throw new Error(
    'Missing API Configuration: You must set either EXPO_PUBLIC_API_PROXY_URL or EXPO_PUBLIC_GROK_API_KEY in .env.'
  );
}
