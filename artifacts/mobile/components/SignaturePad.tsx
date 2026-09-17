/**
 * SignaturePad — cross-platform (web + native) touch/mouse drawing surface
 * Uses react-native-svg for path rendering and PanResponder for gestures.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, Platform, PanResponder, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

interface Point { x: number; y: number }

interface Props {
  onSigned?: (hasSignature: boolean) => void;
  /** Border color for the drawing area */
  borderColor?: string;
  labelColor?: string;
  clearColor?: string;
  height?: number;
}

function pointsToPath(pts: Point[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const mid = {
      x: (pts[i - 1].x + pts[i].x) / 2,
      y: (pts[i - 1].y + pts[i].y) / 2,
    };
    d += ` Q ${pts[i - 1].x} ${pts[i - 1].y} ${mid.x} ${mid.y}`;
  }
  return d;
}

export function SignaturePad({ onSigned, borderColor = '#E2E8F0', labelColor = '#94A3B8', clearColor = '#64748B', height = 160 }: Props) {
  const [strokes, setStrokes]   = useState<Point[][]>([]);
  const [current, setCurrent]   = useState<Point[]>([]);
  const currentRef = useRef<Point[]>([]);
  const containerRef = useRef<View>(null);
  const [layout, setLayout]     = useState({ x: 0, y: 0, width: 0, height: 0 });

  const hasSignature = strokes.length > 0 || current.length > 0;

  const onLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height: h } = e.nativeEvent.layout;
    setLayout({ x, y, width, height: h });
  };

  const toLocal = useCallback((gx: number, gy: number): Point => {
    if (Platform.OS === 'web') {
      // On web, measureInWindow gives page coords so subtract layout offset
      return { x: gx - layout.x, y: gy - layout.y };
    }
    return { x: gx - layout.x, y: gy - layout.y };
  }, [layout]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const first = [{ x: pageX, y: pageY }];
        currentRef.current = first;
        setCurrent(first);
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const next = [...currentRef.current, { x: pageX, y: pageY }];
        currentRef.current = next;
        setCurrent(next);
      },
      onPanResponderRelease: () => {
        setStrokes(prev => {
          const stroke = currentRef.current;
          if (stroke.length === 0) return prev;
          const next = [...prev, stroke];
          onSigned?.(true);
          return next;
        });
        currentRef.current = [];
        setCurrent([]);
      },
    })
  ).current;

  const clear = () => {
    setStrokes([]);
    currentRef.current = [];
    setCurrent([]);
    onSigned?.(false);
  };

  return (
    <View>
      <View
        ref={containerRef}
        onLayout={(e) => {
          onLayout(e);
          // Also measure absolute position for page-coord correction
          containerRef.current?.measureInWindow((x, y) => {
            setLayout(prev => ({ ...prev, x, y }));
          });
        }}
        style={[styles.canvas, { borderColor, height }]}
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {strokes.map((pts, i) => {
            const corrected = pts.map(p => toLocal(p.x, p.y));
            return (
              <Path
                key={i}
                d={pointsToPath(corrected)}
                stroke="#0E1420"
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
          {current.length > 0 && (
            <Path
              d={pointsToPath(current.map(p => toLocal(p.x, p.y)))}
              stroke="#0E1420"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>

        {!hasSignature && (
          <View style={styles.placeholder} pointerEvents="none">
            <Text style={[styles.placeholderText, { color: labelColor }]}>
              Signez ici
            </Text>
          </View>
        )}
      </View>

      {hasSignature && (
        <Pressable style={styles.clearBtn} onPress={clear}>
          <Feather name="refresh-cw" size={12} color={clearColor} />
          <Text style={[styles.clearText, { color: clearColor }]}>Effacer</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: '#FAFBFC',
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
