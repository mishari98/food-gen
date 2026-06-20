# FoodGen - Project Context & Reference

> **Purpose**: This document provides a comprehensive overview of the FoodGen project for AI agents and developers. Read this file first to understand the project without manually exploring files.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | FoodGen |
| **Type** | Mobile App (React Native + Expo) |
| **Language** | TypeScript |
| **Framework** | React Native 0.81.5 + Expo SDK 54 |
| **Version** | 1.0.0 |
| **Repository** | https://github.com/mishari98/food-gen.git |
| **Working Directory** | `c:\w\food-gen` |
| **App Directory** | `c:\w\food-gen\FoodGen` |

---

## 2. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo SDK | 54.0.34 | Build system, dev tools, QR code testing |
| TypeScript | 5.9.2 | Type-safe JavaScript |
| React | 19.1.0 | UI library |
| expo-sqlite | 16.0.10 | Local SQLite database |
| AsyncStorage | 2.2.0 | Key-value storage for preferences |
| React Navigation | 7.x | Tab navigation + screen routing |
| expo-haptics | 15.0.8 | Haptic feedback (installed, not yet wired up) |
| expo-image-picker | 17.0.11 | Photo capture for custom meals |
| expo-status-bar | 3.0.9 | Status bar control |

---

## 3. Project Structure

```
FoodGen/
├── app.json                    # Expo configuration
├── App.tsx                     # Root component
├── index.ts                    # Entry point
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── assets/                     # App icons, splash screen
└── src/
    ├── navigation/
    │   └── TabNavigator.tsx    # Bottom tab: Today | Week
    ├── screens/
    │   ├── TodayScreen.tsx     # Today tab
    │   ├── WeeklyScreen.tsx    # Week tab
    │   ├── MealDetailModal.tsx # Meal detail bottom sheet
    │   ├── AddMealScreen.tsx   # Add custom meal form
    │   └── SettingsScreen.tsx  # Settings
    ├── components/
    │   ├── MealCard.tsx        # Reusable meal card
    │   └── MealsPerDayPicker.tsx # 1/2/3 meals picker
    ├── database/
    │   ├── database.ts         # SQLite connection + init
    │   ├── mealRepository.ts   # CRUD for meals
    │   └── planRepository.ts   # CRUD for plans
    ├── services/
    │   ├── mealPlanGenerator.ts  # Core generation algorithm
    │   ├── seedDataLoader.ts     # Load meals into SQLite
    │   └── preferenceManager.ts  # AsyncStorage wrapper
    ├── context/
    │   └── MealPlanContext.tsx  # Global state
    ├── types/
    │   └── meal.ts             # TypeScript types
    ├── utils/
    │   ├── constants.ts        # App constants
    │   └── dateHelpers.ts      # Date utilities
    └── data/                   # meals.json seed data
```

---

## 4. What the App Does

FoodGen is a **100% offline** meal planning app for **Filipino cuisine**. It:

- Seeds **77 Filipino dishes** into a local SQLite database on first launch
- Generates daily or weekly meal plans randomly
- Shows meals for today or a full week (Mon-Sun)
- Lets users configure 1, 2, or 3 meals per day
- Allows adding custom meals
- Requires **no internet connection** after first launch
- Stores everything locally (SQLite + AsyncStorage)

---

## 5. Key Configuration

### app.json

- Slug: `FoodGen`
- Orientation: portrait-only
- New Architecture: enabled
- iOS: supports tablet
- Android: edge-to-edge enabled
- Plugins: `expo-sqlite`

### Scripts

| Command | Purpose |
|---------|---------|
| `npx expo start` | Start development server |
| `npx expo start --ios` | Start for iOS |
| `npx expo start --android` | Start for Android |
| `npx expo start --web` | Start for web |

---

## 6. Data Model

### SQLite Tables

- **meal_slots**: Lookup table for meal times (Breakfast, Lunch, Dinner, Snack)
- **meals**: All dishes with name, suggestedFor (JSON), cuisine, prepTime, difficulty, emoji, ingredients (JSON), steps (JSON), calories, isCustom
- **day_plans**: Generated daily plans with breakfast/lunch/dinner/snack IDs
- **saved_week_plans**: Saved weekly plans

### Key Design Decision

Dishes are NOT rigidly tied to meal slots. The `suggestedFor` field is a JSON array (e.g., `["breakfast","lunch","dinner"]`). The generator pulls from the entire pool for any slot.

---

## 7. App Screens

| Screen | Purpose |
|--------|---------|
| TodayScreen | Shows today's meals, generate/regenerate |
| WeeklyScreen | Shows Mon-Sun plan, collapsible days |
| MealDetailModal | Full recipe with ingredients + steps |
| AddMealScreen | Form to add custom meals |
| SettingsScreen | Meals per day config, display options |

---

## 8. App Theme

| Element | Value |
|---------|-------|
| Primary Color | #FF6B35 (warm orange) |
| Secondary Color | #2EC4B6 (teal) |
| Background | #FAFAFA (light) |
| Error | #F44336 (red) |
| Success | #4CAF50 (green) |
| Typography | System font (San Francisco on iOS) |

---

## 9. Build & Deployment

### Development

```bash
cd FoodGen
npx expo start
# Scan QR code with Expo Go on iPhone
```

### Production Build (Requires Apple Developer $99/year)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile production
```

### Important Notes

- **Expo Go** (free): Test on iPhone by scanning QR code, requires PC running
- **EAS Build** (free tier, 30 builds/month): Cloud compilation, requires Apple Developer account for iOS
- **iOS limitation**: Cannot install unsigned apps without Apple Developer account ($99/year)
- **Android**: Can build free APK without Apple Developer account

---

## 10. Implementation Status

| Feature | Status |
|---------|--------|
| Today's meals generation | Done |
| Weekly plan generation | Done |
| Meals per day config (1/2/3) | Done |
| Meal detail view | Done |
| Add custom meal | Done |
| Local SQLite storage | Done |
| Per-day regeneration | Done |
| Save/load plans | Done |
| Haptic feedback | Installed, not wired up |
| Dark mode | Not implemented |
| Accessibility | Not implemented |

---

## 11. Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Project Context | `docs/PROJECT_CONTEXT.md` | This file - quick reference |
| App Documentation | `docs/FOOD_GEN_APP_DOCUMENTATION.md` | Full app design & architecture |
| iPhone Installation | `docs/IPHONE_INSTALLATION_GUIDE.md` | How to install on iPhone |
| Agent Instructions | `FoodGen/AGENTS.md` | Instructions for AI agents |

---

*Last updated: June 15, 2026*