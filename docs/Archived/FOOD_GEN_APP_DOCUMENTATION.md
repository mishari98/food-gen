# FoodGen — Web App Documentation (v2.0)

## Table of Contents

1. [Concept Overview](#1-concept-overview)
2. [Core Features](#2-core-features)
3. [Development & Testing Setup](#3-development--testing-setup)
4. [Architecture](#4-architecture)
5. [Data Model](#5-data-model)
6. [Real-Time Sync & Offline Support](#6-real-time-sync--offline-support)
7. [UI / UX Design](#7-ui--ux-design)
8. [Technology Stack & Cost Breakdown](#8-technology-stack--cost-breakdown)
9. [Project Structure](#9-project-structure)
10. [Future Expansion](#10-future-expansion)

---

## 1. Concept Overview

**FoodGen** is a **web application** built with **React + TypeScript + Vite** that helps households generate weekly and daily meal plans with real-time cloud sync. All food data, recipes, and user preferences are stored in **Firebase Firestore** with offline support via IndexedDB.

### Cuisine Focus: Filipino 🇵🇭

- **Phase 1 (MVP)** exclusively features **Filipino cuisine** — adobo, sinigang, kare-kare, lumpia, tapsilog, and many more.
- All **77 seed meals** in the MVP are Filipino dishes.
- **Future phases** will expand to other cuisines (Italian, Asian, Mexican, etc.) with cuisine filtering and mixing options.
- The architecture supports multiple cuisines from day one — the `cuisine` field in the data model is already in place.

### Why Web (React + Vite + Firebase)?

| Reason | Detail |
|--------|--------|
| **Develop on Windows** | Use VS Code on your Windows machine — no Mac required |
| **Test on iPhone for free** | Deploy to Firebase Hosting → access via browser on any device |
| **Publish to App Store** | Can wrap with Capacitor/Cordova later if needed |
| **Real-time sync** | Firestore provides instant cross-device sync |
| **Offline support** | IndexedDB persistence + Firestore offline mode |
| **All tools free** | No paid licences, no subscriptions, generous free tiers |

### Core Premise

- The user opens the app and gets an instant meal plan — for **today** or for the **full week**.
- Sign-up required (email/password) — cloud sync enabled by default.
- The generated plan is based on a pre-seeded Firestore database of meals with flexible slot assignment (any dish can be assigned to any meal slot).
- **Household-based**: Users can create/join households for family meal planning.

### Target Platforms (Phase 1)

| Platform | Supported? | How |
|----------|-----------|------|
| **iPhone** (iOS 15+) | ✅ **Yes** | Via mobile browser (Safari) — PWA-ready |
| **iPad** (iPadOS 15+) | ✅ Yes | Same web app, responsive design |
| **Android** | ✅ Yes | Works in any modern mobile browser |
| **Desktop** | ✅ Yes | Full desktop browser support |
| **macOS** | ✅ Yes | Full desktop browser support |

---

## 2. Core Features

### 2.1 MVP (Phase 1)

| Feature | Description | Status |
|---------|-------------|--------|
| **Generate Today's Meals** | One tap to see meals for the current day | ✅ Implemented |
| **Generate Weekly Plan** | Generate a full 7-day meal plan (Mon–Sun) | ✅ Implemented |
| **Configurable Meals Per Day** | Choose **1**, **2**, **3**, or **4** meals per day | ✅ Implemented |
| **View Meal Details** | Tap any meal card to see ingredients, prep time, difficulty, and step-by-step instructions | ✅ Implemented |
| **Add Custom Meal** | User can manually add their own meal if it's not in the default list | ✅ Implemented |
| **Cloud Data Store** | All meals, recipes, and generated plans synced via **Firebase Firestore** | ✅ Implemented |
| **Random & Balanced Generation** | Algorithm ensures variety across the week — no repeated meals within the same plan | ✅ Implemented |
| **Per-Day Customisation** | Random-generate the whole week/today, then customise individual days | ✅ Implemented |
| **Meal Status Tracking** | Mark meals as Planned / Cooking / Done / Skipped | ✅ Implemented |
| **Real-time Sync** | Changes sync instantly across all household members | ✅ Implemented |
| **Activity Logging** | Track all household actions (generation, edits, member changes) | ✅ Implemented |
| **Invite Code History** | Track all invite codes (active/inactive) for household | ✅ Implemented |
| **Viewer Suggestions** | Viewers can suggest meal swaps for admin/editor approval | ✅ Implemented |
| **Email/Password Recovery** | "Forgot Password?" flow with Firebase email reset | ✅ Implemented |

### 2.2 Meals Per Day Configuration

| Setting | Meals Generated | Default For |
|---------|----------------|-------------|
| **1 meal/day** 🍽️ | Dinner only | Default setting |
| **2 meals/day** 🍽️🍽️ | Lunch + Dinner | Optional |
| **3 meals/day** 🍽️🍽️🍽️ | Breakfast + Lunch + Dinner | Optional |
| **4 meals/day** 🍽️🍽️🍽️🍽️ | Breakfast + Lunch + Dinner + Snack | Optional |

**How it works:**

- The setting is stored in **Firestore** (`userPreferences` collection).
- It applies to **both Today and Weekly** generation.
- The generator picks random dishes from the **entire meal pool** (all 77 dishes) for each meal slot.
- The generator skips meal slots that are not selected (e.g., if set to 1 meal, only Dinner is generated).
- On the **Today** and **Week** screens, only the configured meal slots are displayed.

### 2.3 Household System

| Feature | Description | Status |
|---------|-------------|--------|
| **Create Household** | Admin creates a household with name, address, max members | ✅ Implemented |
| **Join via Invite Code** | 8-character code (e.g., "ABC123XY") | ✅ Implemented |
| **Join Request System** | Users request to join; admin approves/rejects | ✅ Implemented |
| **Role-based Access** | Admin (full), Editor (plan meals), Viewer (view only) | ✅ Implemented |
| **Invite Code History** | Track all generated codes with active/inactive status | ✅ Implemented |
| **Real-time Members** | Live member list with role badges | ✅ Implemented |

### 2.4 Meal Suggestions (Viewer Feature)

| Feature | Description | Status |
|---------|-------------|--------|
| **Suggest Swap** | Viewers can suggest replacing a meal with another | ✅ Implemented |
| **Approval UI** | Admin/Editor sees pending suggestions with approve/reject | ✅ Implemented |
| **Activity Logging** | Suggestions logged in household activity feed | ✅ Implemented |

### 2.5 Activity Log

| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time Feed** | Live activity log for household | ✅ Implemented |
| **Action Types** | created, regenerated, manual_edit, status_updated, suggestion_applied | ✅ Implemented |
| **User Attribution** | Shows who performed each action | ✅ Implemented |

### 2.6 Future Phases (Post-MVP)

| Feature | Description |
|---------|-------------|
| Dietary filters | Vegetarian, vegan, keto, gluten-free, etc. |
| Cuisine preferences | Italian, Asian, Mexican, etc. |
| Favorites / Saved Plans | Bookmark a generated week to reuse later |
| Shopping List | Auto-generate a consolidated grocery list from the weekly plan |
| Calorie & macro tracking | Approximate nutrition info per meal |
| PWA Install | Add to home screen on mobile devices |
| Push Notifications | Daily meal reminders |
| Export Plans | PDF/image export of meal plans |

---

## 3. Development & Testing Setup

### 3.1 Development Environment

| Component | What You Need |
|-----------|---------------|
| **Operating System** | Windows 10/11 ✅ |
| **Code Editor** | VS Code (free) |
| **Node.js** | v18+ (free) |
| **Firebase Project** | Created by user (free tier) |
| **Browser** | Chrome/Firefox/Edge for testing |
| **Physical iPhone** | Your own iPhone for mobile testing (optional) |
| **Mac** | **Not required** ❌ |

### 3.2 Testing Flow (Windows → iPhone)

```
1. Write code in VS Code on Windows
2. Run: npm run dev
3. Local dev server starts on localhost:5173
4. Access from iPhone via local network IP (e.g., http://192.168.1.100:5173)
5. OR deploy to Firebase Hosting: npm run deploy
6. Access via https://foodgen-85dbb.web.app on any device
7. Every save → hot reload in browser
```

### 3.3 Deployment

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
npm run deploy
```

### 3.4 Cost Summary for Setup

| Item | Cost |
|-----|------|
| Windows PC | ✅ Already own it |
| VS Code | **Free** |
| Node.js | **Free** |
| Firebase (Spark Plan) | **Free** (generous limits for MVP) |
| Firebase Hosting | **Free** (10 GB storage, 10 GB/month transfer) |
| Firebase Auth | **Free** (unlimited email/password) |
| Firebase Firestore | **Free** (1 GB storage, 50K reads/day) |
| **Total to build & test** | **$0** |

---

## 4. Architecture

### 4.1 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    UI Layer                           │
│  React Components (Vite + TypeScript)                │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│               State Management Layer                  │
│  React Context + useReducer (MealPlanContext)         │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                Service / Logic Layer                  │
│  MealPlanGenerator, ActivityLogger, PreferenceManager│
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│               Firebase Layer                          │
│  Firestore (cloud DB) + Auth + Hosting               │
│  + IndexedDB (offline cache)                         │
└──────────────────────────────────────────────────────┘
```

### 4.2 Design Patterns

| Pattern | Usage |
|---------|-------|
| **Component-Based Architecture** | Each screen is a reusable component tree |
| **Context API** | `MealPlanContext` provides global state |
| **Custom Hooks** | Encapsulate logic (e.g., `useMealPlan`) |
| **Repository Pattern** | Firestore service abstracts all DB queries |
| **Real-time Listeners** | `onSnapshot` for live data sync |

### 4.3 Data Flow (Generate Weekly Plan)

```
1. User taps "Generate Week" on Week tab
2. Component calls context: generateWeekPlan(weekOfYear, year, mealCount)
3. Context fetches all meals from Firestore (reference + custom)
4. Generator picks random meals for each enabled slot:
   - If 2 meals: picks 1 meal for Lunch + 1 meal for Dinner per day
   - If 3 meals: picks 1 meal for Breakfast + Lunch + Dinner per day
5. Generator ensures no repeated meals within the week
6. Context saves DayPlan[] to Firestore (one doc per day)
7. Real-time listener updates UI instantly
8. Activity log entry created
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

### 5.2 Firestore Collections

```
users/{uid}/
  ├── profile/main (UserProfile)
  ├── preferences/main (UserPreferences)
  └── customMeals/{mealId} (Meal)

households/{householdId}/
  ├── info (Household)
  ├── members/{uid} (HouseholdMember)
  ├── joinRequests/{uid} (JoinRequest)
  ├── invites/{inviteId} (HouseholdInvite)
  ├── inviteCodes/{codeId} (InviteCodeRecord)
  ├── plans/{date} (HouseholdDayPlan)
  ├── suggestions/{suggestionId} (MealSuggestion)
  └── activityLog/{logId} (ActivityLogEntry)

referenceMeals/{mealId} (Meal) — shared across all users
```

### 5.3 Key Types

```typescript
interface Meal {
  id: number;
  name: string;
  suggestedFor: string[]; // ["breakfast","lunch","dinner"]
  cuisine: string;
  dietaryTags: string[];
  prepTimeMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  emoji: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  calories?: number;
  isCustom?: 0 | 1;
}

interface HouseholdDayPlan {
  date: string; // ISO date "2026-06-15"
  weekOfYear: number;
  year: number;
  meals: {
    mealId: number;
    label?: string;
    status: "planned" | "in_progress" | "completed" | "skipped";
  }[];
  isGenerated: 0 | 1;
  createdBy: string;
  lastModifiedBy: string;
}

interface Household {
  id: string;
  name: string;
  address: { city: string; state: string };
  inviteCode: string;
  codeExpiresAt: string;
  maxMembers: number;
  weekStartDay: "monday" | "sunday";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityLogEntry {
  date: string;
  action: "created" | "regenerated" | "manual_edit" | "status_updated" | "suggestion_applied" | "suggestion_rejected";
  performedBy: string;
  displayName: string;
  details?: string;
  createdAt: Timestamp;
}

interface MealSuggestion {
  date: string;
  mealIndex: number;
  currentMealId: number;
  suggestedMealId: number;
  suggestedBy: string;
  displayName: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  respondedBy?: string;
  respondedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5.4 Seed Data

The app ships with a pre-seeded Firestore collection containing **77 Filipino dishes**:

| Category | Count | Examples |
|----------|:-----:|---------|
| Breakfast-oriented | 18 | Tapsilog, Champorado, Pandesal, Bibingka |
| Lunch/Dinner-oriented | 47 | Sinigang, Adobo, Kare-Kare, Sisig, Inihaw |
| Snack-oriented | 12 | Lumpia, Turon, Halo-Halo, Leche Flan |
| **Total** | **77** | See Appendix E for full list |

Each meal includes:
- Name, `suggestedFor` tags (JSON array), cuisine
- Prep time, difficulty
- 3–8 ingredients with quantities
- 3–6 step-by-step instructions
- Approximate calories (optional)

---

## 6. Real-Time Sync & Offline Support

### 6.1 How It Works

| Component | Strategy |
|-----------|----------|
| **Meal Data** | Stored in Firestore `referenceMeals` collection. Cached locally. |
| **Generated Plans** | Stored in Firestore `households/{id}/plans/{date}`. Real-time sync. |
| **User Preferences** | Stored in Firestore `users/{uid}/preferences/main`. |
| **Custom Meals** | Stored in Firestore `users/{uid}/customMeals/{mealId}`. |
| **Offline Support** | Firestore SDK + IndexedDB persistence. Works offline, syncs when online. |
| **Real-time Updates** | `onSnapshot` listeners for instant cross-device sync. |

### 6.2 Offline Flow

```
1. App loads → Firestore checks IndexedDB cache
2. If offline → serves from cache immediately
3. If online → fetches latest from cloud, updates cache
4. User makes changes → saved to IndexedDB immediately
5. When online → Firestore syncs changes to cloud
6. Other devices receive updates via real-time listeners
```

---

## 7. UI / UX Design

### 7.1 App Theme

| Element | Design |
|---------|--------|
| **Name** | FoodGen |
| **Icon** | 🍽️ (emoji-based) |
| **Primary Color** | #FF6B35 (warm orange — appetising) |
| **Secondary Color** | #2EC4B6 (teal — fresh/healthy) |
| **Background** | #FAFAFA (light) |
| **Error/Delete** | #F44336 (red) |
| **Success** | #4CAF50 (green) |
| **Typography** | System font (San Francisco on iOS, Roboto on Android) |

### 7.2 Navigation Flow

```
                    ┌─────────────┐
                    │ App Launch  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Onboarding  │ ← Login / Sign Up / Forgot Password
                    │  (Auth)     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Dashboard  │ ← Create/Join Household
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │   Day    │  │   Week   │  │  History │
     │   Tab    │  │   Tab    │  │   Tab    │
     └──────────┘  └──────────┘  └──────────┘
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │Settings  │  │Household │  │Debug     │
     │  Page    │  │ Manage   │  │ Page     │
     └──────────┘  └──────────┘  └──────────┘
```

### 7.3 Day Screen

```
┌──────────────────────────────────────────┐
│  🏠           🍽️ FoodGen              ⚙️ │ ← Header
├──────────────────────────────────────────┤
│  📅 [Date Picker]  [📍 Today]           │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐    │
│  │  🍳 BREAKFAST                    │    │
│  │  Tapsilog                        │    │
│  │  ⏱ 20 min  🔥 easy              │    │
│  │  [🔄 Swap] [✕ Remove]           │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │  ☀️ LUNCH                        │    │
│  │  Sinigang na Baboy               │    │
│  │  ⏱ 60 min  🔥 medium            │    │
│  │  [🔄 Swap] [✕ Remove]           │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │  🌙 DINNER                       │    │
│  │  Chicken Adobo                   │    │
│  │  ⏱ 40 min  🔥 easy  👤 You      │    │
│  │  [🔄 Swap] [✕ Remove]           │    │
│  └──────────────────────────────────┘    │
│                                           │
│  [ 📬 Pending Suggestions (2) ]         │ ← If any
│                                           │
│  [ 🔄 Regenerate ]  [ ➕ Add Meal ]      │
├──────────────────────────────────────────┤
│    📅 Day     │     📆 Week │ 📋 History│ ← Tab bar
└──────────────────────────────────────────┘
```

### 7.4 Household Management Screen

```
┌──────────────────────────────────────────┐
│  ← Back           ⚙️ Manage Household   │
├──────────────────────────────────────────┤
│  🏠 Household Name                       │
│  📍 City, State                          │
│  👥 3 / 5 members                        │
│  📅 Week starts on monday                │
│  🔗 Invite Code: ABC123XY                │
├──────────────────────────────────────────┤
│  Members                                 │
│  👤 Juan Dela Cruz [admin]               │
│  👤 Maria Santos [editor]                │
│  👤 Jose Rizal [viewer]                  │
├──────────────────────────────────────────┤
│  Pending Requests (if admin)             │
│  👤 Pedro Penduko [editor] [Accept][Reject]│
├──────────────────────────────────────────┤
│  Invite Member                           │
│  Email: [member@example.com]             │
│  Role: [Viewer (view only) ▼]            │
│  [ Send Invite ]                         │
├──────────────────────────────────────────┤
│  📋 Recent Activity                      │
│  • Juan generated 3 meals for 2026-06-15 │
│  • Maria suggested a swap for 2026-06-15 │
│  • Jose joined the household             │
├──────────────────────────────────────────┤
│  🔗 Invite Code History                  │
│  ABC123XY [Active] Generated: 6/15/2026  │
│  XYZ789AB [Inactive] Generated: 6/8/2026 │
├──────────────────────────────────────────┤
│  [ 🔄 Regenerate Invite Code ]           │
│  [ 🚪 Leave Household ]                  │
└──────────────────────────────────────────┘
```

---

## 8. Technology Stack & Cost Breakdown

### 8.1 Complete Tool & Cost Table

| Technology | Purpose | Cost | Notes |
|------------|---------|------|-------|
| **React 18** | UI framework | **Free** | Open-source (MIT) |
| **TypeScript** | Type-safe JavaScript | **Free** | Open-source |
| **Vite** | Build tool + dev server | **Free** | Open-source |
| **Firebase Auth** | Email/password authentication | **Free** | Unlimited email/password on Spark plan |
| **Firebase Firestore** | Cloud database + real-time sync | **Free** | 1 GB storage, 50K reads/day |
| **Firebase Hosting** | Web hosting + SSL | **Free** | 10 GB storage, 10 GB/month transfer |
| **React Router** | Client-side routing | **Free** | MIT License |
| **React Context** | State management | **Free** | Built into React |
| **VS Code** | Code editor | **Free** | Windows / Mac / Linux |
| **Node.js** | JavaScript runtime | **Free** | Open-source |

### 8.2 Cost Comparison

| Scenario | Cost |
|----------|------|
| Develop on Windows, test in browser | **$0** |
| Use all libraries, frameworks, tools | **$0** |
| Deploy to Firebase Hosting | **$0** (within free tier) |
| Scale to 1000 users | **$0–25/month** (still within free tier) |
| Paid cloud database (alternative) | $10–100/month ❌ |

### 8.3 Key Questions Answered

| Question | Answer |
|----------|--------|
| **Do I need a Mac?** | **No.** Develop on Windows. Deploy to Firebase Hosting. |
| **Do I need a paid database?** | **No.** Firestore free tier is generous for MVP. |
| **Do I need to pay to test on iPhone?** | **No.** Access via mobile browser or deploy to Firebase Hosting. |
| **Do I need to pay to publish?** | **No.** Firebase Hosting is free. Can add custom domain later. |

---

## 9. Project Structure

```
FoodGenWeb/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── firebase.json
├── .firebaserc
│
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Router + route protection
│   ├── App.css                     # Global styles
│   │
│   ├── components/
│   │   ├── MealCard.tsx            # Reusable meal card
│   │   ├── MealsPerDayPicker.tsx   # Segmented picker: 1-4 meals
│   │   ├── EmptyState.tsx          # Placeholder when no plan
│   │   ├── LoadingSpinner.tsx      # Loading indicator
│   │   └── MealDetailModal.tsx     # Full meal detail modal
│   │
│   ├── pages/
│   │   ├── OnboardingPage.tsx      # Login / Sign Up / Forgot Password
│   │   ├── HouseholdDashboard.tsx  # Create/Join household
│   │   ├── DayPage.tsx             # Day tab
│   │   ├── WeekPage.tsx            # Week tab
│   │   ├── HistoryPage.tsx         # History tab
│   │   ├── AddMealPage.tsx         # Add custom meal
│   │   ├── SettingsPage.tsx        # Settings
│   │   └── HouseholdManagementPage.tsx # Manage household
│   │
│   ├── context/
│   │   └── MealPlanContext.tsx      # Global state (auth, plans, sync)
│   │
│   ├── services/
│   │   ├── mealPlanGenerator.ts     # Core generation algorithm
│   │   ├── activityLogger.ts        # Activity log service
│   │   └── preferenceManager.ts     # User preferences
│   │
│   ├── firebase/
│   │   ├── config.ts                # Firebase initialization
│   │   ├── auth.ts                  # Auth functions
│   │   └── firestore.ts             # Firestore CRUD + listeners
│   │
│   ├── types/
│   │   └── meal.ts                  # TypeScript interfaces
│   │
│   └── utils/
│       ├── dateHelpers.ts           # Date formatting, week calc
│       └── constants.ts             # App-wide constants
│
└── public/
    └── meals.json                   # 77 Filipino dishes (seed data)
```

---

## 10. Future Expansion

### 10.1 Phase 2 — Personalisation

- **Dietary Filters UI**: Toggle selections for vegetarian, vegan, keto, gluten-free, dairy-free, etc.
- **Cuisine Preferences**: Pick preferred cuisines to bias generation.
- **Excluded Ingredients**: User can exclude specific ingredients.

### 10.2 Phase 3 — Smart Features

- **Shopping List**: Aggregate all ingredients from a weekly plan into a single categorized list.
- **Calorie Budget**: Set daily calorie target → generator respects budget.
- **Meal Ratings**: Rate meals after cooking → improve suggestions.

### 10.4 Phase 4 — PWA & Mobile

- **PWA Install**: Add to home screen on mobile devices.
- **Push Notifications**: Daily meal reminders.
- **Share Plans**: Share a meal plan as text/image via native share sheet.
- **Capacitor Wrapper**: Package as native iOS/Android app if needed.

### 10.5 Phase 5 — Advanced

- **Import from URL**: Parse meal data from a shared URL.
- **AI-Powered Generation**: Use on-device ML to generate smarter plans.
- **Meal Planning Assistant**: Chat-based interface for custom requests.

---

## Appendix

### A. Meal JSON Seed Format

```json
[
  {
    "id": 1,
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
      { "name": "Egg", "quantity": "1" }
    ],
    "steps": [
      "Marinate beef tapa in soy sauce, vinegar, and garlic overnight.",
      "Pan-fry the beef tapa until cooked through.",
      "Serve with garlic fried rice and egg."
    ],
    "calories": 550
  }
]
```

### B. Generation Algorithm (v1 — Simple Random)

1. Read `mealsPerDay` setting from Firestore (default: 1)
2. Fetch **all meals** from Firestore (no category filter — every dish is eligible for every slot)
3. Determine which meal slots are active based on `mealsPerDay`:
   - 1 meal → dinner only
   - 2 meals → lunch + dinner
   - 3 meals → breakfast + lunch + dinner
   - 4 meals → breakfast + lunch + dinner + snack
4. For each day of the week:
   - For each active slot: pick 1 random meal from the pool
   - Ensure no meal is repeated across the week (de-duplicate)
   - If running out of unique meals, allow repeats with lower priority
5. Return array of `DayPlan` objects (7 items)
6. Save to Firestore and log activity

### C. Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^7.0.0",
    "firebase": "^11.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@types/react": "^18.3.0"
  }
}
```

### D. Quick Start Commands

```bash
# 1. Clone the repo
git clone https://github.com/mishari98/food-gen.git
cd FoodGenWeb

# 2. Install dependencies
npm install

# 3. Configure Firebase
# Copy .env.example to .env and fill in your Firebase config

# 4. Start development server
npm run dev

# 5. Build for production
npm run build

# 6. Deploy to Firebase Hosting
npm run deploy
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

*Document version 2.0 — June 2026 (Web app with Firebase, real-time sync, household features)*