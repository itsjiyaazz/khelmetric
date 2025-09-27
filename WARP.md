# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

KhelMetric AI is a React Native Expo application that serves as an athletic fitness testing platform. The app uses simulated AI to assess athletic performance in various fitness tests, targeting the Indian market with multi-language support (English/Hindi). The application is designed as a prototype focused on talent scouting for sports organizations like SAI (Sports Authority of India).

## Architecture & Structure

### Single-File Architecture
The entire application is contained within `App.js` (32KB), using a component-based architecture with React hooks for state management. This monolithic approach includes:

- **Main App Component**: Controls screen navigation and global state
- **Screen Components**: WelcomeScreen, ProfileScreen, DashboardScreen, TestIntroScreen, RecordingScreen, ResultsScreen, SAIDashboardScreen
- **Reusable Components**: FeaturePill, LabeledInput, SegmentButton, SmallStat, TestListItem, MetricBox, BigStat
- **Data Structures**: Multi-language translations object, user progression levels system

### Key Features
- **Multi-language Support**: Complete English/Hindi translations with cultural localization
- **Gamification System**: XP-based progression with 4 levels (Rookie → Athlete → Champion → Elite)
- **Fitness Testing**: Simulated AI analysis for sit-ups and vertical jump tests
- **Real-time Feedback**: Mock AI counters and form scoring during exercise sessions
- **SAI Dashboard**: Mock data visualization for talent scouting analytics

### State Management
Uses React hooks with centralized state in the main App component:
- Screen navigation state (`currentScreen`)
- User profile and progress data
- Exercise testing metrics and results
- Language preferences

## Common Development Commands

### Development Server
```bash
# Start Expo development server
npm start
# or
expo start

# Run on specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser
```

### Project Setup
```bash
# Install dependencies
npm install

# Clear Expo cache (if needed)
expo start -c
```

### Development Workflow
```bash
# Check for updates
expo install --fix

# Build for production (requires EAS CLI)
eas build --platform all
```

## Development Guidelines

### Component Development
- All components are functional components using React hooks
- StyleSheet objects are defined at the bottom of the file
- Components follow a props-based pattern for reusability
- Use LinearGradient from expo-linear-gradient for visual effects

### Internationalization
- All user-facing text must be added to the `translations` object
- Support both English and Hindi languages
- Use the `t` object (memoized translation) for all text rendering
- Consider cultural context when adding new features

### State Updates
- Use React hooks (useState, useEffect, useMemo) consistently
- Screen transitions are controlled by `setCurrentScreen`
- Exercise simulation uses intervals for real-time updates
- XP and progress updates should include immediate UI feedback

### Styling Conventions
- Use StyleSheet.create for all styles
- Colors follow a consistent palette (blues, oranges, grays)
- Use consistent spacing and border radius values
- Implement responsive design principles for different screen sizes

### Testing Simulation
- All AI features are currently simulated with Math.random() and timers
- Exercise metrics are calculated using predefined algorithms
- Mock data is used for dashboard analytics and user statistics

## Platform-Specific Considerations

### Expo Configuration
- App configuration is in `app.json` with platform-specific settings
- Uses Expo SDK ~54.0.10 with React Native 0.81.4
- New Architecture enabled for performance improvements
- Edge-to-edge display support on Android

### Assets & Icons
- Icons use @expo/vector-icons (Ionicons, MaterialIcons, FontAwesome5)
- Assets are stored in `/assets` directory
- Supports adaptive icons for Android and standard icons for iOS

### Performance
- Single large component file may impact hot reload performance
- Consider code splitting if the app grows beyond current scope
- Memoization is used for translations and level calculations

## Development Notes

- This is a prototype application with simulated AI functionality
- No database or persistent storage is implemented (all data is ephemeral)
- Camera integration is planned but not implemented in current version
- Offline functionality is simulated (no actual sync capabilities)
- Regional talent data and analytics are mock implementations

## Future Architecture Considerations

When expanding beyond the prototype phase:
- Consider splitting App.js into separate screen and component files
- Implement actual AI/ML models for exercise analysis
- Add database integration for persistent user data
- Include camera integration for real exercise analysis
- Implement proper offline/online sync capabilities
- Add comprehensive testing framework for fitness assessment accuracy