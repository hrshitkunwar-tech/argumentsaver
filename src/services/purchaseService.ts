/**
 * Purchase service — ArgumentSaver
 *
 * Uses react-native-purchases (RevenueCat) for App Store / Google Play validation.
 */

import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { setPremium } from '@/utils/storage';
import { CONFIG } from '@/constants/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PurchaseResult =
  | { success: true }
  | { success: false; cancelled: boolean; error?: string };

// ─── Connection lifecycle ─────────────────────────────────────────────────────

let isConfigured = false;

/**
 * Must be called once at app start (in App.tsx useEffect).
 */
export async function connectIAP(): Promise<void> {
  if (isConfigured) return;
  try {
    if (Platform.OS === 'ios') {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
      if (apiKey) {
        Purchases.configure({ apiKey });
        isConfigured = true;
      } else {
        if (__DEV__) console.warn('[IAP] Missing EXPO_PUBLIC_REVENUECAT_IOS_KEY');
      }
    } else if (Platform.OS === 'android') {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
      if (apiKey) {
        Purchases.configure({ apiKey });
        isConfigured = true;
      } else {
        if (__DEV__) console.warn('[IAP] Missing EXPO_PUBLIC_REVENUECAT_ANDROID_KEY');
      }
    }
  } catch (err) {
    if (__DEV__) console.warn('[IAP] Failed to configure RevenueCat:', err);
  }
}

export async function disconnectIAP(): Promise<void> {
  // RevenueCat doesn't require explicit disconnect
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

/**
 * Initiate the native IAP flow for the unlimited tier.
 * Updates local premium flag on success.
 */
export async function purchaseUnlimited(): Promise<PurchaseResult> {
  try {
    if (__DEV__ && !isConfigured) {
      // Mock for Expo Go web/simulator without API keys
      if (__DEV__) console.log('[IAP] Mocking success for Expo Go...');
      await setPremium(true);
      return { success: true };
    }

    if (!isConfigured) await connectIAP();

    if (__DEV__) console.log('[IAP] Initiating purchase for:', CONFIG.iapProductId);

    const { customerInfo } = await Purchases.purchaseProduct(CONFIG.iapProductId);

    if (typeof customerInfo.entitlements.active['unlimited'] !== 'undefined') {
      await setPremium(true);
      return { success: true };
    }

    return {
      success: false,
      cancelled: false,
      error: 'Product purchased but entitlement not found.',
    };
  } catch (err: any) {
    if (err.userCancelled) {
      return { success: false, cancelled: true };
    }
    return {
      success: false,
      cancelled: false,
      error: err?.message ?? 'Purchase failed',
    };
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

/**
 * Restores previous purchases (required by App Store guidelines).
 * Returns true if an active unlock was found.
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    if (__DEV__ && !isConfigured) return false;
    if (!isConfigured) await connectIAP();

    const customerInfo = await Purchases.restorePurchases();

    if (typeof customerInfo.entitlements.active['unlimited'] !== 'undefined') {
      await setPremium(true);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ─── Free tier gate ───────────────────────────────────────────────────────────

/**
 * Returns true if the user can perform another free rewrite.
 */
export function canRewriteFree(count: number, isPremium: boolean): boolean {
  return isPremium || count < CONFIG.freeRewriteLimit;
}

export function freeRewritesRemaining(count: number): number {
  return Math.max(0, CONFIG.freeRewriteLimit - count);
}
