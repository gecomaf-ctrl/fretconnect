---
name: expo-google-fonts web CDN timeout
description: @expo-google-fonts/* loads from Google CDN on web, which times out in Replit — fix is to use local TTF files.
---

## Rule
Never use `@expo-google-fonts/<family>` package exports directly with `useFonts` in an Expo web app hosted on Replit.

**Why:** On web, the package tries to resolve fonts via the Google Fonts CDN. Replit's network blocks or throttles that CDN, causing `FontFaceObserver` to throw "3000ms timeout exceeded" on every load.

**How to apply:**
1. Copy the needed `.ttf` files from the pnpm store into `assets/fonts/`:
   ```
   BASE=/home/runner/workspace/node_modules/.pnpm/@expo-google-fonts+inter@0.4.2/node_modules/@expo-google-fonts/inter
   cp "$BASE/400Regular/Inter_400Regular.ttf" artifacts/mobile/assets/fonts/
   # repeat for each weight needed
   ```
2. Load via `useFonts` from `expo-font` with `require()` paths — do NOT import font constants from the google-fonts package:
   ```ts
   import { useFonts } from 'expo-font';
   useFonts({
     Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
     Inter_700Bold:    require('../assets/fonts/Inter_700Bold.ttf'),
   });
   ```
3. The root package's `useFonts` re-export works fine on native (Metro asset bundling) but is broken on Expo web in Replit because it resolves to a CDN URL, not the local file.
