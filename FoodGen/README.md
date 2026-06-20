# 🍽️ FoodGen

A mobile app that generates weekly and daily meal plans featuring **77 Filipino dishes** — fully offline, no internet required.

Built with **React Native + Expo**. Test on your iPhone from a Windows PC. No Mac needed.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | v18+ | https://nodejs.org |
| **VS Code** | Latest | https://code.visualstudio.com |
| **Expo Go** | Latest | Install from App Store on your iPhone |

### Setup (one-time)

```bash
# 1. Clone the repo
git clone <repo-url>
cd food-gen/FoodGen

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start
```

### Test on iPhone

1. Run `npx expo start`
2. Scan the **QR code** with your iPhone Camera app
3. Opens in **Expo Go** — the app loads instantly
4. Every code save → auto-reloads on your iPhone 🔥

---

## 📋 Available Commands

| Command | What it does |
|---------|-------------|
| `npx expo start` | Start the development server (shows QR code) |
| `npx expo start --clear` | Start fresh (clears Metro cache) — use if you see weird errors |
| `npx tsc --noEmit` | Run TypeScript type checking (no code output = no errors ✅) |
| `npx expo start --android` | Open on Android emulator |
| `npx expo start --web` | Open in browser |
| `npx eas build --platform ios` | Build for App Store (requires EAS account) |

---

## 🧪 Testing on Different Devices

| Device | How |
|--------|-----|
| **iPhone** | Scan QR code with Camera → opens in Expo Go |
| **Android** | Scan QR code with Expo Go app |
| **Web** | Run `npx expo start --web` |

---

## 📁 Project Structure

```
FoodGen/
├── App.tsx                  # Root: navigation setup (Stack + Tabs)
├── src/
│   ├── screens/
│   │   ├── TodayScreen.tsx       # Today tab — shows today's meals
│   │   ├── WeeklyScreen.tsx      # Week tab — shows Mon–Sun plan
│   │   ├── MealDetailModal.tsx   # Bottom sheet with recipe details
│   │   ├── AddMealScreen.tsx     # Form to add custom meals
│   │   └── SettingsScreen.tsx    # Settings (meals/day, display, about)
│   ├── components/
│   │   ├── MealCard.tsx          # Meal card component
│   │   └── MealsPerDayPicker.tsx # Segmented 1/2/3 meals picker
│   ├── database/
│   │   ├── database.ts           # SQLite connection & table creation
│   │   ├── mealRepository.ts     # CRUD for meals
│   │   └── planRepository.ts     # CRUD for day plans + saved weeks
│   ├── services/
│   │   ├── mealPlanGenerator.ts  # Random meal generation algorithm
│   │   ├── seedDataLoader.ts     # Seeds 77 Filipino dishes on first launch
│   │   └── preferenceManager.ts  # AsyncStorage wrapper for settings
│   ├── context/
│   │   └── MealPlanContext.tsx    # Global state management
│   ├── types/
│   │   └── meal.ts               # TypeScript interfaces
│   ├── utils/
│   │   ├── constants.ts          # App constants & helpers
│   │   └── dateHelpers.ts        # Week calculation, date formatting
│   └── data/
│       └── meals.json            # 77 pre-seeded Filipino dishes
└── package.json
```

---

## 🛠️ Tech Stack

| Technology | Purpose | Cost |
|------------|---------|------|
| React Native | Cross-platform mobile framework | Free |
| Expo SDK 54 | Build system, dev tools, QR testing | Free |
| TypeScript | Type-safe JavaScript | Free |
| expo-sqlite | Local database | Free |
| AsyncStorage | Key-value settings storage | Free |
| React Navigation | Tab + Stack navigation | Free |
| expo-haptics | Haptic feedback on actions | Free |
| expo-image-picker | Photo camera/gallery for custom meals | Free |

**Total cost to build & test: $0**

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Metro bundler errors | Run `npx expo start --clear` |
| TypeScript errors | Run `npx tsc --noEmit` to see what's wrong |
| App crashes on launch | Clear Expo Go cache: shake phone → Reload |
| QR code not scanning | Make sure iPhone and PC are on the **same Wi-Fi network** |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then run `npm install` again |

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Type check: `npx tsc --noEmit`
4. Test on device: `npx expo start` → scan QR code
5. Commit and push your branch
6. Open a Pull Request

---

## 📄 Documentation

See [`docs/FOOD_GEN_APP_DOCUMENTATION.md`](../docs/FOOD_GEN_APP_DOCUMENTATION.md) for the full app documentation including data models, architecture, UI/UX specs, and the complete list of 77 Filipino dishes.