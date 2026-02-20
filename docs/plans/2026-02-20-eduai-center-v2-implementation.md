# EduAI Center v2.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modular AI Hub featuring Spaced Repetition, an AI Coach Sidebar, and Gamified Mini-Games.

**Architecture:** A new modular service layer for AI-specific logic, integrated into existing system settings and profiling. Uses Hard/Junction links for OpenCode superpowers.

**Tech Stack:** Spring Boot, PostgreSQL, React, Lucide-React, Gemini AI.

---

### Task 1: Admin Configuration Expansion

**Files:**
- Modify: `eduflex/src/main/java/com/eduflex/backend/service/SystemConfigService.java`
- Modify: `eduflex/src/main/java/com/eduflex/backend/controller/SystemConfigController.java`

**Step 1: Add new config keys for AI XP Ratio and Credits**
Add `ai_xp_ratio` and `ai_credit_earn_rate` to the configuration logic.

**Step 2: Update frontend Admin UI**
Modify: `frontend/src/features/admin/SystemSettings.jsx` to include the "EduAI" tab.

**Step 3: Commit**
```bash
git commit -m "feat: add admin config for EduAI XP and Credits"
```

---

### Task 2: Spaced Repetition Data Layer

**Files:**
- Create: `eduflex/src/main/java/com/eduflex/backend/model/SpacedRepetitionItem.java`
- Create: `eduflex/src/main/java/com/eduflex/backend/repository/SpacedRepetitionRepository.java`

**Step 1: Create Entity**
Define the Item entity with fields for SM-2 algorithm (interval, ease, nextReview).

**Step 2: Commit**
```bash
git commit -m "feat: add SpacedRepetitionItem entity and repository"
```

---

### Task 3: EduAI Hub Service & Logic

**Files:**
- Create: `eduflex/src/main/java/com/eduflex/backend/service/EduAiHubService.java`
- Create: `eduflex/src/main/java/com/eduflex/backend/controller/EduAiHubController.java`

**Step 1: Implement Hub Logic**
Create methods for fetching the "Review Queue" and calculating next review intervals.

**Step 2: Commit**
```bash
git commit -m "feat: implement EduAiHubService and API endpoints"
```

---

### Task 4: AI Coach Sidebar (Frontend)

**Files:**
- Create: `frontend/src/features/ai/AiCoachSidebar.jsx`
- Modify: `frontend/src/components/layout/MainLayout.jsx`

**Step 1: Build Sidebar Component**
Create the glassmorphic sidebar with Lucide icons and context-aware chat.

**Step 2: Commit**
```bash
git commit -m "feat: add AiCoachSidebar component to main layout"
```

---

### Task 5: EduAI Hub Page & Mini-Games

**Files:**
- Create: `frontend/src/features/ai/EduAiHub.jsx`
- Create: `frontend/src/features/ai/components/ReviewModal.jsx`

**Step 1: Build Hub Page**
Implement radar charts and daily review widgets.

**Step 2: Build Review Modal**
Create the modal container for mini-games.

**Step 3: Commit**
```bash
git commit -m "feat: build EduAI Hub page and Review Modal"
```
