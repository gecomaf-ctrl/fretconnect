---
name: FretConnect react-native-maps web bundling fix
description: How to prevent react-native-maps from breaking the Expo web bundler
---

## Rule
Never import `react-native-maps` at the top level (even via conditional `require()`).
Metro's static analysis bundles it for web regardless, causing a fatal MIME/500 error.

**Why:** Metro resolves all `require()` calls statically at build time, even inside `if (Platform.OS !== 'web')` guards.

**How to apply:**
Use Expo's platform-specific file resolution instead:
- `components/NativeMap.native.tsx` — real `MapView` (only bundled on iOS/Android)
- `components/NativeMap.tsx` — empty stub for web
Import `NativeMap` from `@/components/NativeMap` in the screen; Metro automatically picks the right file per platform.

Do NOT add `react-native-maps` to `app.json` plugins. Pin its version to the one required by the installed Expo SDK; for this project on Expo SDK 57, Expo selected 1.27.2.
