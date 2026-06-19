# FoodGen Web — Vite + React + TypeScript Documentation

## Table of Contents

1. [Concept Overview](#1-concept-overview)
2. [Core Features](#2-core-features)
3. [Web vs Native: Key Differences](#3-web-vs-native-key-differences)
4. [Technology Stack](#4-technology-stack)
5. [Architecture: Hybrid Offline + Cloud Sync](#5-architecture-hybrid-offline--cloud-sync)
6. [Firebase Integration](#6-firebase-integration)
7. [Data Model](#7-data-model)
8. [Database Layer: IndexedDB + Firestore](#8-database-layer-indexeddb--firestore)
9. [UI / UX Design](#9-ui--ux-design)
10. [Navigation & Route Design](#10-navigation--route-design)
11. [Project Structure](#11-project-structure)
12. [State Management](#12-state-management)
13. [Firebase Setup Guide](#13-firebase-setup-guide)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Deployment Strategy](#15-deployment-strategy)
16. [Cost Breakdown](#16-cost-breakdown)
17. [Future Expansion](#17-future-expansion)

---

## 1. Concept Overview

**FoodGen Web** is a browser-based meal planning app focused on **Filipino cuisine** that generates daily and weekly meal plans. It works across all devices — iPhone, iPad, Android, desktop — with **seamless cloud sync via Firebase** at **$0 cost**.

### Key Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Cross-Device Sync** | Meal plans sync automatically across all devices via Firebase Firestore |
| **Offline-First** | IndexedDB caches data locally — works offline, syncs when online |
| **User-Controlled Generation** | No auto-generation — user chooses when and what to generate |
| **Flexible Meal Planning** | Pick any date or week, configure meals per day and week start day |
| **Responsive Design** | Optimised for iPhone, adapts to tablet and desktop |
| **Zero Server Cost** | Firebase free tier covers personal use indefinitely |

---

## 2. Core Features

### 2.1 MVP Feature Set

| Feature | Description |
|---------|-------------|
| **Generate Meals for Any Day** | Pick a date (today or future), generate random meals, view existing plans |
| **Generate Meals for Any Week** | Pick any week, generate 7-day plan, view existing plans |
| **Configurable Meals Per Day** | 1🍽️ / 2🍽️🍽️ / 3🍽️🍽️🍽️ — simple picker, no slot labels |
| **Configurable Week Start Day** | Monday or Sunday — stored in preferences |
| **View Meal Details** | Tap any meal to see ingredients, steps, difficulty, prep time |
| **Add Custom Meal** | Full form with dynamic ingredient/step lists, saves to database |
| **Custom Meal Badge** | 👤 "You" badge on user-added meals |
| **Meal Plan Confirmation Dialogs** | "Are you sure?" before replacing an existing plan |
| **Cross-Device Sync** | Login once → plans sync across all devices automatically |
| **History Tab** | Browse all past finalized plans, view or regenerate |
| **Onboarding** | First-visit welcome screen (name required before using app) |

### 2.2 Web-Specific Features

| Feature | Description |
|---------|-------------|
| **Responsive Layout** | Adapts from iPhone-sized (375px) to tablet/desktop |
| **PWA Capable** | Installable on iPhone home screen via Safari |
| **Touch & Mouse Input** | Works with both touch (mobile) and mouse (desktop) |
| **Network Testing** | Test on iPhone via local network with `--host` flag |

---

## 3. Web vs Native: Key Differences

| Aspect | React Native (Mobile) | Vite + React (Web) |
|--------|----------------------|-------------------|
| **Framework** | React Native + Expo 54 | React 19 + Vite 8 |
| **Local DB** | expo-sqlite (SQLite) | Dexie.js (IndexedDB) |
| **Cloud DB** | None | Firebase Firestore |
| **Auth** | None | Firebase Auth (Anonymous or Email) |
| **Sync** | Device-local only | Auto-sync across devices |
| **Preferences** | AsyncStorage | localStorage |
| **Navigation** | React Navigation | React Router (HashRouter) |
| **Icons** | @expo/vector-icons (Ionicons) | Emoji |
| **State Mgmt** | React Context + useReducer | React Context + useReducer |
| **Build Tool** | Expo CLI + Metro | Vite |

---

## 4. Technology Stack

### 4.1 Core Stack

| Technology | Purpose | Version | Cost |
|-----------|---------|---------|:----:|
| **React** | UI framework | 19.x | Free |
| **TypeScript** | Type-safe JavaScript | 5.x | Free |
| **Vite** | Build tool + dev server | 8.x | Free |
| **React Router** | Client-side routing | 7.x | Free |
| **Dexie.js** | IndexedDB wrapper (offline cache) | 4.x | Free |
| **Firebase SDK** | Auth + Firestore (cloud sync) | 11.x | **Free tier** |
| **localStorage** | Key-value preferences | Built-in | Free |

### 4.2 Firebase Free Tier

| Resource | Free Limit | Expected Usage | Cost |
|----------|-----------|---------------|:----:|
| **Authentication** | 10,000 users/month | 1–5 users | **$0** |
| **Firestore Reads** | 50,000/day | ~50 reads | **$0** |
| **Firestore Writes** | 20,000/day | ~20 writes | **$0** |
| **Firestore Storage** | 1 GB total | < 1 MB | **$0** |

---

## 5. Architecture: Hybrid Offline + Cloud Sync

### 5.1 High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        UI Layer                                │
│     Day Tab    │    Week Tab    │   History Tab   │ Settings  │
│  (any date)    │  (any week)    │  (past plans)   │           │
└───────────────────────┬───────────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────────┐
│                    State Management                            │
│              React Context + useReducer                        │
└───────────────────────┬───────────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────────┐
│                   Service / Logic Layer                        │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Meal     │ │ Seed Data  │ │ Preference │ │ Sync        │ │
│  │ Generator│ │ Loader     │ │ Manager    │ │ Service     │ │
│  └──────────┘ └────────────┘ └────────────┘ └──────────────┘ │
└───────────────────────┬───────────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────────┐
│                    Persistence Layer (Dual)                    │
│                                                                │
│  ┌──────────────────────┐    ┌──────────────────────┐         │
│  │  IndexedDB (Dexie.js) │    │  Firestore (Firebase) │         │
│  │  Offline cache        │◄──►│  Cloud source of truth│         │
│  │  Always available     │    │  Syncs across devices │         │
│  └──────────────────────┘    └──────────────────────┘         │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow — First Launch

```
1. App loads → Check localStorage for "onboarding_complete"
2. If false → Show Onboarding screen (enter name)
3. Save name to localStorage, set "onboarding_complete" = true
4. Check Firebase Auth → if not logged in → Auto-login with Anonymous Auth
5. Check localStorage "seed_data_loaded"
6. If false → Seed 77 dishes into IndexedDB → set flag = true
7. Load preferences from localStorage
8. Navigate to Day tab (empty state — no auto-generation)
9. Firebase sync: On first login, pull any existing data from Firestore → IndexedDB
```

### 5.3 Data Flow — Generate Day Plan

```
1. User picks a date from the date picker
2. If existing plan exists for that date → Load from IndexedDB → Display with "Regenerate" button
3. User clicks "Generate" (with confirmation if replacing)
4. Generator picks random meals, saves to IndexedDB
5. Sync Service writes the new plan to Firestore
6. Other devices receive the update automatically
```

### 5.4 Data Flow — Cross-Device Sync

```
Device A (iPhone)                              Device B (iPad)
     │                                              │
     ├── Generate meals for Jun 20                    │
     ├── Save to IndexedDB                            │
     ├── Write to Firestore ──────────────────────────┤
     │                                                ├── Firestore "onSnapshot" fires
     │                                                ├── Update local IndexedDB
     │                                                ├── UI re-renders with new data
     │                                                │
     ├── Edit meal on Device A                        │
     ├── Update IndexedDB                             │
     ├── Write to Firestore ──────────────────────────┤
     │                                                ├── Receives update
     │                                                ├── Updates IndexedDB
     │                                                └── UI re-renders
```

---

## 6. Firebase Integration

### 6.1 Why Firebase?

| Requirement | How Firebase meets it |
|-------------|----------------------|
| **Free** | Generous free tier, no credit card required for Blaze plan with free limit |
| **Cross-device sync** | Firestore real-time sync — changes appear on all devices instantly |
| **Authentication** | Firebase Auth — Anonymous (no password) or Email/Password |
| **Offline support** | Firestore offline persistence + IndexedDB dual layer |
| **No server management** | Serverless — Google manages everything |

### 6.2 Authentication Strategy

**Anonymous Auth + Optional Upgrade:**
- **First launch:** Automatically create an Anonymous Firebase account (no user interaction)
- **User gets a persistent anonymous UID** stored in localStorage
- All data in Firestore is keyed by this UID
- **Optional:** Later allow upgrading to Email/Password to recover account across browser resets

**Why Anonymous over Email?**
- Zero friction — no sign-up form
- Works immediately after onboarding
- Data is still tied to a user account (not device-local)
- If user clears browser data, they lose access (same as any local-only app)

### 6.3 Firestore Data Model

```
Collections:
┌─────────────────────────────────────────────────────────────┐
│ /users/{uid}/                                              │
│   ├── preferences: {                                       │
│   │     displayName: string,                               │
│   │     mealsPerDay: number,                               │
│   │     weekStartDay: 'monday' | 'sunday',                 │
│   │     createdAt: timestamp                               │
│   │   }                                                    │
│   │                                                         │
│   ├── dayPlans/{date}: {                                   │
│   │     date: string,                                      │
│   │     weekOfYear: number,                                │
│   │     year: number,                                      │
│   │     breakfastId: number | null,                        │
│   │     lunchId: number | null,                            │
│   │     dinnerId: number | null,                           │
│   │     snackId: number | null,                            │
│   │     isGenerated: number,                               │
│   │     updatedAt: timestamp                               │
│   │   }                                                    │
│   │                                                         │
│   ├── customMeals/{mealId}: {                              │
│   │     name: string,                                      │
│   │     suggestedFor: string,                              │
│   │     cuisine: string,                                   │
│   │     ... (same as Meal type)                            │
│   │   }                                                    │
│   │                                                         │
│   └── savedWeekPlans/{planId}: {                           │
│         name: string,                                      │
│         weekOfYear: number,                                │
│         year: number,                                      │
│         createdAt: timestamp                               │
│       }                                                    │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Sync Strategy

| Direction | Method | Trigger |
|-----------|--------|---------|
| **Local → Cloud** | `firestore.setDoc()` | After every generate/save/edit |
| **Cloud → Local** | `firestore.onSnapshot()` | Real-time listener — updates automatically |
| **Initial Pull** | `firestore.getDocs()` | On login — syncs all data to local IndexedDB |
| **Conflict Resolution** | Last-write-wins (by timestamp) | Simple and appropriate for single-user |

---

## 7. Data Model

### 7.1 TypeScript Types

```typescript
export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Meal {
  id: number;
  name: string;
  suggestedFor: string; // JSON array
  cuisine: string;
  dietaryTags: string;
  prepTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  photoPath: string | null;
  youtubeLink: string | null;
  ingredients: string;
  steps: string;
  calories: number | null;
  isFavorite: number;
  isCustom: number;
}

export interface DayPlan {
  id?: number;
  date: string;
  weekOfYear: number;
  year: number;
  breakfastId: number | null;
  lunchId: number | null;
  dinnerId: number | null;
  snackId: number | null;
  isGenerated: number;
}

export interface DayPlanWithMeals extends DayPlan {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snack?: Meal;
}

export interface SavedWeekPlan {
  id?: number;
  name: string | null;
  createdAt: string;
  weekOfYear: number;
  year: number;
}

export interface UserPreferences {
  displayName: string;
  mealsPerDay: number;
  weekStartDay: 'monday' | 'sunday';
}
```

### 7.2 IndexedDB Schema (Dexie.js)

| Table | Primary Key | Indices |
|-------|-------------|---------|
| **meals** | `++id` | `name`, `cuisine`, `isCustom` |
| **dayPlans** | `++id` | `date`, `weekOfYear`, `year` |
| **savedWeekPlans** | `++id` | `weekOfYear`, `year` |

### 7.3 localStorage Keys

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `onboarding_complete` | boolean | false | Whether user has completed onboarding |
| `displayName` | string | '' | User's display name |
| `mealsPerDay` | number | 1 | Meals per day count |
| `weekStartDay` | string | 'monday' | Monday or Sunday |
| `seed_data_loaded` | boolean | false | Seed data flag |
| `firebase_uid` | string | '' | Anonymous Firebase user ID |

---

## 8. Database Layer: IndexedDB + Firestore

### 8.1 Why Both?

| Database | Role | Why |
|----------|------|-----|
| **IndexedDB (Dexie.js)** | Offline cache + source of truth while offline | Instant access, works without internet, same data model |
| **Firestore (Firebase)** | Cloud sync layer | Cross-device sync, backup, persistence across browser resets |

### 8.2 Sync Service Architecture

```
┌──────────────────────────────────┐
│          App Component           │
│         (User Action)            │
└───────────┬──────────────────────┘
            │
            ▼
┌──────────────────────┐     ┌──────────────────────┐
│   Write to           │     │   Read from          │
│   IndexedDB          │     │   IndexedDB          │
│   (instant)          │     │   (always works)     │
└───────────┬──────────┘     └──────────▲───────────┘
            │                           │
            ▼                           │
┌──────────────────────┐               │
│   Sync Service       │───────────────┘
│   (background)       │  Pulls updates
│                      │  from Firestore
│   ┌──────────────┐   │  via onSnapshot
│   │ Write to     │   │
│   │ Firestore    │   │
│   └──────────────┘   │
└──────────────────────┘
```

### 8.3 Sync Service Pseudocode

```typescript
class SyncService {
  // After any local change:
  async pushDayPlan(plan: DayPlan, uid: string) {
    await setDoc(doc(db, 'users', uid, 'dayPlans', plan.date), {
      ...plan,
      updatedAt: serverTimestamp(),
    });
  }

  // Listen for remote changes:
  listenToDayPlans(uid: string) {
    onSnapshot(
      collection(db, 'users', uid, 'dayPlans'),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            // Write to IndexedDB
            upsertDayPlan(change.doc.data());
          }
        });
      }
    );
  }
}
```

---

## 9. UI / UX Design

### 9.1 App Theme (Unchanged)

| Element | Design |
|---------|--------|
| **Name** | FoodGen |
| **Primary Color** | `#FF6B35` (warm orange) |
| **Secondary Color** | `#2EC4B6` (teal) |
| **Background** | `#FAFAFA` |
| **Custom Badge** | `#9C27B0` (purple) |

### 9.2 Tab Structure (3 Tabs)

```
┌──────────────────────────────────────────┐
│  📅 Day Tab    📆 Week Tab    📋 History │  ← 3 tabs
└──────────────────────────────────────────┘
```

### 9.3 Day Tab Layout

```
┌──────────────────────────────────────────┐
│  ⚙️           🍽️ FoodGen              [+]│
├──────────────────────────────────────────┤
│  📅 [ Jun 19, 2026    ▼ ]               │ ← Date picker (today+)
├──────────────────────────────────────────┤
│  [ 1 🍽️ │ 2 🍽️🍽️ │ 3 🍽️🍽️🍽️ ]      │ ← No slot labels
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐    │
│  │  🍳 Tapsilog                     │    │  ← No Breakfast label
│  │  ⏱ 20 min  🔥 easy              │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │  🍗 Chicken Adobo                │    │
│  │  ⏱ 40 min  🔥 easy  👤 You      │    │
│  └──────────────────────────────────┘    │
│                                           │
│  [ 🔄 Regenerate Meals ] (confirms first)│
├──────────────────────────────────────────┤
│  📅 Day      📆 Week     📋 History     │
└──────────────────────────────────────────┘
```

### 9.4 Week Tab Layout

```
┌──────────────────────────────────────────┐
│  ⚙️          📆 Week 25                [+]│
│         Jun 15 – Jun 21, 2026             │
├──────────────────────────────────────────┤
│  [ 1 🍽️ │ 2 🍽️🍽️ │ 3 🍽️🍽️🍽️ ]      │
├──────────────────────────────────────────┤
│  [ 📅 Week of:  Jun 16, 2026  ▼ ]       │ ← Week picker
│  [ Start day: Mon ▼ ]                    │ ← Configurable
├──────────────────────────────────────────┤
│  ┌─── Mon 15 ──────────── [↻] ──────┐   │
│  │  🍳 Tapsilog                      │   │
│  │  🌙 Chicken Adobo                 │   │
│  └───────────────────────────────────┘   │
│  ┌─── Tue 16 ──────────── [↻] ──────┐   │
│  │  (collapsed)                       │   │
│  └───────────────────────────────────┘   │
│  ...through Sunday                       │
│                                           │
│  [ 🔄 Generate This Week ]               │
│  [ 💾 Save This Plan ]                   │
│  [ 📍 Jump to This Week ]                │
├──────────────────────────────────────────┤
│  📅 Day      📆 Week     📋 History     │
└──────────────────────────────────────────┘
```

### 9.5 History Tab Layout

```
┌──────────────────────────────────────────┐
│           🍽️ 📋 Plan History             │
├──────────────────────────────────────────┤
│  ┌─── Mon, Jun 15 ──────────────────┐    │
│  │  2 meals: Tapsilog, Adobo        │    │
│  │  [ View ] [ Regenerate ]         │    │
│  └──────────────────────────────────┘    │
│  ┌─── Sun, Jun 14 ──────────────────┐    │
│  │  3 meals: Champorado, Sinigang,  │    │
│  │           Lechon Kawali          │    │
│  │  [ View ] [ Regenerate ]         │    │
│  └──────────────────────────────────┘    │
│  ┌─── ... ──────────────────────────┐    │
│  │  (more past plans)               │    │
│  └──────────────────────────────────┘    │
├──────────────────────────────────────────┤
│  📅 Day      📆 Week     📋 History     │
└──────────────────────────────────────────┘
```

### 9.6 Settings Layout

```
┌──────────────────────────────────────────┐
│  ← Back           ⚙️ Settings            │
├──────────────────────────────────────────┤
│                                           │
│  ──── Meals Per Day ────                 │
│                                           │
│  [  1 🍽️  │  2 🍽️🍽️  │  3 🍽️🍽️🍽️  ]  │
│                                           │
│  ──── Week Start Day ────                │
│                                           │
│  [  Monday  │  Sunday  ]                  │
│                                           │
│  ──── Account ────                        │
│                                           │
│  👤 {displayName}                         │
│  (set during onboarding)                  │
│                                           │
│  ──── About ────                          │
│  Version 1.0.0                            │
│  Data: 77 Filipino dishes                 │
│  Synced via Firebase                      │
│                                           │
└──────────────────────────────────────────┘
```

### 9.7 Onboarding Screen

```
┌──────────────────────────────────────────┐
│                                           │
│           🍽️ Welcome to FoodGen          │
│                                           │
│  Plan your meals, your way.               │
│  Your data syncs across all devices.      │
│                                           │
│  ┌──────────────────────────────────┐    │
│  │  What should we call you?       │    │
│  │  ┌────────────────────────┐     │    │
│  │  │  Your name...          │     │    │
│  │  └────────────────────────┘     │    │
│  └──────────────────────────────────┘    │
│                                           │
│  [  🚀 Get Started  ]                     │
│                                           │
└──────────────────────────────────────────┘
```

---

## 10. Navigation & Route Design

| Route | Component | Description | Tab |
|-------|-----------|-------------|:---:|
| `/#/` | DayPage | Date picker + meals for selected date | 📅 |
| `/#/week` | WeekPage | Week picker + 7-day plan | 📆 |
| `/#/history` | HistoryPage | Browse past finalized plans | 📋 |
| `/#/add-meal` | AddMealPage | Add custom meal form | — |
| `/#/settings` | SettingsPage | Preferences | — |
| `/#/onboarding` | OnboardingPage | First-visit welcome (name) | — |

---

## 11. Project Structure

```
FoodGenWeb/
├── index.html                     # Vite entry
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite bundler
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                   # React entry
│   ├── App.tsx                    # Root + Router
│   ├── App.css                    # Global styles
│   │
│   ├── pages/
│   │   ├── DayPage.tsx            # Date picker + meals (was TodayPage)
│   │   ├── WeekPage.tsx           # Week picker + 7-day plan
│   │   ├── HistoryPage.tsx        # Past finalized plans
│   │   ├── AddMealPage.tsx        # Custom meal form
│   │   ├── SettingsPage.tsx       # Preferences
│   │   └── OnboardingPage.tsx     # First-visit welcome
│   │
│   ├── components/
│   │   ├── MealCard.tsx           # Meal card (no slot labels)
│   │   ├── DayRow.tsx             # Collapsible day row
│   │   ├── MealsPerDayPicker.tsx  # 1🍽️ / 2🍽️🍽️ / 3🍽️🍽️🍽️
│   │   ├── MealDetailModal.tsx    # Bottom sheet modal
│   │   ├── DifficultyBadge.tsx    # Easy/Medium/Hard
│   │   └── EmptyState.tsx         # Placeholder
│   │
│   ├── database/
│   │   ├── db.ts                  # Dexie.js schema
│   │   ├── mealRepository.ts      # CRUD: meals (IndexedDB)
│   │   └── planRepository.ts      # CRUD: plans (IndexedDB)
│   │
│   ├── services/
│   │   ├── mealPlanGenerator.ts   # Random generation algorithm
│   │   ├── seedDataLoader.ts      # 77 Filipino dishes
│   │   ├── preferenceManager.ts   # localStorage wrapper
│   │   └── syncService.ts         # Firebase sync layer
│   │
│   ├── firebase/
│   │   ├── config.ts              # Firebase config (from .env)
│   │   ├── auth.ts                # Auth helpers
│   │   └── firestore.ts           # Firestore CRUD + sync
│   │
│   ├── context/
│   │   └── MealPlanContext.tsx     # React Context
│   │
│   ├── types/
│   │   └── meal.ts                # TypeScript interfaces
│   │
│   └── utils/
│       ├── constants.ts           # App constants
│       └── dateHelpers.ts         # Date utilities
│
└── .env                           # Firebase API keys (gitignored)
```

---

## 12. State Management

### 12.1 React Context API

```typescript
interface MealPlanContextType {
  // User & Auth
  user: { uid: string; displayName: string } | null;
  isOnline: boolean;
  
  // Current view
  selectedDate: string;           // ISO date for Day tab
  selectedWeek: number;           // Week number for Week tab
  
  // Data
  dayPlan: DayPlanWithMeals | null;
  weekPlans: DayPlanWithMeals[];
  historyPlans: DayPlanWithMeals[];
  
  // Preferences
  mealsPerDay: number;
  weekStartDay: 'monday' | 'sunday';
  
  // Actions
  generateDayPlan: (date: string) => Promise<void>;
  generateWeekPlan: (weekOfYear: number, year: number) => Promise<void>;
  regenerateDay: (date: string) => Promise<void>;
  setMealsPerDay: (count: number) => Promise<void>;
  setWeekStartDay: (day: 'monday' | 'sunday') => Promise<void>;
  setSelectedDate: (date: string) => Promise<void>;
  setSelectedWeek: (week: number) => Promise<void>;
}
```

---

## 13. Firebase Setup Guide

### Step 1: Create a Firebase Project (5 minutes)

1. Go to **https://console.firebase.google.com/**
2. Click **"Create a project"**
3. Enter project name: **FoodGen**
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Under **Sign-in method**, enable **Anonymous** (green toggle)
3. (Optional) Enable **Email/Password** if you want upgrade option later

### Step 3: Enable Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll secure rules later)
3. Choose a region closest to you (e.g., **australia-southeast1**)
4. Click **Done**

### Step 4: Get Firebase Config

1. Go to **Project Settings** (gear icon) → **General**
2. Under **Your apps**, click **Add app** → **Web**
3. Register app (nickname: "FoodGen Web")
4. Copy the `firebaseConfig` object shown
5. We'll paste this into the app's `.env` file

### Step 5: Update Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

---

## 14. Implementation Roadmap

### Phase 1: Foundation (Quick Wins)

| # | Task | Files | Priority |
|:-:|------|-------|:--------:|
| 1.1 | Remove auto-generation from context | `MealPlanContext.tsx` | 🔴 High |
| 1.2 | Remove slot labels from MealCard | `MealCard.tsx`, `DayRow.tsx` | 🔴 High |
| 1.3 | Remove showLabels from settings & picker | `MealsPerDayPicker.tsx`, `SettingsPage.tsx`, `constants.ts` | 🔴 High |
| 1.4 | Simplify picker to "1 🍽️ / 2 🍽️🍽️ / 3 🍽️🍽️🍽️" | `MealsPerDayPicker.tsx` | 🔴 High |
| 1.5 | Add confirmation dialogs for all regenerate actions | `DayPage.tsx`, `WeekPage.tsx`, `DayRow.tsx` | 🔴 High |

### Phase 2: Day Tab Enhancement

| # | Task | Files | Priority |
|:-:|------|-------|:--------:|
| 2.1 | Rename TodayPage → DayPage, update routes | `DayPage.tsx`, `App.tsx` | 🔴 High |
| 2.2 | Add date input (today & future only) | `DayPage.tsx` | 🔴 High |
| 2.3 | Load/save plans by selected date | `DayPage.tsx`, `MealPlanContext.tsx` | 🔴 High |
| 2.4 | Show existing plan with Regenerate confirmation | `DayPage.tsx` | 🔴 High |

### Phase 3: Week Tab Enhancement

| # | Task | Files | Priority |
|:-:|------|-------|:--------:|
| 3.1 | Add week picker (date maps to ISO week) | `WeekPage.tsx` | 🟡 Medium |
| 3.2 | Load/save plans by selected week | `WeekPage.tsx`, `MealPlanContext.tsx` | 🟡 Medium |
| 3.3 | Add configurable week start day | `WeekPage.tsx`, `SettingsPage.tsx`, `preferenceManager.ts` | 🟡 Medium |
| 3.4 | "Jump to This Week" button | `WeekPage.tsx` | 🟢 Low |

### Phase 4: Onboarding + Auth

| # | Task | Files | Priority |
|:-:|------|-------|:--------:|
| 4.1 | Create OnboardingPage (name input, required) | `OnboardingPage.tsx` | 🔴 High |
| 4.2 | Set up Firebase project + config | `firebase/config.ts`, `.env` | 🔴 High |
| 4.3 | Implement Anonymous Auth | `firebase/auth.ts`, `context` | 🔴 High |
| 4.4 | Protect routes — redirect to onboarding if not completed | `App.tsx` | 🔴 High |

### Phase 5: Firebase Sync

| # | Task | Files | Priority |
|:-:|------|-------|:--------:|
| 5.1 | Implement sync service (IndexedDB ↔ Firestore) | `services/syncService.ts`, `firebase/firestore.ts` | 🟡 Medium |
| 5.2 | Push to Firestore on generate/save | `syncService.ts` | 🟡 Medium |
| 5.3 | Listen for remote changes via onSnapshot | `syncService.ts`, `MealPlanContext.tsx` | 🟡 Medium |
| 5.4 | Initial pull on login | `MealPlanContext.tsx` | 🟡 Medium |

### Phase 6: History Tab

| # | Task | Files | Priority |
|:-:|------|-------|:--------:|
| 6.1 | Create HistoryPage (list of past plans) | `HistoryPage.tsx` | 🟢 Low |
| 6.2 | Add History tab to bottom navigation | `App.tsx` | 🟢 Low |
| 6.3 | View/regenerate from history | `HistoryPage.tsx` | 🟢 Low |

### Implementation Order

```
Now (Phases 1→2→3):
  Foundation + Day Tab + Week Tab enhancements
  These are purely UI/UX changes, no Firebase needed yet

Next (Phase 4):
  Onboarding + Firebase Auth setup
  This requires Firebase project creation

Then (Phase 5→6):
  Firebase Sync + History Tab
  Cross-device sync becomes active
```

---

## 15. Deployment Strategy

### 15.1 Production Build

```bash
npm run build
# Creates dist/ folder with static HTML/JS/CSS
```

### 15.2 Hosting Options

| Option | Cost | Notes |
|--------|:----:|-------|
| **Firebase Hosting** | **Free** | Best integration with Firebase Auth + Firestore |
| **Vercel** | Free | Easy Git-based deploy |
| **Netlify** | Free | Same as Vercel |

**Recommended: Firebase Hosting** — single ecosystem, same project as Firestore.

---

## 16. Cost Breakdown

| Item | Cost | Notes |
|-----|:----:|-------|
| Firebase Auth (Anonymous) | **$0** | Free tier |
| Firestore Database | **$0** | 1GB storage, 50K reads/day |
| Firebase Hosting | **$0** | 10GB storage, 100GB bandwidth/month |
| Vite + React + TypeScript | **$0** | Open source |
| Dexie.js | **$0** | MIT License |
| Apple Developer Program | **$0** | Not needed for web app |
| **Total Monthly** | **$0** | |

---

## 17. Future Expansion

### Phase 2 — Enhanced Features

- **Email/Password Auth** — Upgrade from anonymous to recoverable account
- **Dietary Filters** — Vegetarian, vegan, keto, gluten-free
- **Cuisine Preferences** — Italian, Asian, Mexican, etc.
- **Shopping List** — Consolidated grocery list from weekly plan
- **Favorites** — Bookmark favourite generated weeks

### Phase 3 — Advanced

- **PWA Support** — Installable app with service worker
- **Print Plans** — Print-friendly view
- **Share Plans** — Via Web Share API
- **Notifications** — Daily meal reminder

---

*Document version 3.0 — June 2026 (Hybrid offline + Firebase cloud sync architecture)*