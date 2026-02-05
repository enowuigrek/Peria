# PERIA - CHANGELOG

## [0.4.0] - 2026-01-11

### 🎨 Major UI/UX Overhaul + Code Refactoring
**Sharp corners, thin borders, mobile-first, event editing**

#### Added
- **Event editing** - Full inline editing for individual events (title, date, time, endTime)
- **Edit icons** - Pencil icon next to export/delete buttons for each event item
- **Always-visible action buttons** - All action buttons (edit, export, delete) now permanently visible (no hover needed)

#### Changed
- **Sharp corners** - Changed `border-radius: 4px` → `border-radius: 0` across entire app
- **Thin colored borders** - Replaced thick left borders (4px/6px) with thin 1px borders in category colors:
  - MyNotes: 1px solid yellow (#fdd03b)
  - Checklists: 1px solid green (#5db85f)
  - Events: 1px solid blue (#4a9396)
  - Inbox: Dynamic 1px border based on unassigned categories
- **Removed all hover effects** - Mobile-first approach, hover states unnecessary for touch interfaces
  - Chat: stopRecordingButton hover removed
  - Checklists: deleteItemButton hover removed
  - Events: exportItemButton and deleteItemButton hover removed
- **Stop button during recording** - Changed X button to red STOP button with white square icon (matching recording button colors)
- **Fixed menu animation** - Changed scroll behavior from 'smooth' to 'instant' to prevent menu jumping during expansion

#### Fixed
- Menu jumping during expansion (scrollIntoView conflict with CSS animation)
- Button visibility on mobile (all action buttons now always visible)

---

## [0.3.3] - 2026-01-11

### 🔧 Major Code Refactoring
**Color palette unification + shared infrastructure**

#### Added
- **Shared hooks** - `src/hooks/useLocalStorage.js` (eliminates ~200 lines of duplication)
- **Icon components** - `src/components/icons/` with 5 reusable SVG components (eliminates 36 duplications)
  - DeleteIcon, ChevronIcon, EditIcon, MicIcon, CalendarIcon
- **Shared components** - `src/components/shared/EmptyState.jsx` (eliminates ~80 lines)

#### Changed
- **Unified color palette** - Reduced from 10+ colors to 4 base colors in `src/styles/variables.scss`:
  - Blue (#4a9396) - Events, primary
  - Green (#5db85f) - Checklists, success
  - Yellow (#fdd03b) - MyNotes, warnings
  - Red (#dc2626) - Recording, delete, errors
- **Semantic variables** - Added semantic names for borders, overlays, shadows
- **Replaced 70+ hardcoded colors** - All colors now use SCSS variables
- **Removed orange color** - Eliminated orange (#cb7f07), replaced with red (#dc2626)

#### Removed
- Duplicate color definitions across SCSS files
- Dead code in ChatVoiceFirst.jsx
- Inconsistent color usage

---

## [0.3.2] - 2026-01-10

### 🎨 UI/UX Refinements
**Mobile-first optimization + Color scheme update + Inbox improvements**

#### Changed
- **Removed all hover states** - Mobile-first approach, unnecessary for touch interfaces
- **Category colors updated**:
  - MyNotes: teal → yellow (#fdd03b) - sticky notes style with black text
  - Checklists: yellow → green (#5db85f)
  - Events: orange → teal (#4a9396)
- **Inbox section styling**:
  - Replaced colored section backgrounds with horizontal separators
  - Events in Inbox now display with black background (#000000) and blue left border (matching Events section)
  - Removed yellow styling from checklist section
  - All sections separated by simple `border-top` lines (like "Pokaż oryginał")
- **Removed glow effects** - Eliminated box-shadow glow from new items (cleaner look)

#### Added
- Support for multi-day events (endDate field)
- Calendar emoji 📅 in event titles
- AI prompt updated to handle multi-day events (creates single event with date + endDate)

#### Fixed
- Events background color in Inbox (was navy/gray, now pure black)
- Section separators consistency across Inbox
- Export button coloring (darker by default, lighter only on :active)
- Yellow tinting on note cards after export (removed)

---

## [0.3.1] - 2026-01-09

### 📝 Documentation & Brand Update
**Refactored documentation + updated tagline**

#### Changed
- **TAGLINE UPDATE**: "Gdzie myśl się rodzi" → "Gdy myśl pojawia się wtedy, gdy jej nie szukasz"
  - Updated in: SplashScreen, index.html, manifest.json, README.md, ROADMAP.md, CHANGELOG.md
- **Documentation cleanup**:
  - README.md - removed duplicated roadmap info, kept intro + quick start
  - ROADMAP.md - updated status section to reflect all completed features
  - Added detailed completed features list in roadmap (13 checkmarks)
  - Clarified that PWA is stable and ready for daily use
- Updated project status: **FAZA 0 COMPLETED - PWA stable and functional** ✅

#### Added
- **ARCHITECTURE.md** - Complete technical documentation for AI assistants
  - Full project structure tree
  - Quick reference for all key files (7 main components documented)
  - Data flow diagrams (Voice → Whisper → GPT → localStorage → UI)
  - localStorage storage schema with examples
  - Debugging guide for common issues
  - Complete data models for all entities (Note, MyNote, Checklist, Event)
- **AI Quick Reference in README.md** - Fast onboarding for AI in new chat sessions
  - Direct links to all documentation files
  - Key code files locations
  - Storage keys reference

---

## [Unreleased] - 2026-01-09

### 🎨 UI/UX Changes
**Sharp corners + Bordered buttons**

#### Changed
- Border radius changed from `12px` → `4px` (sharp corners)
- Button style changed from solid background → transparent with colored border
- Large "Edytuj tytuł" buttons replaced with small ✎ edit icons next to titles

#### Added
- **DESIGN-SYSTEM.md** - centralna dokumentacja wszystkich kolorów, typografii i komponentów (PWA only)
- Small edit title icons (✎) in Checklists and Events sections
- Category-specific colors in bottom navigation (active states)

#### Fixed
- Navigation bar colors consistency
- Consistent spacing across all screens
- Border styles unified (4px left border for categories, 3px for internal sections)

---

## [0.3.0] - 2026-01-08

### 🎨 Visual Refinements
**Polish and consistency improvements**

#### Changed
- Improved navigation visual consistency
- Enhanced category color implementation

---

## [0.2.0] - 2025-12

### 🧠 AI Auto-Detection
**GPT-4 powered structure detection**

#### Added
- AI auto-detection of structure in chaotic text
- Smart detection tracking (export buttons hide when exported)
- Auto-restore export button after deletion from section
- Inline title editing (click title → edit → Enter/Escape)
- Category color coding (#4a9396 teal, #fdd03b yellow, #cb7f07 orange)

#### Changed
- Model changed from `tasks[]` to `notes[]` (note-centric architecture)
- One note = source of truth with detected elements
- Export buttons now appear dynamically based on detection

---

## [0.1.0] - 2025-11

### 🎙️ Voice Recording
**PWA prototype with voice-first UX**

#### Added
- Voice recording via browser (Web Audio API)
- Whisper API transcription
- PWA manifest + service worker
- Mobile-first UX (sticky nav, large touch targets 56px)
- Viewport lock (disabled zoom/pinch)
- Recording indicator with pulsing animation
- Dark theme (navy + teal/yellow/orange accents)
- SVG icons in navigation
- Splash screen "Peria - Gdy myśl pojawia się wtedy, gdy jej nie szukasz"
- Smooth expand/collapse animations (0.3s ease)
- 3 dedicated sections: MyNotes, Checklists, Events
- Export to Apple Notes/Reminders/Calendar (Share API)

---

## Design Tokens Evolution

### Colors & Borders
- **Current (2026-01-09)**: Sharp corners (4px), bordered buttons, category colors, small edit icons
- **v0.2.0**: Rounded corners (12px), solid button backgrounds
- **v0.1.0**: Basic dark theme setup

### Typography
- Font sizes: `0.95rem` (titles), `0.75rem` (meta), `0.7rem` (badges)
- Weight: 600 (titles/badges), 500 (dates), 400 (body)
- Line height: 1.5 (default), 1.2 (headings)

### Spacing
- Card padding: `0.875rem` (~14px)
- Gap between cards: `0.75rem` (~12px)
- Internal spacing: multiples of 4px (4, 8, 12, 16)

---

## Migration Guide

### To Current Version (2026-01-09)
**Sharp corners + Bordered buttons + Small edit icons**

If you have custom styles:
1. Change all `border-radius: 12px` → `border-radius: 4px`
2. Update button styles:
   - Remove `background: solid color`
   - Add `background: transparent`
   - Add `border: 1px solid rgba(color, 0.4)`
3. Replace large "Edytuj tytuł" buttons with small ✎ icons
4. Check DESIGN-SYSTEM.md for all current values

---

## Future Plans

### PWA Improvements
- Enhanced offline support
- Performance optimizations
- Additional export formats

### Native Apps (separate projects)
- iOS native app (React Native)
- Android consideration
- Desktop app consideration

---

**Note:** For detailed design documentation, see [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
