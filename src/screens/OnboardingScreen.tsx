import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R, T, shadow } from '@/constants/theme';
import { setOnboardingCompleted } from '@/utils/storage';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Master Difficult Conversations',
    description: 'Paste those heated texts. We help you rewrite them to be firm yet respectful, saving your relationships.',
    icon: 'chatbubbles-outline',
    color: C.primary,
  },
  {
    id: '2',
    title: 'Privacy by Design',
    description: 'Your messages are processed and forgotten instantly. We never store your conversation history on our servers.',
    icon: 'shield-checkmark-outline',
    color: '#059669', // Emerald 600
  },
  {
    id: '3',
    title: 'Find Your Voice',
    description: "Choose from multiple tones — from 'Boundary' to 'Apology'. Ready to turn arguments into productive dialogue?",
    icon: 'sparkles-outline',
    color: '#7c3aed', // Violet 600
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    await setOnboardingCompleted(true);
    onFinish();
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={SLIDES}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={width * 0.25} color={item.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.pagingContainer}>
          {SLIDES.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 24, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: C.primary }]}
              />
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={currentIndex === SLIDES.length - 1 ? 'rocket' : 'arrow-forward'} 
            size={18} 
            color="#FFF" 
            style={{ marginLeft: 8 }} 
          />
        </TouchableOpacity>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: R.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    ...T.headlineSM,
    color: C.onBackground,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    ...T.bodyLG,
    color: C.outline,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 40,
  },
  pagingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: C.primary,
    height: 56,
    borderRadius: R.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: 16,
    alignSelf: 'center',
  },
  skipText: {
    color: C.outline,
    fontSize: 14,
    fontWeight: '600',
  },
});
