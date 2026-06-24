# 🍽️ FoodGen Web

**FoodGen Web** is the browser-based counterpart of the FoodGen mobile app (React Native + Expo). It generates weekly and daily meal plans focused on **Filipino cuisine**, with all data stored locally in the browser — no server, no cloud, no API dependencies.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | Comes with Node.js | — |
| **VS Code** | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

### Install & Run

```bash
# 1. Navigate to the project
cd FoodGenWeb

# 2. Install dependencies (first time only)
npm install

# 3. Start the dev server
npm run dev
```

The app opens at **http://localhost:5173/** — auto-reloads on every save.

### Test on iPhone (Same Network)

```bash
# Start with network access enabled
npm run dev -- --host 0.0.0.0
```

Then on your iPhone:
1. Connect to the **same Wi-Fi network** as your PC
2. Open **Safari**
3. Navigate to: **http://YOUR_PC_IP:5173/**
   - Find YOUR_PC_IP by running `ipconfig` on Windows (look for "IPv4 Address")
   - Or check the terminal output — Vite shows "Network: http://192.168.x.x:5173"

### Production Build

```bash
npm run build
# Output is in the dist/ folder — deploy anywhere (Vercel, Netlify, GitHub Pages, etc.)
```

---

## 📁 Project Structure

```
FoodGenWeb/
├── index.html                    # Vite entry point (HTML shell)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite bundler configuration
│
├── public/                       # Static assets (favicon)
│
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component + Router setup
│   ├── App.css                   # Global styles (same theme as mobile)
│   │
│   ├── pages/                    # 5 route pages
│   │   ├── TodayPage.tsx         # Today's meals (default route)
│   │   ├── WeekPage.tsx          # Weekly meal plan
│   │   ├── AddMealPage.tsx       # Custom meal creation form
│   │   └── SettingsPage.tsx      # User preferences
│   │
│   ├── components/               # Reusable UI components
│   │   ├── MealCard.tsx          # Meal card (emoji, name, difficulty)
│   │   ├── DayRow.tsx            # Collapsible day row (week view)
│   │   ├── MealsPerDayPicker.tsx # 1🍽️ / 2🍽️🍽️ / 3🍽️🍽️🍽️ picker
│   │   ├── MealDetailModal.tsx   # Bottom sheet modal (ingredients, steps)
│   │   ├── DifficultyBadge.tsx   # Easy/Medium/Hard colored badge
│   │   └── EmptyState.tsx        # Placeholder when no data
│   │
│   ├── database/                 # IndexedDB layer (Dexie.js)
│   │   ├── db.ts                 # Dexie.js schema & connection
│   │   ├── mealRepository.ts     # CRUD operations for meals
│   │   └── planRepository.ts     # CRUD for day plans
│   │
│   ├── services/                 # Business logic
│   │   ├── mealPlanGenerator.ts  # Random meal generation algorithm
│   │   ├── seedDataLoader.ts     # Loads 77 Filipino dishes on first visit
│   │   └── preferenceManager.ts  # localStorage wrapper (mealsPerDay, labels)
│   │
│   ├── context/
│   │   └── MealPlanContext.tsx    # React Context (global state)
│   │
│   ├── types/
│   │   └── meal.ts              # TypeScript interfaces (Meal, DayPlan, etc.)
│   │
│   ├── utils/
│   │   ├── constants.ts         # App-wide constants & helpers
│   │   └── dateHelpers.ts       # Date formatting, week number calculation
│   │
│   └── data/                     # (Not used — seed data is inlined in seedDataLoader.ts)
│
└── docs/                         # Documentation (linked below)
```

---

## 🧱 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 UI Layer                         │
│   React Components (pages, modals, cards)        │
│   CSS (same theme as mobile: #FF6B35 orange)     │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│            State Management                      │
│   React Context + useReducer (same pattern as    │
│   mobile React Native app)                       │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│             Service / Logic Layer                │
│   - MealPlanGenerator (same algorithm as mobile) │
│   - SeedDataLoader (77 Filipino dishes)          │
│   - PreferenceManager (localStorage)             │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│            Persistence Layer                     │
│   Dexie.js (IndexedDB) → replaces expo-sqlite   │
│   localStorage → replaces AsyncStorage           │
└─────────────────────────────────────────────────┘
```

**Key design decision:** This is a standalone Vite + React project (not Expo Web) because:
- `expo-sqlite` doesn't work in browsers (requires native modules)
- Vite provides faster HMR and smaller builds for web
- Maintains clean separation from the mobile codebase

---

## 🗺️ Routes

| Path | Page | Description |
|------|------|-------------|
| `/#/` | TodayPage | Today's meals (default tab) |
| `/#/week` | WeekPage | Weekly meal plan |
| `/#/add-meal` | AddMealPage | Add custom meal form |
| `/#/settings` | SettingsPage | Preferences |

Uses **HashRouter** (`/#/`) for compatibility with static hosting and offline usage.

---

## 💾 Database

**Dexie.js** wraps IndexedDB with a clean, promise-based API:

| Table | Contents | Key Features |
|-------|----------|-------------|
| `meals` | 77 seed dishes + user-added meals | Auto-increment ID, filtered by `isCustom` |
| `dayPlans` | Generated daily/weekly plans | Indexed by `date`, `weekOfYear` |
| `savedWeekPlans` | Saved week plan references | Future use |

**Seed data** (77 Filipino dishes) loads automatically on first visit — no setup required.

---

## 🧪 Core Features

| Feature | Implementation |
|---------|---------------|
| Generate Today's Meals | Fisher-Yates shuffle, picks random meals per active slot |
| Generate Weekly Plan | 7-day generation with deduplication |
| 1/2/3 Meals Per Day | Segmented picker, stored in localStorage |
| Meal Detail Modal | Bottom sheet with ingredients, steps, difficulty badge |
| Add Custom Meal | Full form with dynamic arrays, validation, IndexedDB save |
| Label Toggle | Show/hide Breakfast/Lunch/Dinner headers |
| Per-Day Regeneration | Each day can be independently regenerated |
| Custom Meal Badge | 👤 "You" badge on user-added meals |

---

## 🎨 Theme

| Element | Value |
|---------|-------|
| Primary Color | `#FF6B35` (warm orange) |
| Secondary Color | `#2EC4B6` (teal) |
| Background | `#FAFAFA` |
| Error | `#F44336` (red) |
| Success (Easy) | `#4CAF50` (green) |
| Warning (Medium) | `#FF9800` (orange) |
| Custom Badge | `#9C27B0` (purple) |
| Typography | System font stack (San Francisco on iOS) |

---

## 🛠️ NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server (localhost:5173) |
| `dev:host` | `vite --host 0.0.0.0` | Start dev server accessible on network (for iPhone testing) |
| `build` | `tsc -b && vite build` | Production build to `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `test` | `vitest` | Run tests in watch mode (re-runs on changes) |
| `test:run` | `vitest run` | Run all tests once (CI-friendly) |
| `test:coverage` | `vitest run --coverage` | Run tests with coverage report |

---

## 🧪 Testing

FoodGenWeb uses [**Vitest**](https://vitest.dev/) (native Vite testing framework) + [**@testing-library/react**](https://testing-library.com/react) for component testing.

### Test Structure

```
src/__tests__/
├── setup.ts                          # Global setup: Firebase mocks, localStorage mock
├── services/
│   ├── mealPlanGenerator.test.ts     # 39 tests — core meal planning logic
│   ├── preferenceManager.test.ts     # 10 tests — localStorage wrapper
│   └── activityLogger.test.ts        # 3 tests — Firestore logging wrapper
├── utils/
│   ├── dateHelpers.test.ts           # 23 tests — date calculations & formatting
│   └── constants.test.ts             # 15 tests — slot picker & emoji helpers
├── firebase/
│   └── firestore.test.ts             # 3 tests — invite code generation
├── components/
│   ├── MealCard.test.tsx             # 18 tests — rendering, status, events
│   ├── MealDetailModal.test.tsx      # 18 tests — visibility, sections, close
│   ├── DayRow.test.tsx               # 11 tests — expand/collapse, actions
│   ├── DifficultyBadge.test.tsx      # 5 tests — colors & labels
│   ├── EmptyState.test.tsx           # 7 tests — icons, buttons, messages
│   ├── LoadingSpinner.test.tsx       # 5 tests — size, color, text
│   └── MealsPerDayPicker.test.tsx    # 6 tests — selection, max prop
└── pages/
    ├── OnboardingPage.test.tsx       # 6 tests — form validation, modals
    └── SettingsPage.test.tsx         # 5 tests — sections, sign out
```

**Total: 174 tests across 15 files** — all passing.

### How to Run

```bash
# Run once (fastest — good for CI)
npm run test:run

# Run in watch mode (auto-re-runs on file changes)
npm test

# With coverage report
npm run test:coverage
```

### Test Categories

| Category | Tests | What's Covered |
|----------|-------|----------------|
| **Unit Tests** | 93 | Pure functions: meal generation, date helpers, localStorage, activity logger |
| **Component Tests** | 70 | All 7 components: rendering, states, user interactions, edge cases |
| **Page Tests** | 11 | Onboarding form validation, settings display |

### Mocking Strategy

- **Firebase:** The setup file (`src/__tests__/setup.ts`) mocks `firebase/auth` and `firebase/firestore` entirely — no real Firebase connection needed
- **localStorage:** A mock implementation replaces the real browser API
- **window.confirm:** Mocked to auto-confirm dialogs
- **React Context:** Page tests wrap components in the real `MealPlanProvider` with mocked Firebase beneath

### Writing New Tests

To add a new test file, place it in `src/__tests__/` following the same directory structure as `src/`. For example:

```ts
// src/__tests__/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

> **Note:** TypeScript may show IDE errors for `erasableSyntaxOnly` in the setup file — these are harmless and don't affect test execution.

---

## 📚 Documentation

| Document | Location | Contents |
|----------|----------|---------|
| **Web Architecture** | `docs/FOOD_GEN_WEB_DOCUMENTATION.md` | Full web app architecture, stack choices, implementation plan |
| **Mobile Architecture** | `docs/FOOD_GEN_APP_DOCUMENTATION.md` | Original mobile app docs (same features, different stack) |
| **Project Context** | `docs/PROJECT_CONTEXT.md` | Overall project goals, history, and roadmap |

---

## 🔄 Relationship to Mobile App

| Aspect | FoodGen Mobile (React Native) | FoodGen Web (Vite + React) |
|--------|-------------------------------|----------------------------|
| **Framework** | React Native + Expo 54 | React 19 + Vite 8 |
| **Database** | expo-sqlite (SQLite) | Dexie.js (IndexedDB) |
| **Preferences** | AsyncStorage | localStorage |
| **Routing** | React Navigation | React Router (HashRouter) |
| **Icons** | @expo/vector-icons (Ionicons) | Emoji |
| **Test on iPhone** | Expo Go QR code | Safari → http://IP:5173 |
| **State Mgmt** | React Context + useReducer | React Context + useReducer |
| **Seed Data** | Same 77 Filipino dishes | Same 77 Filipino dishes |
| **Algorithm** | Fisher-Yates shuffle | Fisher-Yates shuffle (identical) |

---

## 🚢 Deployment

### Frontend (Static Hosting)

```bash
# Build for production
npm run build

# Output is in dist/ — deploy to:
```

| Host | Cost | Notes |
|------|:----:|-------|
| **Firebase Hosting** | Free | `firebase deploy --only hosting` |
| **Vercel** | Free | `vercel --prod` or connect Git repo |
| **Netlify** | Free | Drag dist/ to Netlify Drop |
| **GitHub Pages** | Free | Push dist/ to gh-pages branch |
| **Any static server** | Free | Serve dist/ with nginx, Apache, etc. |

### Firebase Firestore Rules

The app uses Firebase Firestore for data storage. Security rules control access to the database.

**Files involved:**
- `firestore.rules` — Security rules definition
- `firebase.json` — Firebase project configuration (must include `"firestore"` section)

**Deploy rules only:**

```bash
# Deploy just the Firestore rules
npx firebase deploy --only firestore:rules

# Deploy rules + hosting together
npx firebase deploy --only firestore:rules,hosting
```

**Current rules overview:**
- `referenceMeals` — Public read, authenticated write (seeded with 74 Filipino dishes)
- `users/{userId}` — User can only access their own data
- `users/{userId}/customMeals` — User's custom meals (read/write)
- `households/{householdId}` — All authenticated users can read/write household data
- `households/{householdId}/plans` — Meal plans for the household

**Important:** After modifying `firestore.rules`, always deploy with:
```bash
npx firebase deploy --only firestore:rules
```

### Seeding Reference Meals

The app requires 74 Filipino dishes in the `referenceMeals` Firestore collection. To seed:

```bash
# Run the seed script (requires firestore.rules to allow writes)
node seed-meals.js

# Check the log
type seed-log.txt
```

**Note:** The seed script temporarily requires `firestore.rules` to allow public writes to `referenceMeals`. After seeding, restrict the rules back to `allow write: if request.auth != null;`.

---

## 👨‍💻 Development Notes

### Adding a New Feature

1. **Database layer:** Add table/schema in `src/database/db.ts`, add CRUD functions in the appropriate repository file
2. **Service layer:** Implement business logic in `src/services/`
3. **Context:** Add state and methods in `src/context/MealPlanContext.tsx`
4. **UI:** Create/reuse components in `src/components/`, add page in `src/pages/`, register route in `src/App.tsx`
5. **Styling:** Add CSS classes in `src/App.css`

### Code Style

- TypeScript with strict mode
- No external UI libraries (pure CSS)
- Emoji for icons (no icon font dependency)
- Functional components with hooks
- Async/await for all database operations

---

## 📄 License

Private project — internal use.

---

*Built with ❤️ for Filipino food 🇵🇭 — June 2026*