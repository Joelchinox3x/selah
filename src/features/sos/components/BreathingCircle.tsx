import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticMedium } from '@/src/services/haptics/hapticFeedback';

const { width } = Dimensions.get('window');
const CIRCLE_BASE_SIZE = Math.min(width * 0.65, 250);

type BreathingPhase = 'inhale' | 'hold' | 'exhale';

interface BreathingCircleProps {
  onCycleComplete?: () => void;
  isActive: boolean;
  hapticEnabled?: boolean;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  onCycleComplete,
  isActive,
  hapticEnabled = true,
}) => {
  const [phase, setPhase] = useState<BreathingPhase>('hold');
  const [countdown, setCountdown] = useState(4);
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const scale = useSharedValue(0.85);
  const innerScale = useSharedValue(0.9);

  useEffect(() => {
    if (!isActive) return;

    let timer: any = null;
    let secondsLeft = 4;

    const startPhase = (nextPhase: BreathingPhase) => {
      setPhase(nextPhase);

      if (nextPhase === 'inhale') {
        secondsLeft = 4;
        setCountdown(4);
        if (hapticEnabled) hapticLight();
        scale.value = withTiming(1.05, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        });
        innerScale.value = withTiming(1.0, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        });
      } else if (nextPhase === 'hold') {
        secondsLeft = 7;
        setCountdown(7);
        if (hapticEnabled) hapticMedium();
        scale.value = withTiming(1.08, {
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
        });
        innerScale.value = withTiming(1.04, {
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
        });
      } else if (nextPhase === 'exhale') {
        secondsLeft = 8;
        setCountdown(8);
        if (hapticEnabled) hapticLight();
        scale.value = withTiming(0.85, {
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
        });
        innerScale.value = withTiming(0.9, {
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
        });
        onCycleComplete?.();
      }
    };

    startPhase('hold');

    timer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        setCountdown(secondsLeft);
      } else {
        setPhase((prev) => {
          if (prev === 'inhale') {
            startPhase('hold');
            return 'hold';
          } else if (prev === 'hold') {
            startPhase('exhale');
            return 'exhale';
          } else {
            startPhase('inhale');
            return 'inhale';
          }
        });
      }
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, hapticEnabled]);

  const animatedOuterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const getPhaseName = () => {
    switch (phase) {
      case 'inhale':
        return 'INHALA';
      case 'hold':
        return 'RETÉN';
      case 'exhale':
        return 'EXHALA';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'LLENA TU PECHO DE PAZ';
      case 'hold':
        return 'MANTÉN EL AIRE CON CALMA';
      case 'exhale':
        return 'SUELTA TODO EL AFÁN';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Phase Instruction Pill (Photo 5) */}
      <View
        style={[
          styles.instructionPill,
          { backgroundColor: theme.surfaceRaised },
        ]}
      >
        <Text style={[styles.instructionText, { color: theme.accent }]}>
          {getPhaseInstruction()}
        </Text>
      </View>

      <Text style={[styles.timerSubText, { color: theme.textMuted }]}>
        00:40 / 01:00 (Sesión de calma)
      </Text>

      {/* Concentric Breathing Circle from Photo 5 */}
      <View style={styles.circleOuterContainer}>
        {/* Soft Aura Ring */}
        <Animated.View
          style={[
            styles.softAuraRing,
            {
              backgroundColor: themeMode === 'oled'
                ? 'rgba(30, 41, 59, 0.4)'
                : 'rgba(219, 234, 254, 0.5)',
            },
            animatedOuterStyle,
          ]}
        >
          {/* Inner Dark Focal Circle (Photo 5) */}
          <Animated.View
            style={[
              styles.darkCenterCircle,
              {
                backgroundColor: themeMode === 'oled' ? '#0F172A' : '#0F172A',
                shadowColor: '#000',
              },
              animatedInnerStyle,
            ]}
          >
            <Text style={styles.centerPhaseText}>{getPhaseName()}</Text>
            <Text style={styles.centerCountText}>{countdown}</Text>
            <View style={styles.dotsRow}>
              <View style={styles.focalDot} />
              <View style={styles.focalDot} />
              <View style={styles.focalDot} />
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  instructionPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timerSubText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
  },
  circleOuterContainer: {
    width: CIRCLE_BASE_SIZE * 1.25,
    height: CIRCLE_BASE_SIZE * 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  softAuraRing: {
    width: CIRCLE_BASE_SIZE,
    height: CIRCLE_BASE_SIZE,
    borderRadius: CIRCLE_BASE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkCenterCircle: {
    width: CIRCLE_BASE_SIZE * 0.72,
    height: CIRCLE_BASE_SIZE * 0.72,
    borderRadius: (CIRCLE_BASE_SIZE * 0.72) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  centerPhaseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  centerCountText: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '900',
    lineHeight: 52,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  focalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
});
