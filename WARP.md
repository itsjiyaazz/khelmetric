# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

This is an Expo (React Native) app that measures simple fitness tests (sit-ups, jump) using device sensors and presents localized UI in English, Hindi, and Kannada. It uses React Navigation (native stack), React Native Paper for UI, i18next for localization, and AsyncStorage for lightweight persistence (language preference, auth flag, and saved results). There is no backend integration; a Firebase config stub exists but is unused.

## Common commands

All commands are run from the repository root.

- Install dependencies:
  - npm: `npm install`
- Start the Expo dev server (choose platform from Expo UI):
  - `npm run start`
- Run directly on a specific platform:
  - Android: `npm run android`
  - iOS: `npm run ios`
  - Web: `npm run web`

Notes
- There are no lint or test scripts configured in package.json, and no Jest/Vitest config is present. Running a single test is not applicable until a test setup is added.

## High-level architecture

- Entry and navigation
  - `index.js` registers the root component with Expo.
  - `App.js` sets up a Native Stack Navigator with screens: `LanguageSelection → Auth → Home → (SitupTest | JumpTest | MyResults) → Result`.
  - On mount, `App.js` clears any prior auth state and forces the flow to start at `LanguageSelection` (fresh session behavior).
  - A custom navigation theme sets a dark background and header styles.

- Localization (i18n)
  - `services/i18n.js` configures i18next with inline resources for `en`, `hi`, and `kn` and integrates with react-i18next.
  - Initial language is picked from AsyncStorage if present, otherwise inferred from device locale (Hindi/Kannada) then defaults to English.
  - `components/LanguageFab.js` allows in-app language switching and persists the choice to storage.

- Persistence and domain logic
  - `services/storage.js` wraps AsyncStorage for:
    - `language` (persist selected language)
    - `auth` (boolean: user has authenticated or skipped)
    - `results` (list of local test results)
  - Provides `getBadgeForScore(score)` to map scores to Bronze/Silver/Gold badges.

- Screens
  - `app/LanguageSelection.js`: Choose language, then navigate to `Auth`.
  - `app/AuthScreen.js`: Simple auth/skip mock; sets `auth` true and navigates to `Home`.
  - `app/HomeScreen.js`: Launchpad for tests and results.
  - `app/SitupTest.js`: Uses Accelerometer heuristic to count sit-ups with inactivity and “tilt” checks; after finishing, saves a result and navigates to `Result`.
  - `app/JumpTest.js`: Tracks peak g-force over ~5s to estimate jump height; saves a result and navigates to `Result`.
  - `app/ResultScreen.js`: Displays the outcome and badge; returns to `Home`.
  - `app/MyResults.js`: Loads saved results, renders a table and a simple local leaderboard (top 5 by score).

- UI and theming
  - React Native Paper components are used for cards, typography, buttons, chips, FABs, and modals.
  - Occasional `expo-linear-gradient` usage for background accents.
  - Camera overlays (`expo-camera`) are used as a visual layer while sensors drive the logic.

- Configuration
  - `app.json` holds the Expo app configuration (name/slug, splash, icons, platform settings, new architecture enabled).
  - `services/firebaseConfig.js` is a placeholder and not initialized.

## Repository layout (selective)

- `App.js`, `index.js`: App entry and navigation container
- `app/`: Screen components (language selection, auth, home, tests, results)
- `components/LanguageFab.js`: In-app language switching
- `services/i18n.js`, `services/storage.js`: Localization setup and persistence helpers
- `assets/`: App icons and splash
- `app.json`: Expo configuration

## Additional notes for Warp

- Platform run scripts are defined in `package.json` (`start`, `android`, `ios`, `web`). There are no configured `lint` or `test` scripts.
- If adding tests or linting in the future, prefer wiring scripts in `package.json` (e.g., `lint`, `test`, `test:watch`) so they can be discovered and run consistently.
