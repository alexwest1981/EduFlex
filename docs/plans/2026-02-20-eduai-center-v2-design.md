# Design Document: EduAI Center v2.0 (Modular AI Hub)

**Date:** 2026-02-20
**Status:** Approved
**Topic:** AI-driven adaptive learning hub, Spaced Repetition, and Gamification.

## 1. Goal
Transform EduFlex Adaptive Learning from a background analysis service into a central, engaging student experience. The "Hub" will act as the student's personal learning headquarters, driving engagement through proactive AI coaching and gamified repetition.

## 2. Architecture: The Modular AI Hub
To maintain a clean codebase, we will introduce a modular approach where AI-specific logic is encapsulated.

### Backend
- **`EduAiHubService`**: Orchestrates daily reviews, session logic, and AI Coach personality.
- **`SpacedRepetitionService`**: Implements the SM-2 algorithm to manage kunskapsfragment (knowledge fragments).
- **Entities**:
    - `SpacedRepetitionItem`: Tracks memory strength (interval, ease, next review).
    - `AiCredit`: Separate currency for AI-specific interactions.
- **Admin API**: New endpoints to fetch/update `SystemConfig` for AI XP-ratios and credit earn rates.

### Frontend
- **`AiCoachSidebar`**: A persistent, context-aware glassmorphic sidebar for quick help and proactive tips.
- **`EduAiHubPage`**: A dedicated workspace featuring:
    - Radar Charts (VAK Profile & Skills).
    - Daily Review Widget.
    - Mini-Game Tiles (Flashcards, Terminology Tetris).
- **Mini-Games**: Implemented as **Modals** to maintain context while improving focus.

## 3. Data Flow
1. **Trigger**: Student completes a lesson or quiz.
2. **Analysis**: `AdaptiveLearningService` updates the profile.
3. **Queueing**: Significant concepts are added to the `SpacedRepetitionQueue`.
4. **Engagement**: AI Coach Sidebar notifies the student when "Review is Ready".
5. **Reward**: Completing reviews via Mini-Games grants XP (multiplied by Admin-ratio) and AI-Credits.

## 4. Admin & Economy
Administrators can control the system's "pacing" via **Admin -> System Settings -> EduAI**:
- **XP Multiplier**: Adjusts reward weight of AI activities.
- **Credit Velocity**: Adjusts how quickly students earn AI-credits.
- **Proactivity Toggle**: Sets how often the Sidebar AI initiates contact.

## 5. Verification Plan
- **Backend**: Unit tests for SM-2 interval calculations.
- **Frontend**: Manual UX testing of the Sidebar responsiveness and Modal game transitions.
- **Economy**: Balance check to ensure XP-ratios don't break general progression.
