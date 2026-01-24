# Mobile Theme Creation Rules

This document defines the strict rules and requirements for creating new mobile themes for EduFlex from image inputs. When the user provides a design image, **FOLLOW THESE PROCEDURES EXACTLY**.

## 1. File Structure & Location
All mobile themes must be placed in: `frontend/src/components/MobileThemes/`.
The mapping logic resides in: `frontend/src/components/MobileThemes/MobileThemeResolver.jsx`.

## 2. Component Requirements
Every mobile theme component (e.g., `EduFlexNeon.jsx`) **MUST** implement the following:

### A. Props
The component must accept these props:
```javascript
const ThemeComponent = ({ currentUser, myCourses, upcomingAssignments }) => { ... }
```

### B. Internal SPA Architecture (CRITICAL)
Mobile themes must **NEVER** link to desktop routes (e.g., `/courses`, `/users`). Doing so breaks the theme and loads the desktop view.
Instead, implement an **Internal "View" State**:
```javascript
const [view, setView] = useState('dashboard'); // 'courses', 'users', 'chat', etc.
```
All navigation buttons must update this state (`setView('courses')`) instead of calling `navigate()`.

### C. Required Views & Features
The theme must internally render at least these views:
1.  **Dashboard (Home)**: Role-specific widgets (see Section 3).
2.  **Courses**: Full catalog with **Color-Coded Cards** (matching system course colors).
3.  **Course Details**: Clicking a course **MUST** open a detailed view (`MobileCourseView`) with modules and assignments.
4.  **Users**: Searchable list of users.
5.  **Documents/Resources**: "Google Drive" style file manager (Upload/Download/Share).
6.  **Calendar**: Full mobile calendar (Month/Week/Day views).
7.  **Communication**: Message center access.
8.  **Admin Tools**: Analytics/Profile/Settings.

### D. Navigation Dock (MANDATORY)
The Dock/Bottom Bar **MUST** include exactly these 5 items in this order:
1.  **Home** (Dashboard) - Icon: `Home`
2.  **Courses** (List) - Icon: `BookOpen`
3.  **Communication** (Chat/Messages) - Icon: `MessageSquare` + Unread Badge.
4.  **Resources** (Files) - Icon: `FolderOpen`
5.  **Menu** (More) - Icon: `Menu` or `MoreHorizontal`

**NO OTHER ICONS** are allowed in the main dock. Variant icons (e.g. `Users`) must be moved to the Overlay Menu.

### E. System Menu (Z-Index 10000)
The "Menu" button must open an overlay (`SimpleInternalMenu`) that includes:
1.  **Theme Switcher**: Use `useBranding().updateBranding` to allow switching themes.
2.  **Logout**: Standard `navigate('/logout')`.
3.  **Settings**: Toggle Dark Mode, etc.

## 3. Role-Based Logic (The "ALL Data" Rule)
The Dashboard view **MUST** change content based on `currentUser.role`:

### ADMIN (Required Widgets)
*   **Stats Row**: Total Users, Total Courses, Archived Files.
*   **Recent Activity**: List of "Senaste Användare" (Newest users).
*   **Uploads**: List of "Senaste Uppladdningar" (Recent files).
*   **Quick Links**: Access to Administration, Analytics, Profile.

### TEACHER
*   **Grading Queue**: Count of ungraded submissions.
*   **Applications**: Pending course applications.
*   **My Students**: Access to student list.

### STUDENT
*   **Upcoming**: Next assignments with due dates.
*   **Gamification**: Level, XP, Progress.
*   **Active Courses**: List of currently active courses.

**Do NOT use mock data if API is available.** Fetch real data using `api` services.

## 4. Visual Standards (Pixel Perfect)
*   **Header**:
    *   **Left**: Avatar (First+Last Initial if no img) + Name + Role (lowercase).
    *   **Right**: Notifications + Search.
    *   **Fallback (IMPORTANT)**: Always use `MobileAvatar` component logic.
        *   **MUST** show Profile Picture if available.
        *   **MUST** fallback to Initials (First + Last) if no picture.
        *   **NEVER** use "UN" or generic placeholders.
        *   **MUST** use a **Neutral Background Color** (e.g., Gray) for the initial circle, not random UI-Avatars colors.
*   **Scrolling**: The header must be `relative` (scrolls with page) or handled carefully to avoid sticky overlap issues.
*   **Styling**: Use Tailwind classes entirely. Match the user's provided image **exactly**.

## 5. Implementation Safety Guidelines (CRITICAL)
When implementing or modifying themes, strictly adhere to:

### A. Component Preservation
**NEVER** delete helper components defined in the main file (e.g., `MobileFloatingNav`, `SimpleInternalMenu`, `ErrorBoundary`).
If you restructure the code, **MOVE** them, do NOT delete them. Missing components cause "White Screen of Death".

### B. Robust Data Handling
API responses can vary (e.g., Spring Boot `Page<T>` vs `List<T>`).
**ALWAYS** parse array data defensively:
```javascript
const safeArray = Array.isArray(data) ? data : (data?.content || []);
```
**NEVER** assume `data.map` exists without check.

### C. Icon Safety
When using `lucide-react`:
*   Prefer basic icons (`Play`, `User`) over specific variants (`PlayCircle`, `UserCircle2`) unless certain of the version.
*   If an icon causes a crash on import, the entire page will fail to load (caught only by the highest-level ErrorBoundary).

### D. Debugging & Error Boundaries
Every Theme Component **MUST** wrap its content in a local `ErrorBoundary` that displays the **Full Stack Trace** in development mode.
Do not use a generic "Ojdå" message; efficient debugging requires seeing the error immediately on the mobile screen.

## 6. Workflow for New Themes
1.  **Analyze Image**: Identify colors, button styles, header layout.
2.  **Scaffold**: Copy structure from `EduFlexFinsights.jsx`.
3.  **Style**: Apply the image's aesthetics.
4.  **Wire Up**: Ensure the `MobileDashboardView` logic is used to ensure full role functionality.
5.  **Register**: Add the new theme to `MobileThemeResolver.jsx`.
6.  **Verify**: Test navigation, especially the "Course Detail" flow to ensure it doesn't crash.
