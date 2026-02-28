# EduFlex Mobile Architecture

## Goal
To provide a smooth learning experience on mobile devices with native performance and offline support.

## Technology Stack
- **Framework**: React Native (Expo/Bare Workflow)
- **State Management**: Redux Toolkit + RTK Query
- **Local Storage**: WatermelonDB or SQLite (for large datasets/offline syncing)
- **Authentication**: JWT bridge with the EduFlex LLP backend.

## Offline Strategy
1. **Background Sync**: Use `react-native-background-fetch` to sync course progress when online.
2. **Offline-First Data**: All course content (quizzes, lessons) is cached locally upon first download.
3. **Queue System**: User interactions (answers, progress updates) are queued and sent sequentially when connectivity is restored.

## Security
- **Biometric Auth**: FaceID/Fingerprint integration for secure access.
- **Encrypt Local Storage**: Sensitive PII remains encrypted using AES-256.

## Development Roadmap
- [ ] Phase 1: Auth Bridge & Course Sync
- [ ] Phase 2: Offline Video Playback
- [ ] Phase 3: Push Notifications integration
