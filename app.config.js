// app.config.js — evaluated at build time by Expo (EAS Build, `expo start`, etc.)
// This allows process.env to be read and injected into expo-constants via `extra`.

module.exports = ({ config }) => ({
  ...config,
  extra: {
    EXPO_PUBLIC_API_PROXY_URL:      process.env.EXPO_PUBLIC_API_PROXY_URL,
    EXPO_PUBLIC_API_PROXY_SECRET:   process.env.EXPO_PUBLIC_API_PROXY_SECRET,
    EXPO_PUBLIC_GROK_API_KEY:       process.env.EXPO_PUBLIC_GROK_API_KEY,
    EXPO_PUBLIC_IAP_PRODUCT_ID:     process.env.EXPO_PUBLIC_IAP_PRODUCT_ID      ?? 'com.harshit.argumentsaver.unlimited',
    EXPO_PUBLIC_FREE_REWRITE_LIMIT: process.env.EXPO_PUBLIC_FREE_REWRITE_LIMIT  ?? '5',
  },
});
