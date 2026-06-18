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

```bash
# Build for production
npm run build

# Output is in dist/ — deploy to:
```

| Host | Cost | Notes |
|------|:----:|-------|
| **Vercel** | Free | `vercel --prod` or connect Git repo |
| **Netlify** | Free | Drag dist/ to Netlify Drop |
| **GitHub Pages** | Free | Push dist/ to gh-pages branch |
| **Any static server** | Free | Serve dist/ with nginx, Apache, etc. |

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