# FoodGen — React Native + Expo App Documentation

## Table of Contents

1. [Concept Overview](#1-concept-overview)
2. [Core Features](#2-core-features)
3. [Development & Testing Setup](#3-development--testing-setup)
4. [Architecture](#4-architecture)
5. [Data Model](#5-data-model)
6. [Offline-First Approach](#6-offline-first-approach)
7. [UI / UX Design](#7-ui--ux-design)
8. [Technology Stack & Cost Breakdown](#8-technology-stack--cost-breakdown)
9. [Project Structure](#9-project-structure)
10. [Future Expansion](#10-future-expansion)

---

## 1. Concept Overview

**FoodGen** is a mobile application built with **React Native + Expo** that helps users generate weekly and daily meal plans without requiring an internet connection. All food data, recipes, and user preferences are stored locally on-device using SQLite and AsyncStorage.

### Cuisine Focus: Filipino 🇵🇭

- **Phase 1 (MVP)** will exclusively feature **Filipino cuisine** — adobo, sinigang, kare-kare, lumpia, tapsilog, and many more.
- All **77 seed meals** in the MVP will be Filipino dishes.
- **Future phases** will expand to other cuisines (Italian, Asian, Mexican, etc.) with cuisine filtering and mixing options.
- The architecture supports multiple cuisines from day one — the `cuisine` field in the data model is already in place.

### Why React Native + Expo?

| Reason | Detail |
|--------|--------|
| **Develop on Windows** | Use VS Code on your Windows machine — no Mac required |
| **Test on iPhone for free** | Scan a QR code with the **Expo Go** app on your iPhone to instantly see changes |
| **Publish to App Store** | Expo's cloud build service (EAS Build) compiles your app — no Mac needed |
| **100% offline** | SQLite database and AsyncStorage keep all data on the device |
| **All tools free** | No paid licences, no subscriptions, no cloud services needed |

### Core Premise

- The user opens the app and gets an instant meal plan — for **today** or for the **full week**.
- No sign-up, no cloud sync, no network calls.
- The generated plan is based on a pre-seeded local database of meals with flexible slot assignment (any dish can be assigned to any meal slot).

### Target Platforms (Phase 1)

| Platform | Supported? | How |
|----------|-----------|-----|
| **iPhone** (iOS 15+) | ✅ **Yes** | Primary target — test via Expo Go, publish via EAS Build |
| **iPad** (iPadOS 15+) | ✅ Yes | Same codebase, adapts to iPad screen |
| **Android** | ✅ Yes | Expo supports Android automatically — bonus |
| **macOS desktop** | ❌ No (Phase 1) | Could be added later via Expo for Desktop |
| **Web** | ❌ No (Phase 1) | Could be added later via Expo for Web |

---

## 2. Core Features

### 2.1 MVP (Phase 1)

| Feature | Description |
|---------|-------------|
| **Generate Today's Meals** | One tap to see meals for the current day |
| **Generate Weekly Plan** | Generate a full 7-day meal plan (Mon–Sun) |
| **Configurable Meals Per Day** | Choose **1**, **2**, or **3** meals per day (see section 2.3 below) |
| **View Meal Details** | Tap any meal card to see ingredients, prep time, difficulty, and step-by-step instructions |
| **Add Custom Meal** | User can manually add their own meal if it's not in the default list (see section 2.5) |
| **Local Data Store** | All meals, recipes, and generated plans persisted on-device using **expo-sqlite** |
| **Random & Balanced Generation** | Algorithm ensures variety across the week — no repeated meals within the same plan |
| **Per-Day Customisation** | Random-generate the whole week/today, then customise individual days |

### 2.2 Meals Per Day Configuration

| Setting | Meals Generated | Default For |
|---------|----------------|-------------|
| **1 meal/day** 🍽️ | Dinner only | Default setting |
| **2 meals/day** 🍽️🍽️ | Lunch + Dinner | Optional |
| **3 meals/day** 🍽️🍽️🍽️ | Breakfast + Lunch + Dinner | Optional |

**How it works:**

- The setting is stored in **AsyncStorage** (`mealsPerDay` key).
- It applies to **both Today and Weekly** generation.
- The generator picks random dishes from the **entire meal pool** (all 77 dishes) for each meal slot.
- The generator skips meal slots that are not selected (e.g., if set to 1 meal, only Dinner is generated).
- On the **Today** and **Week** screens, only the configured meal slots are displayed.

### 2.3 Configuration UI

| Location | What the user sees |
|----------|-------------------|
| **Settings screen** (gear icon ⚙️ in top bar) | A **segmented picker** with 3 options: 1 🍽️ / 2 🍽️🍽️ / 3 🍽️🍽️🍽️, with labels "1 Meal (Dinner)", "2 Meals (Lunch + Dinner)", "3 Meals (Breakfast + Lunch + Dinner)" |
| **Quick toggle on Today/Week screen** | Same picker, placed below the title, so the user can quickly change without going to Settings |
| **Per-day customisation** | On the Week screen, each day can be individually regenerated to swap meals **within the configured meal count** |

### 2.4 Example Scenarios

| Setting | Today Screen Shows | Week Screen Shows |
|---------|-------------------|-------------------|
| **1 meal** | 🍗 *Chicken Adobo* (Dinner only) | Each day shows 1 dinner |
| **2 meals** | 🥗 *Lunch: Sinigang* + 🍗 *Dinner: Adobo* | Each day shows lunch + dinner |
| **3 meals** | 🌅 *Breakfast: Tapsilog* + 🥗 *Lunch: Sinigang* + 🍗 *Dinner: Adobo* | Each day shows breakfast + lunch + dinner |

### 2.5 Add Custom Meal

Users can manually add their own meals to the local database if a desired dish is not included in the default seed list.

**Access points:**
- **"+" button** in the top navigation bar (visible on Today and Week screens)
- **"Add Custom Meal" option** at the bottom of the meal category list in Settings

**Add Meal Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Meal Name** | Text input | ✅ Yes | e.g., "Pork Sisig" |
| **Suggested For** | Multi-select checkboxes | ✅ Yes | Check at least one: Breakfast / Lunch / Dinner / Snack |
| **Cuisine** | Picker | ✅ Yes | Default: Filipino |
| **Prep Time** | Number input | ✅ Yes | In minutes |
| **Difficulty** | Picker | ✅ Yes | Easy / Medium / Hard |
| **Emoji** | Emoji picker | ❌ No | Default: 🍽️ |
| **Ingredients** | Dynamic list | ✅ Yes | Add multiple: name + quantity |
| **Steps** | Dynamic list | ✅ Yes | Add multiple step-by-step instructions |
| **Calories** | Number input | ❌ No | Approximate calories |

**Data flow:**

```
1. User taps "+" button
2. AddMealScreen opens with empty form
3. User fills in fields (name, suggestedFor slots, ingredients, steps, etc.)
4. User taps "Save Meal"
5. Validation: Name + at least 1 suggested slot + at least 1 ingredient required
6. Meal is inserted into SQLite meals table
7. New meal appears in generation pool immediately
8. Success toast: "🍽️ Sisig added to your meals!"
```

**Distinction from seed meals:**
- Custom meals have `is_custom = 1` flag in the database
- Custom meals are displayed with a "👤 You" badge on meal cards
- Custom meals can be edited or deleted by the user
- Seed meals are read-only (cannot be edited or deleted)

### 2.6 Future Phases (Post-MVP)

| Feature | Description |
|---------|-------------|
| Dietary filters | Vegetarian, vegan, keto, gluten-free, etc. |
| Cuisine preferences | Italian, Asian, Mexican, etc. |
| Favorites / Saved Plans | Bookmark a generated week to reuse later |
| Shopping List | Auto-generate a consolidated grocery list from the weekly plan |
| Manual swap | Replace a meal with another from the same category |
| Calorie & macro tracking | Approximate nutrition info per meal |
| iCloud / Google Drive sync | Optional backup/restore of saved plans |
| Widgets | iOS home screen widget (via Expo Widgets or native module) |
| Apple Watch companion | Future expansion |

---

## 3. Development & Testing Setup

### 3.1 Development Environment

| Component | What You Need |
|-----------|---------------|
| **Operating System** | Windows 10/11 ✅ |
| **Code Editor** | VS Code (free) |
| **Node.js** | v18+ (free) |
| **Expo CLI** | Installed via npm (free) |
| **Expo Go app** | Install on your iPhone from the App Store (free) |
| **Physical iPhone** | Your own iPhone for live testing |
| **Mac** | **Not required** ❌ — Expo's cloud build handles iOS compilation |

### 3.2 Testing Flow (Windows → iPhone)

```
1. Write code in VS Code on Windows
2. Run: npx expo start
3. A QR code appears in the terminal
4. Open Expo Go app on iPhone
5. Scan QR code with iPhone camera
6. App loads instantly on iPhone 🔥
7. Every save → auto-reloads on iPhone
```

### 3.3 Publishing to App Store (No Mac Required)

```
1. Run: npx eas build --platform ios --auto-submit
2. Expo's cloud servers compile the iOS app
3. App is submitted to Apple App Store
4. Done — no Mac ever touched
```

### 3.4 Cost Summary for Setup

| Item | Cost |
|-----|------|
| Windows PC | ✅ Already own it |
| VS Code | **Free** |
| Node.js | **Free** |
| Expo CLI | **Free** |
| Expo Go (iPhone) | **Free** |
| EAS Build (cloud compilation) | **Free tier** — 30 builds/month |
| Apple Developer Program | **$99/year** — only when publishing to App Store |
| **Total to build & test on iPhone** | **$0** |

---

## 4. Architecture

### 4.1 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    UI Layer                           │
│  React Native Components (View, Text, FlatList, etc) │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│               State Management Layer                  │
│  React Context + useReducer   or   Zustand (simple)  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                Service / Logic Layer                  │
│  MealPlanGenerator, SeedDataService, PreferenceManager│
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│               Persistence Layer                       │
│  expo-sqlite (local .db file) + AsyncStorage          │
└──────────────────────────────────────────────────────┘
```

### 4.2 Design Patterns

| Pattern | Usage |
|---------|-------|
| **Component-Based Architecture** | Each screen is a reusable component tree |
| **Custom Hooks** | Encapsulate logic (e.g., `useMealPlan`, `useDatabase`) |
| **Repository Pattern** | `mealRepository.ts` abstracts all SQLite queries |
| **Strategy Pattern** | Generator can be swapped (simple random → balanced → ML-based) |

### 4.3 Data Flow (Generate Weekly Plan)

```
1. User reads mealsPerDay setting from AsyncStorage (e.g., 2 meals)
2. User taps "Generate Weekly Plan"
3. Component calls custom hook: useGenerateWeeklyPlan()
4. Hook calls MealPlanGenerator.generateWeeklyPlan(mealsPerDay)
5. Generator fetches ALL meals from mealRepository (no category filter)
6. Generator picks random meals for each enabled slot:
   - If 2 meals: picks 1 meal for Lunch + 1 meal for Dinner per day
   - If 3 meals: picks 1 meal for Breakfast + Lunch + Dinner per day
7. Generator ensures no repeated meals within the week
8. Generator returns DayPlan[] (7 items)
9. Hook persists DayPlan[] to SQLite
10. State updates → React re-renders the UI
```

---

## 5. Data Model

### 5.1 Key Design Decision: No Rigid Category Binding

Filipino dishes are not rigidly tied to a single meal slot. For example:
- **Adobo** can be eaten for breakfast, lunch, OR dinner
- **Sinigang** is commonly lunch or dinner, but leftovers work for breakfast
- **Tapsilog** is traditionally breakfast but some enjoy it anytime

**Solution:** The database stores dishes as independent entities. Instead of a single `category_id`:
- `suggestedFor` is a **JSON array** indicating common associations (e.g., `["breakfast", "lunch", "dinner"]`)
- The **generator** pulls from the **entire meal pool** for any meal slot
- **All 77 dishes are available** for any meal slot
- The `suggestedFor` field is informational only — it's shown in the meal detail view

### 5.2 Entity-Relationship Diagram (Conceptual)

```
MealSlot (lookup table for time-of-day)
  ├── id: number (primary key)
  ├── name: string ("Breakfast", "Lunch", "Dinner", "Snack")
  └── emoji: string? ("🌅", "☀️", "🌙", "🍿")

Meal (dish — no rigid category binding)
  ├── id: number (primary key)
  ├── name: string
  ├── suggestedFor: string (JSON array, e.g. '["breakfast","lunch","dinner"]')
  ├── cuisine: string? ("Filipino", "Italian", etc.)
  ├── dietaryTags: string (JSON array stored as text)
  ├── prepTimeMinutes: number
  ├── difficulty: string ("easy" | "medium" | "hard")
  ├── emoji: string? (meal illustration emoji)
  ├── ingredients: string (JSON array stored as text)
  ├── steps: string (JSON array stored as text)
  ├── calories: number?
  ├── isFavorite: boolean (0 or 1)
  └── isCustom: boolean (0 or 1)

DayPlan
  ├── id: number (primary key)
  ├── date: string (ISO date "2026-06-15")
  ├── weekOfYear: number
  ├── year: number
  ├── breakfastId: number (FK -> Meal.id, nullable)
  ├── lunchId: number (FK -> Meal.id, nullable)
  ├── dinnerId: number (FK -> Meal.id, nullable)
  ├── snackId: number? (FK -> Meal.id, nullable)
  └── isGenerated: boolean

SavedWeekPlan
  ├── id: number (primary key)
  ├── name: string? (user-given name)
  ├── createdAt: string (ISO datetime)
  ├── weekOfYear: number
  └── days: relationship (queried by weekOfYear)
```

### 5.3 SQLite Table Creation (SQL)

```sql
CREATE TABLE IF NOT EXISTS meal_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT
);

CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  suggested_for TEXT NOT NULL DEFAULT '["breakfast","lunch","dinner"]',
  cuisine TEXT NOT NULL DEFAULT 'Filipino',
  dietary_tags TEXT DEFAULT '[]',
  prep_time_minutes INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  emoji TEXT DEFAULT '🍽️',
  ingredients TEXT NOT NULL DEFAULT '[]',
  steps TEXT NOT NULL DEFAULT '[]',
  calories INTEGER,
  is_favorite INTEGER DEFAULT 0,
  is_custom INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS day_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  week_of_year INTEGER NOT NULL,
  year INTEGER NOT NULL,
  breakfast_id INTEGER,
  lunch_id INTEGER,
  dinner_id INTEGER,
  snack_id INTEGER,
  is_generated INTEGER DEFAULT 0,
  FOREIGN KEY (breakfast_id) REFERENCES meals(id),
  FOREIGN KEY (lunch_id) REFERENCES meals(id),
  FOREIGN KEY (dinner_id) REFERENCES meals(id),
  FOREIGN KEY (snack_id) REFERENCES meals(id)
);

CREATE TABLE IF NOT EXISTS saved_week_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  week_of_year INTEGER NOT NULL,
  year INTEGER NOT NULL
);
```

### 5.4 Seed Data

The app ships with a pre-seeded local database containing **77 Filipino dishes**:

| Category | Count | Examples |
|----------|:-----:|---------|
| Breakfast-oriented | 18 | Tapsilog, Champorado, Pandesal, Bibingka |
| Lunch/Dinner-oriented | 47 | Sinigang, Adobo, Kare-Kare, Sisig, Inihaw |
| Snack-oriented | 12 | Lumpia, Turon, Halo-Halo, Leche Flan |
| **Total** | **77** | See Appendix E for full list |

Each meal includes:
- Name, `suggestedFor` tags (JSON), cuisine
- Prep time, difficulty
- 3–8 ingredients with quantities
- 3–6 step-by-step instructions
- Approximate calories (optional)

Seed data is loaded on first app launch via a bundled JSON file, then inserted into SQLite.

---

## 6. Offline-First Approach

### 6.1 Why Offline-First?

- **No internet dependency** — works in airplane mode, remote areas, or without mobile data.
- **Instant response** — no loading spinners waiting for API calls.
- **Privacy** — all data stays on-device.
- **No server costs** — no backend to maintain, no cloud bills.

### 6.2 How It Works

| Component | Strategy |
|-----------|----------|
| **Meal Data** | Bundled as `meals.json` in the app. Imported into SQLite on first launch. |
| **Generated Plans** | Stored in SQLite locally. Persist across app restarts. |
| **User Preferences** | Stored in `AsyncStorage` (simple key-value) or SQLite (complex settings). |
| **Images** | Emoji-based (no image assets needed). Uses system emoji rendered in Text components. |
| **Backup / Sync** | Optional future feature — could add file export/import. Core functionality never requires it. |

### 6.3 First Launch Flow

```
App Launch → Check AsyncStorage flag "seed_data_loaded"
  ├── false → Load meals.json → Parse JSON → Insert into SQLite → Set flag = true
  └── true  → Proceed to main screen
```

### 6.4 App Size

- JSON meal data: ~50–100 KB (77 meals with full recipes)
- No images — emoji-only rendering
- Target app size: **< 5 MB** (extremely lightweight)

---

## 7. UI / UX Design (Final — As Implemented)

### 7.1 App Theme

| Element | Design |
|---------|--------|
| **Name** | FoodGen |
| **Icon** | 🍽️ (emoji-based for MVP, custom design later) |
| **Primary Color** | #FF6B35 (warm orange — appetising, used for buttons/active states) |
| **Secondary Color** | #2EC4B6 (teal — fresh/healthy, used for Save button) |
| **Background** | #FAFAFA (light) / #1C1C1E (dark mode support ready) |
| **Error/Delete** | #F44336 (red) |
| **Success** | #4CAF50 (green, used for easy difficulty) |
| **Warning** | #FF9800 (orange, used for medium difficulty) |
| **Typography** | System font (San Francisco on iOS, Roboto on Android) |

### 7.2 Navigation Flow (Final)

```
                    ┌─────────────┐
                    │ App Launch  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Today Screen│ ← Auto-generates on first launch
                    │  (Tab 1)    │
                    └──┬───┬───┬──┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            ▼              ▼              ▼
     ┌──────────┐  ┌──────────┐  ┌──────────────┐
     │Week Tab  │  │Meal Detail│  │Add Custom    │
     │(Tab 2)   │  │(tap card) │  │Meal (tap +)  │
     └──────────┘  └──────────┘  └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Settings (⚙️) │
                    └──────────────┘
```

### 7.3 Today Screen (Final)

```
┌──────────────────────────────────────────┐
│  ⚙️           🍽️ FoodGen              [+] │ ← Header row
├──────────────────────────────────────────┤
│  📅 Mon, Jun 15                           │ ← Current date
├──────────────────────────────────────────┤
│  [ 1 🍽️ │ 2 🍽️🍽️ │ 3 🍽️🍽️🍽️ ]  [🏷️ ON]│ ← Meals per day picker + label toggle
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐    │
│  │  🍳 BREAKFAST (if labels ON)     │    │
│  │  Tapsilog                        │    │
│  │  ⏱ 20 min  🔥 easy              │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │  ☀️ LUNCH (if labels ON)         │    │
│  │  Sinigang na Baboy               │    │
│  │  ⏱ 60 min  🔥 medium            │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │  🌙 DINNER (if labels ON)         │    │
│  │  Chicken Adobo                   │    │
│  │  ⏱ 40 min  🔥 easy  👤 You      │    │
│  └──────────────────────────────────┘    │
│                                           │
│       ↓ Pull down to regenerate          │
├──────────────────────────────────────────┤
│    📅 Today     │     📆 Week            │ ← Tab bar
└──────────────────────────────────────────┘
```

**Implemented behaviours:**
- Auto-generates today's meals on first launch (seeds 77 Filipino dishes into SQLite)
- Tap any meal card → opens **MealDetailModal** (bottom sheet)
- ⚙️ gear icon → navigates to Settings screen
- [+] button → navigates to Add Custom Meal screen
- Meals Per Day picker: segmented control with 3 options
- 🏷️ ON/OFF toggle: hides/shows "BREAKFAST", "LUNCH", "DINNER" labels
- When labels OFF: cards show just meal name + meta without slot title
- Pull down → regenerates today's meals with fresh random selection
- Users can see "👤 You" badge on custom-added meals

### 7.4 Week Screen (Final)

```
┌──────────────────────────────────────────┐
│  ⚙️        📆 Week 25                  [+]│
│        Jun 15 – Jun 21, 2026             │ ← Week number + date range
├──────────────────────────────────────────┤
│  [ 1 🍽️ │ 2 🍽️🍽️ │ 3 🍽️🍽️🍽️ ]  [🏷️ ON]│
├──────────────────────────────────────────┤
│  ┌─── Mon 15 ──────────── [↻] ──────┐   │
│  │  🌅 Tapsilog                      │   │ ← Tap to expand
│  │  🌙 Chicken Adobo                 │   │
│  └───────────────────────────────────┘   │
│  ┌─── Tue 16 ──────────── [↻] ──────┐   │
│  │  (collapsed — tap to show meals)  │   │
│  └───────────────────────────────────┘   │
│  ┌─── Wed 17 ──────────── [↻] ──────┐   │
│  │  (collapsed)                       │   │
│  └───────────────────────────────────┘   │
│  ...through Sunday                       │
│                                           │
│  [ 🔄 GENERATE NEW WEEK ]               │ ← Orange button
│  [ 💾 Save This Plan ]                   │ ← Teal button
├──────────────────────────────────────────┤
│    📅 Today     │     📆 Week            │
└──────────────────────────────────────────┘
```

**Implemented behaviours:**
- Header shows "Week 25" (ISO week number) + date range
- Mon–Sun displayed as collapsible day cards
- Tap a day → expands to show all meals for that day
- Each day card has a [↻] button to regenerate just that day
- "Generate New Week" button → confirmation dialog → regenerates all 7 days
- "Save This Plan" button → persists the current plan
- Same Meals Per Day picker + label toggle as Today tab

### 7.5 Meal Detail Modal (Final)

```
┌──────────────────────────────────────────┐
│  ─── (drag handle)                        │
├──────────────────────────────────────────┤
│           🍗 (64px emoji)                 │
│                                           │
│      Chicken Adobo                        │
│      [👤 You] (only if custom)           │
│                                           │
│  🌅 breakfast  🌙 dinner  ☀️ lunch      │ ← suggestedFor tags
│                                           │
│  ⏱ 40 min   🔥 Easy   🔥 ~480 cal       │
│                                           │
│  [▶️ Watch Recipe on YouTube]             │ ← Red button, only if youtubeLink exists
│                                           │
│  ──── Ingredients ────                   │ ← Orange section header
│  • Chicken thighs — 500g                  │
│  • Soy sauce — 1/4 cup                    │
│  • Vinegar — 1/4 cup                      │
│  • Garlic cloves — 5, crushed             │
│  • Bay leaves — 2                         │
│  • Black pepper — 1 tsp                   │
│  • Rice — 1 cup, for serving              │
│                                           │
│  ──── Steps ────                          │
│  ① Combine chicken with soy sauce,        │
│     vinegar, garlic, bay leaves,          │
│     and pepper.                           │
│  ② Marinate 30 minutes.                   │
│  ③ Bring to a boil then simmer            │
│     30 minutes.                           │
│  ④ Optional: pan-fry to brown.            │
│  ⑤ Serve over rice.                       │
│                                           │
│  [ 🌿 gluten-free ] (if has dietary tags)│
│                                           │
│  [ Close ]                                │
└──────────────────────────────────────────┘
```

**Implemented behaviours:**
- Slides up from bottom as a modal sheet
- User-uploaded photo displayed if `photoPath` exists
- YouTube button opens link via `Linking.openURL()` (free, no API needed)
- Ingredients displayed as bullet list
- Steps shown with numbered orange circle badges
- Suggested for shown as pill tags
- Difficulty color-coded: Easy=green, Medium=orange, Hard=red

### 7.6 Add Custom Meal Screen (Final — To Be Implemented)

```
┌──────────────────────────────────────────┐
│  ← Cancel     ➕ Add Meal      💾 Save   │
├──────────────────────────────────────────┤
│                                           │
│  Meal Name *                              │
│  ┌──────────────────────────────────┐    │
│  │ e.g. Pork Sisig                  │    │
│  └──────────────────────────────────┘    │
│                                           │
│  Suggested For * (check all that apply)   │
│  ☑ 🌅 Breakfast  ☑ ☀️ Lunch            │
│  ☑ 🌙 Dinner     ☐ 🍿 Snack            │
│                                           │
│  Cuisine                                  │
│  ┌──────────────────────────────────┐    │
│  │ Filipino                    ▼    │    │
│  └──────────────────────────────────┘    │
│                                           │
│  Prep Time (minutes) *                    │
│  ┌──────────────────────────────────┐    │
│  │ 30                               │    │
│  └──────────────────────────────────┘    │
│                                           │
│  Difficulty                                │
│  ○ Easy  ● Medium  ○ Hard               │
│                                           │
│  Emoji  [ 🍳 ]  Tap to change             │
│                                           │
│  Photo (optional)                         │
│  [ 📸 Take Photo ]  [ 🖼️ Choose from Gallery ]│
│                                           │
│  YouTube Link (optional)                  │
│  ┌──────────────────────────────────┐    │
│  │ https://youtube.com/watch?v=...  │    │
│  └──────────────────────────────────┘    │
│                                           │
│  Ingredients *                             │
│  ┌──────────────────────────────────┐    │
│  │  Ground pork          250g [🗑️] │    │
│  │  Egg                    1   [🗑️] │    │
│  │  [ + Add Ingredient ]            │    │
│  └──────────────────────────────────┘    │
│                                           │
│  Steps *                                   │
│  ┌──────────────────────────────────┐    │
│  │ 1. Mix all ingredients... [🗑️]  │    │
│  │ 2. Form into patties...   [🗑️]  │    │
│  │ [ + Add Step ]                   │    │
│  └──────────────────────────────────┘    │
│                                           │
│  Calories (optional)                       │
│  ┌──────────────────────────────────┐    │
│  │ 320                             │    │
│  └──────────────────────────────────┘    │
│                                           │
│  [ 🗑️ Delete this meal ] (custom only)  │
└──────────────────────────────────────────┘
```

### 7.7 Settings Screen (Final — To Be Implemented)

```
┌──────────────────────────────────────────┐
│  ← Back           ⚙️ Settings            │
├──────────────────────────────────────────┤
│                                           │
│  ──── Meals Per Day ────                 │
│                                           │
│  How many meals do you cook per day?      │
│  [  1 🍽️  │  2 🍽️🍽️  │  3 🍽️🍽️🍽️  ]  │
│                                           │
│  With 1 meal: Dinner only                 │
│  With 2 meals: Lunch + Dinner             │
│  With 3 meals: Breakfast + Lunch +        │
│                Dinner                     │
│                                           │
│  ──── Display Options ────               │
│                                           │
│  Show meal slot labels                    │
│  [🌙 Dinner, ☀️ Lunch titles]            │
│  [🟢 ON  │  🔴 OFF]                      │
│                                           │
│  (When OFF: cards show just meal name     │
│   without the slot label)                 │
│                                           │
│  ──── About ────                          │
│  Version 1.0.0                            │
│  Made with ❤️ for Filipino food 🇵🇭       │
│  Data: 77 Filipino dishes                 │
│  Framework: React Native + Expo           │
│                                           │
└──────────────────────────────────────────┘
```

### 7.8 Key UX Principles (Final)

- **Zero-config**: Open app → see today's meals immediately (auto-generated on first launch).
- **One-tap generation**: Generate week with a single prominent orange button.
- **Pull to refresh**: Swipe down to regenerate today's meals.
- **Label toggle**: Settings + quick toggle to show/hide Breakfast/Lunch/Dinner headers.
- **Week info**: Displays current week number + date range (e.g., "Week 25 - Jun 15–21").
- **Collapsible days**: Week days start collapsed; tap to expand and see meals.
- **Per-day regeneration**: Each day has its own ↻ button to regenerate just that day.
- **Confirmation dialogs**: "Generate New Week" and "Regenerate Day" show confirmations before replacing.
- **Meal Detail**: Bottom sheet modal with ingredients, steps, optional photo, optional YouTube link.
- **Custom meal badge**: User-added meals show "👤 You" badge in purple.
- **Haptic feedback**: `Haptics.impactAsync()` on generation actions.
- **Dark mode support**: Uses `useColorScheme()` from React Native.
- **Accessibility**: Proper `aria-label` / `accessible` props on all interactive elements.

---

## 8. Technology Stack & Cost Breakdown

### 8.1 Complete Tool & Cost Table

| Technology | Purpose | Cost | Notes |
|------------|---------|------|-------|
| **React Native** | Cross-platform mobile framework | **Free** | Open-source (MIT License) |
| **Expo SDK 52+** | Build system, dev tools, QR code testing on iPhone | **Free** | Managed workflow — no native build setup needed |
| **TypeScript** | Type-safe JavaScript | **Free** | Open-source |
| **expo-sqlite** | Local SQLite database (bundled in app) | **Free** | No external DB, no licence fees |
| **AsyncStorage** | Key-value storage for preferences | **Free** | Part of Expo / React Native Community |
| **React Navigation** | Tab navigation + screen routing | **Free** | MIT License |
| **React Context + useReducer** | State management (no Redux needed for MVP) | **Free** | Built into React |
| **VS Code** | Code editor | **Free** | Windows / Mac / Linux |
| **Node.js** | JavaScript runtime | **Free** | Open-source |
| **Expo Go** | Test app on iPhone via QR code | **Free** | Download from App Store |
| **EAS Build** | Cloud compilation for App Store builds | **Free tier** (30 builds/month) | No Mac needed for iOS builds |
| **Expo Application Services** | App Store submission | **Free tier** | EAS Submit included |
| **Apple Developer Program** | App Store distribution | **$99/year** (optional) | Only needed to publish — testing on your iPhone via Expo Go is **free** |

### 8.2 Cost Comparison

| Scenario | Cost |
|----------|------|
| Develop on Windows, test on iPhone (Expo Go) | **$0** |
| Use all libraries, frameworks, tools | **$0** |
| Publish to App Store (Apple Developer Program + EAS Free) | **$99/year** |
| Publish to Google Play Store | **$25 one-time** |
| Rent a Mac (alternative approach) | $20–30/month ❌ |
| Paid cloud database (alternative approach) | $10–100/month ❌ |

### 8.3 Key Questions Answered

| Question | Answer |
|----------|--------|
| **Do I need a Mac?** | **No.** Develop on Windows. Expo's cloud builds handle iOS compilation. |
| **Do I need a paid database?** | **No.** expo-sqlite stores a `.db` file on the device. No server, no cloud, no licence. |
| **Do I need a paid API?** | **No.** All meal data is bundled in a JSON file. No network calls. |
| **Do I need to pay to test on iPhone?** | **No.** The Expo Go app on your iPhone loads your app for free via QR code. |
| **Do I need to pay to publish?** | **Only for App Store** ($99/year). Google Play is $25 one-time. |

---

## 9. Project Structure

```
FoodGen/
├── app.json                          # Expo configuration
├── App.tsx                           # Root component: NavigationContainer + TabNavigator
├── babel.config.js                   # Babel preset (expo)
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
├── assets/
│   └── icon.png                      # App icon
│
├── src/
│   ├── navigation/
│   │   └── TabNavigator.tsx          # Bottom tab: Today | Week
│   │
│   ├── screens/
│   │   ├── TodayScreen.tsx           # Today tab screen
│   │   ├── WeeklyScreen.tsx          # Week tab screen
│   │   ├── MealDetailModal.tsx       # Full meal detail modal
│   │   ├── AddMealScreen.tsx         # Form to add custom meal
│   │   └── SettingsScreen.tsx        # Settings (meals per day picker, future preferences)
│   │
│   ├── components/
│   │   ├── MealCard.tsx              # Reusable meal card (emoji, name, tags)
│   │   ├── DayRow.tsx                # Single day row in Weekly view
│   │   ├── MealsPerDayPicker.tsx     # Segmented picker: 1 🍽️ / 2 🍽️🍽️ / 3 🍽️🍽️🍽️
│   │   ├── SuggestedSlotCheckboxes.tsx # Multi-select checkboxes for meal slots
│   │   ├── DietaryTag.tsx            # Pill-shaped dietary tag chip
│   │   ├── DifficultyBadge.tsx       # Easy / Medium / Hard badge
│   │   ├── PrepTimeLabel.tsx         # Clock icon + minutes
│   │   └── EmptyState.tsx            # Placeholder when no plan exists
│   │
│   ├── database/
│   │   ├── database.ts               # expo-sqlite connection + init
│   │   ├── mealRepository.ts         # CRUD: meals (no category filter)
│   │   └── planRepository.ts         # CRUD: day_plans, saved_week_plans
│   │
│   ├── services/
│   │   ├── mealPlanGenerator.ts      # Core generation algorithm (pulls from all meals)
│   │   ├── seedDataLoader.ts         # Loads meals.json → SQLite
│   │   └── preferenceManager.ts      # AsyncStorage wrapper
│   │
│   ├── hooks/
│   │   ├── useTodayPlan.ts           # Hook: today's meals logic
│   │   ├── useWeeklyPlan.ts          # Hook: weekly plan logic
│   │   ├── useDatabase.ts            # Hook: database connection
│   │   └── usePreferences.ts         # Hook: user preferences
│   │
│   ├── context/
│   │   └── MealPlanContext.tsx        # React Context for global meal state
│   │
│   ├── types/
│   │   ├── meal.ts                   # TypeScript types: Meal with suggestedFor[]
│   │   ├── plan.ts                   # TypeScript types: DayPlan with nullable meal slots
│   │   └── database.ts              # TypeScript types for DB rows
│   │
│   ├── utils/
│   │   ├── dateHelpers.ts            # Week calculation, date formatting
│   │   ├── mealHelpers.ts            # Shuffle, dedupe, random pick helpers
│   │   └── constants.ts             # App-wide constants
│   │
│   └── data/
│       └── meals.json                # Pre-seeded meal data (77 Filipino dishes)
│
├── .gitignore
└── README.md
```

---

## 10. Future Expansion

### 10.1 Phase 2 — Personalisation

- **Dietary Filters UI**: Toggle selections for vegetarian, vegan, keto, gluten-free, dairy-free, etc.
- **Cuisine Preferences**: Pick preferred cuisines to bias generation.
- **Excluded Ingredients**: User can exclude specific ingredients.

### 10.2 Phase 3 — Smart Features

- **Shopping List**: Aggregate all ingredients from a weekly plan into a single categorized list.
- **Manual Swap**: Long-press a meal → see alternatives of the same category → swap.
- **Calorie Budget**: Set daily calorie target → generator respects budget.

### 10.3 Phase 4 — Cloud & Device Ecosystem

- **iCloud / Google Drive Backup**: Export/import saved plans via file sharing.
- **Widgets**: iOS home screen widget (via Expo Widgets or native module).
- **Notifications**: Daily reminder to check today's meals.
- **Share Plans**: Share a meal plan as text/image via iOS share sheet.

### 10.4 Phase 5 — Advanced

- **Custom Meal Creation**: User can add their own meals to the local database.
- **Import from URL**: Parse meal data from a shared URL.
- **AI-Powered Generation**: Use on-device ML (TensorFlow Lite / Core ML) to generate smarter plans.

---

## Appendix

### A. Meal JSON Seed Format (Flexible Slot Assignment)

```json
[
  {
    "name": "Tapsilog",
    "suggestedFor": ["breakfast", "lunch"],
    "cuisine": "Filipino",
    "dietaryTags": [],
    "prepTimeMinutes": 20,
    "difficulty": "easy",
    "emoji": "🍳",
    "ingredients": [
      { "name": "Beef tapa", "quantity": "200g" },
      { "name": "Garlic fried rice", "quantity": "1 cup" },
      { "name": "Egg", "quantity": "1" },
      { "name": "Vinegar", "quantity": "2 tbsp" },
      { "name": "Soy sauce", "quantity": "2 tbsp" }
    ],
    "steps": [
      "Marinate beef tapa in soy sauce, vinegar, and garlic overnight.",
      "Pan-fry the beef tapa until cooked through.",
      "Make garlic fried rice by sautéing garlic and mixing with day-old rice.",
      "Fry the egg sunny-side up.",
      "Serve beef tapa, rice, and egg on a plate with vinegar dipping sauce."
    ],
    "calories": 550
  },
  {
    "name": "Chicken Adobo",
    "suggestedFor": ["breakfast", "lunch", "dinner"],
    "cuisine": "Filipino",
    "dietaryTags": ["gluten-free"],
    "prepTimeMinutes": 40,
    "difficulty": "easy",
    "emoji": "🍗",
    "ingredients": [
      { "name": "Chicken thighs", "quantity": "500g" },
      { "name": "Soy sauce", "quantity": "1/4 cup" },
      { "name": "Vinegar", "quantity": "1/4 cup" },
      { "name": "Garlic cloves", "quantity": "5, crushed" },
      { "name": "Bay leaves", "quantity": "2" },
      { "name": "Black pepper", "quantity": "1 tsp" },
      { "name": "Rice", "quantity": "1 cup, for serving" }
    ],
    "steps": [
      "Combine chicken, soy sauce, vinegar, garlic, bay leaves, and pepper in a pot.",
      "Marinate for 30 minutes (optional, for deeper flavor).",
      "Bring to a boil, then simmer for 30-35 minutes until chicken is tender.",
      "Optional: Pan-fry chicken to brown before serving.",
      "Serve over steamed rice with the adobo sauce."
    ],
    "calories": 480
  },
  {
    "name": "Lumpiang Shanghai",
    "suggestedFor": ["snack", "lunch"],
    "cuisine": "Filipino",
    "dietaryTags": [],
    "prepTimeMinutes": 30,
    "difficulty": "medium",
    "emoji": "🌯",
    "ingredients": [
      { "name": "Ground pork", "quantity": "250g" },
      { "name": "Carrot", "quantity": "1, minced" },
      { "name": "Onion", "quantity": "1, minced" },
      { "name": "Garlic cloves", "quantity": "3, minced" },
      { "name": "Lumpia wrappers", "quantity": "20 sheets" },
      { "name": "Egg", "quantity": "1, beaten" },
      { "name": "Oil", "quantity": "for deep frying" }
    ],
    "steps": [
      "Mix ground pork, carrot, onion, and garlic in a bowl.",
      "Place a spoonful of filling on a lumpia wrapper and roll tightly.",
      "Seal the edge with beaten egg.",
      "Deep fry in hot oil until golden brown and crispy.",
      "Serve with sweet chili sauce or banana ketchup."
    ],
    "calories": 320
  }
]
```

### B. Generation Algorithm (v1 — Simple Random)

1. Read `mealsPerDay` setting from AsyncStorage (default: 1)
2. Fetch **all meals** from SQLite (no category filter — every dish is eligible for every slot)
3. Determine which meal slots are active based on `mealsPerDay`:
   - 1 meal → dinner only
   - 2 meals → lunch + dinner
   - 3 meals → breakfast + lunch + dinner
4. For each day of the week:
   - For each active slot: pick 1 random meal from the pool
   - Ensure no meal is repeated across the week (de-duplicate)
   - If running out of unique meals, allow repeats with lower priority
5. Return array of `DayPlan` objects (7 items)

### C. Dependencies (package.json)

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-sqlite": "~15.0.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "expo-haptics": "~14.0.0",
    "react-native-safe-area-context": "^5.0.0",
    "react-native-screens": "^4.0.0",
    "react": "18.3.0",
    "react-native": "0.76.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "~18.3.0"
  }
}
```

### D. Quick Start Commands

```bash
# 1. Create the project
npx create-expo-app FoodGen --template blank-typescript

# 2. Install dependencies
cd FoodGen
npx expo install expo-sqlite @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-haptics

# 3. Start development server
npx expo start

# 4. Scan QR code with Expo Go on iPhone
```

### E. Comprehensive Filipino Food Master List (MVP Seed Data — 77 Dishes)

All dishes use the flexible `suggestedFor` model. The **generator can assign any dish to any meal slot**.

**Breakfast-oriented (18 dishes)**

| # | Dish | Emoji | suggestedFor | Difficulty | Prep |
|---|------|-------|-------------|-----------|:----:|
| 1 | Tapsilog (Beef Tapa + Garlic Rice + Egg) | 🍳 | breakfast, lunch | easy | 20 |
| 2 | Tosilog (Tocino + Garlic Rice + Egg) | 🥓 | breakfast, lunch | easy | 20 |
| 3 | Longsilog (Longganisa + Garlic Rice + Egg) | 🌭 | breakfast, lunch | easy | 20 |
| 4 | Dangsilog (Daing na Bangus + Garlic Rice + Egg) | 🐟 | breakfast, lunch | medium | 25 |
| 5 | Spamsilog (Spam + Garlic Rice + Egg) | 🥫 | breakfast, lunch | easy | 15 |
| 6 | Cornedsilog (Corned Beef + Garlic Rice + Egg) | 🥩 | breakfast, lunch | easy | 15 |
| 7 | Adobong Manok sa Gata (Chicken Adobo in Coconut) | 🍗 | all | medium | 45 |
| 8 | Chicken Arroz Caldo (Chicken Rice Porridge) | 🥣 | breakfast, lunch | medium | 40 |
| 9 | Goto (Beef Tripe Porridge) | 🥣 | breakfast, lunch | hard | 90 |
| 10 | Champorado (Chocolate Rice Porridge) | 🍫 | breakfast, snack | easy | 20 |
| 11 | Pandesal (Filipino Bread Rolls) | 🥖 | breakfast, snack | medium | 120 |
| 12 | Pan de Coco (Coconut Bread) | 🥥 | breakfast, snack | medium | 120 |
| 13 | Ensaymada (Buttered Sugar Buns) | 🧈 | breakfast, snack | medium | 120 |
| 14 | Bibingka (Rice Cake) | 🍚 | breakfast, snack | medium | 45 |
| 15 | Puto (Steamed Rice Cakes) | 🍥 | breakfast, snack | easy | 30 |
| 16 | Biko (Sticky Rice Cake with Coconut) | 🍚 | breakfast, snack | easy | 40 |
| 17 | Suman (Sticky Rice Wrapped in Banana Leaf) | 🍃 | breakfast, snack | medium | 60 |
| 18 | Tortang Giniling (Filipino Omelette with Minced Meat) | 🥚 | all | easy | 20 |

**Lunch/Dinner-oriented (47 dishes)**

| # | Dish | Emoji | suggestedFor | Difficulty | Prep |
|---|------|-------|-------------|-----------|:----:|
| 1 | Sinigang na Baboy (Pork Sour Soup) | 🥘 | lunch, dinner | medium | 60 |
| 2 | Sinigang na Hipon (Shrimp Sour Soup) | 🥘 | lunch, dinner | medium | 40 |
| 3 | Sinigang na Bangus (Milkfish Sour Soup) | 🥘 | lunch, dinner | medium | 45 |
| 4 | Nilagang Baka (Beef Stew) | 🥩 | lunch, dinner | medium | 90 |
| 5 | Bulalo (Beef Marrow Stew) | 🦴 | lunch, dinner | hard | 120 |
| 6 | Tinola (Chicken Ginger Soup) | 🍲 | lunch, dinner | easy | 40 |
| 7 | Paksiw na Lechon (Roast Pork Stew) | 🥘 | lunch, dinner | medium | 45 |
| 8 | Paksiw na Isda (Fish in Vinegar) | 🐟 | lunch, dinner | easy | 25 |
| 9 | Kare-Kare (Oxtail Peanut Stew) | 🥜 | lunch, dinner | hard | 120 |
| 10 | Bicol Express (Pork in Coconut + Chili) | 🌶️ | lunch, dinner | medium | 40 |
| 11 | Laing (Taro Leaves in Coconut Milk) | 🍃 | lunch, dinner | medium | 45 |
| 12 | Caldereta (Beef Stew in Tomato Sauce) | 🥩 | lunch, dinner | medium | 90 |
| 13 | Mechado (Beef Larded Stew) | 🥩 | lunch, dinner | medium | 90 |
| 14 | Menudo (Pork Liver Stew) | 🥘 | lunch, dinner | medium | 60 |
| 15 | Afritada (Chicken Tomato Stew) | 🍗 | lunch, dinner | medium | 50 |
| 16 | Pinakbet (Mixed Vegetable Stew) | 🥬 | lunch, dinner | easy | 30 |
| 17 | Dinengdeng (Vegetable Soup with Fish) | 🥬 | lunch, dinner | easy | 30 |
| 18 | Ginisang Monggo (Mung Bean Soup) | 🫘 | lunch, dinner | easy | 40 |
| 19 | Lumpiang Sariwa (Fresh Spring Roll) | 🥟 | lunch, snack | medium | 45 |
| 20 | Pancit Canton (Stir-Fried Noodles) | 🍜 | all | medium | 30 |
| 21 | Pancit Bihon (Rice Noodles) | 🍜 | all | medium | 30 |
| 22 | Pancit Malabon (Thick Noodles in Seafood Sauce) | 🍜 | lunch, dinner | hard | 45 |
| 23 | Chicken Adobo | 🍗 | all | easy | 40 |
| 24 | Pork Adobo | 🥩 | all | easy | 45 |
| 25 | Adobong Puti (White Adobo - no soy sauce) | 🥩 | all | easy | 40 |
| 26 | Adobong Pusit (Squid Adobo) | 🦑 | lunch, dinner | medium | 30 |
| 27 | Lechon Kawali (Crispy Fried Pork Belly) | 🥓 | all | medium | 60 |
| 28 | Crispy Pata (Crispy Pork Leg) | 🦵 | lunch, dinner | hard | 120 |
| 29 | Chicharon Bulaklak (Crispy Pork Ruffles) | 🥓 | snack, dinner | medium | 45 |
| 30 | Sisig (Sizzling Chopped Pork) | 🍳 | all | medium | 40 |
| 31 | Inihaw na Liempo (Grilled Pork Belly) | 🥩 | all | medium | 50 |
| 32 | Inihaw na Manok (Grilled Chicken) | 🍗 | all | medium | 60 |
| 33 | Inihaw na Bangus (Grilled Milkfish) | 🐟 | lunch, dinner | medium | 40 |
| 34 | Inihaw na Pusit (Grilled Squid) | 🦑 | lunch, dinner | easy | 25 |
| 35 | Daing na Bangus (Marinated Fried Milkfish) | 🐟 | all | medium | 30 |
| 36 | Daing na Bisugo (Marinated Fried Threadfin) | 🐟 | all | medium | 30 |
| 37 | Tortang Talong (Eggplant Omelette) | 🥚 | all | easy | 20 |
| 38 | Relyenong Bangus (Stuffed Milkfish) | 🐟 | lunch, dinner | hard | 90 |
| 39 | Embutido (Filipino Meatloaf) | 🥩 | all | medium | 60 |
| 40 | Morcon (Beef Roulade) | 🥩 | lunch, dinner | hard | 90 |
| 41 | Fish Kinilaw (Ceviche) | 🐟 | lunch, snack | easy | 20 |
| 42 | Kinilaw na Tanigue (Mackerel Ceviche) | 🐟 | lunch, snack | easy | 20 |
| 43 | Dinuguan (Pork Blood Stew) | 🥘 | lunch, dinner | medium | 50 |
| 44 | Batchoy (Noodle Soup with Offal) | 🍜 | lunch, dinner | medium | 45 |
| 45 | Pares (Beef Rice Porridge + Stew) | 🥩 | all | medium | 90 |
| 46 | Beef Kansi (Beef Bone Marrow Soup) | 🥩 | lunch, dinner | hard | 120 |
| 47 | Fried Chicken (Filipino-style) | 🍗 | all | easy | 35 |

**Snack-oriented (12 dishes)**

| # | Dish | Emoji | suggestedFor | Difficulty | Prep |
|---|------|-------|-------------|-----------|:----:|
| 1 | Lumpiang Shanghai (Fried Spring Rolls) | 🌯 | snack, lunch | medium | 30 |
| 2 | Turon (Banana Spring Roll) | 🍌 | snack, breakfast | easy | 15 |
| 3 | Maruya (Banana Fritters) | 🍌 | snack, breakfast | easy | 15 |
| 4 | Camote Q (Candied Sweet Potato) | 🍠 | snack | easy | 15 |
| 5 | Banana Cue (Caramelised Banana Skewer) | 🍌 | snack | easy | 15 |
| 6 | Ginataang Bilo-Bilo (Sticky Rice Balls in Coconut) | 🥥 | snack, breakfast | easy | 30 |
| 7 | Ginataang Halo-Halo (Mixed Fruits in Coconut) | 🥥 | snack | easy | 20 |
| 8 | Halo-Halo (Shaved Ice Dessert) | 🍨 | snack | easy | 10 |
| 9 | Leche Flan (Custard Caramel) | 🍮 | snack, dessert | medium | 60 |
| 10 | Ube Halaya (Purple Yam Jam) | 🟣 | snack, breakfast | medium | 45 |
| 11 | Puto Bumbong (Purple Rice Cake) | 🟣 | snack, breakfast | hard | 60 |
| 12 | Sapin-Sapin (Layered Rice Cake) | 🟣 | snack, breakfast | medium | 50 |

**Total: 77 dishes** ✅ — All available for any assigned meal slot.

---

*Document version 4.0 — June 2026 (Flexible meal slot assignment, 77 Filipino dishes)*