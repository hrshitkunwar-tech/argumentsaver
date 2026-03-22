import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { loadStorage } from '@/utils/storage';
import { C } from '@/constants/theme';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function boot() {
      const storage = await loadStorage();
      setShowOnboarding(!storage.onboardingCompleted);
      setLoading(false);
    }
    boot();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }

  return <HomeScreen />;
}
