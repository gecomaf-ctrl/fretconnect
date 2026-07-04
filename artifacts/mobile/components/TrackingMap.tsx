/**
 * Web stub for TrackingMap — animated progress bar route visualization.
 * TrackingMap.native.tsx is used on iOS/Android.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface LatLng { latitude: number; longitude: number }
interface Props {
  origin: LatLng;
  destination: LatLng;
  truckPosition: LatLng;
  progress: number;
}

export default function TrackingMap({ progress }: Props) {
  const progressAnim = useRef(new Animated.Value(progress)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progress, duration: 600, useNativeDriver: false }).start();
  }, [progress]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const truckLeft = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '88%'] });

  return (
    <View style={styles.container}>
      {/* Gradient road */}
      <View style={styles.road}>
        {/* Dashes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.dash} />
        ))}
      </View>

      {/* Progress fill */}
      <Animated.View
        style={[
          styles.progressFill,
          { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />

      {/* Truck marker */}
      <Animated.View style={[styles.truckWrapper, { left: truckLeft }]}>
        <Animated.View style={[styles.truckPulse, { transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.truckBubble}>
          <View style={styles.truckIcon} />
        </View>
      </Animated.View>

      {/* Origin dot */}
      <View style={[styles.endpoint, styles.originDot]} />
      {/* Destination dot */}
      <View style={[styles.endpoint, styles.destDot]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%', height: '100%',
    backgroundColor: '#1A2035',
    alignItems: 'center', justifyContent: 'center',
  },
  road: {
    position: 'absolute',
    width: '80%', height: 6, backgroundColor: '#2A3550', borderRadius: 3,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden', gap: 10,
  },
  dash: { width: 16, height: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressFill: {
    position: 'absolute', left: '10%', height: 6,
    backgroundColor: '#FF5C00', borderRadius: 3,
  },
  truckWrapper: {
    position: 'absolute', top: '50%',
    transform: [{ translateY: -26 }],
    width: 52, height: 52, alignItems: 'center', justifyContent: 'center',
  },
  truckPulse: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,92,0,0.25)',
  },
  truckBubble: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF5C00',
    alignItems: 'center', justifyContent: 'center',
  },
  truckIcon: { width: 18, height: 10, backgroundColor: '#FFF', borderRadius: 3 },
  endpoint: { position: 'absolute', top: '50%', width: 14, height: 14, borderRadius: 7 },
  originDot: { left: '10%', backgroundColor: '#10B981', transform: [{ translateY: -7 }] },
  destDot: { right: '10%', backgroundColor: '#FF5C00', transform: [{ translateY: -7 }] },
});
