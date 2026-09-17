---
name: Expo fonts web loading
description: FontFaceObserver can block the Replit Expo web preview even with local TTFs; native and web font loading need separate handling.
---

## Rule
Never let Expo web startup depend on `useFonts` completing in an Expo app hosted on Replit. Avoid `@expo-google-fonts/<family>` exports entirely.

**Why:** The Google Fonts package can resolve through a CDN, and even local TTF loading can leave `FontFaceObserver` waiting in the proxied preview. The resulting 6-second timeout blocks the root layout and appears as a blank screen.

**How to apply:**
1. For native builds, copy the needed `.ttf` files from the pnpm store into `assets/fonts/`:
   ```
   BASE=/home/runner/workspace/node_modules/.pnpm/@expo-google-fonts+inter@0.4.2/node_modules/@expo-google-fonts/inter
   cp "$BASE/400Regular/Inter_400Regular.ttf" artifacts/mobile/assets/fonts/
   # repeat for each weight needed
   ```
2. Load via `useFonts` from `expo-font` with `require()` paths on native — do NOT import font constants from the google-fonts package:
   ```ts
   import { useFonts } from 'expo-font';
   useFonts({
     Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
     Inter_700Bold:    require('../assets/fonts/Inter_700Bold.ttf'),
   });
   ```
3. On web, pass an empty font map (or otherwise use a non-blocking fallback) and let CSS fall back to a system font. Never return `null` from the root layout while waiting for a web font that can time out.
