# FoodGen Web — Vite + React + TypeScript Documentation

## Table of Contents

1. [Concept Overview](#1-concept-overview)
2. [Core Features](#2-core-features)
3. [Web vs Native: Key Differences](#3-web-vs-native-key-differences)
4. [Technology Stack](#4-technology-stack)
5. [Architecture: Household-Driven Cloud Sync](#5-architecture-household-driven-cloud-sync)
6. [Firebase Integration](#6-firebase-integration)
7. [Data Model](#7-data-model)
8. [Database Layer: Firestore-Only (No IndexedDB)](#8-database-layer-firestore-only-no-indexeddb)
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

**FoodGen Web** is a browser-based meal planning app focused on **Filipino cuisine** that lets households create, share, and track daily/weekly meal plans. All data syncs via **Firebase Firestore** at **$0 cost**.

### Key Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Household-Driven** | Users must belong to a household to plan meals. Plans are shared across all household members. |
| **Role-Based Access** | Admin (full control), Editor (can create/edit plans), Viewer (read-only + can update meal status) |
| **Flexible Meal Planning** | Meals stored in flexible array — no fixed slots, optional labels, per-meal cooking status |
| **Cloud-Native** | Firebase Firestore as single source of truth — no complex offline sync |
| **Responsive Design** | Optimised for iPhone, adapts to tablet and desktop |
| **Zero Server Cost** | Firebase free tier covers personal use indefinitely |

---

## 2. Core Features

### 2.1 MVP Feature Set

| Feature | Description |
|---------|-------------|
| **Sign-Up with Email/Password** | Name, email, password — no verification required |
| **Household Dashboard** | Gateway after login — shows household status, pending invites |
| **Create Household** | Name, address, week start day, timezone, description |
| **Join via Invite Code** | Enter code → pending request for admin approval |
| **Admin Direct Invite** | Admin enters email → invite sent, user accepts/rejects on dashboard |
| **Accept/Reject Join Requests** | Admin manages pending requests |
| **Role Management** | Admin can change member roles (admin/editor/viewer) |
| **Flexible Day Plans** | `meals[]` array — optional labels (breakfast/lunch/dinner), per-meal status tracking |
| **Generate Day Plan** | Pick how many meals, generate random from 77 reference dishes + custom meals |
| **Generate Week Plan** | Same count applied to all 7 days |
| **Per-Meal Status** | All members can update: planned → in_progress → completed → skipped |
| **Meal Detail Modal** | View ingredients, steps, difficulty, prep time |
| **Add Custom Meal** | Full form with dynamic ingredient/step lists |
| **Week Start Day** | Configurable per household (Monday or Sunday) |
| **Activity Log** | Track who modified plans and when |
| **Invite Code History** | Track all generated codes with usage stats |

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
| **Framework** | React Native + Expo 52 | React 19 + Vite 8 |
| **Local DB** | expo-sqlite (SQLite) | None (Firestore-only) |
| **Cloud DB** | None | Firebase Firestore |
| **Auth** | None | Firebase Auth (Email/Password) |
| **Sync** | Device-local only | Cloud-native, real-time sync |
| **Preferences** | AsyncStorage | localStorage |
| **Navigation** | React Navigation | React Router (HashRouter) |
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
| **Firebase SDK** | Auth + Firestore | 11.x | **Free tier** |
| **localStorage** | Key-value preferences | Built-in | Free |

### 4.2 Firebase Free Tier

| Resource | Free Limit | Expected Usage | Cost |
|----------|-----------|---------------|:----:|
| **Authentication** | 10,000 users/month | 1–10 users | **$0** |
| **Firestore Reads** | 50,000/day | ~200 reads | **$0** |
| **Firestore Writes** | 20,000/day | ~50 writes | **$0** |
| **Firestore Storage** | 1 GB total | < 1 MB | **$0** |

---

## 5. Architecture: Household-Driven Cloud Sync

### 5.1 High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        UI Layer                                │
│  Household  │  Day Tab   │  Week Tab   │  Settings     │ Detail│
│  Dashboard  │  (any date)│  (any week) │  + Account    │ Modal │
└──────────────────────┬────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│                    State Management                            │
│              React Context + useReducer                        │
│         (user, household, plans, roles, preferences)           │
└──────────────────────┬────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│                   Service / Logic Layer                        │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Meal     │ │ Seed Data  │ │ Preference │ │ Firebase     │ │
│  │ Generator│ │ Loader     │ │ Manager    │ │ Auth + FS    │ │
│  └──────────┘ └────────────┘ └────────────┘ └──────────────┘ │
└──────────────────────┬────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│                    Persistence Layer                           │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Firebase Firestore (Single Source of Truth) │  │
│  │  - referenceMeals/  (77 dishes — shared)                │  │
│  │  - users/{uid}/     (profile, preferences, customMeals) │  │
│  │  - households/{id}/ (members, invites, plans, logs)     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  + localStorage for preferences (displayName, onboarding flag) │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow — First Launch (Sign-Up)

```
1. App loads → Check localStorage for "onboarding_complete"
2. If false → Show Sign-Up screen
3. User enters name, email, password → Firebase Auth creates account
4. Save user profile to Firestore: users/{uid}/profile/main
5. Save preferences to Firestore: users/{uid}/preferences/main
6. Navigate to Household Dashboard (empty state — no household yet)
7. User must create or join a household before accessing Day/Week pages
```

### 5.3 Data Flow — Generate Day Plan

```
1. User must be in a household (checked on every navigation)
2. User picks a date from date picker
3. Admin/Editor clicks "Generate Meals"
4. Prompt appears: "How many meals for this day?" (1/2/3/4)
5. Generator picks random meals from:
   - referenceMeals/ (77 shared dishes)
   - users/{uid}/customMeals/ (user's custom meals)
6. Save to: households/{householdId}/plans/{date}
   - meals[] array with status: 'planned'
   - Labels: optional (as chosen)
7. All household members see the plan instantly via Firestore real-time sync
```

### 5.4 Data Flow — Cross-Device Sync

```
Device A (iPhone)                              Device B (iPad)
     │                                              │
     ├── Login to Firebase Auth                      │
     ├── Load household/plans from Firestore          │
     │                                              ├── Login to Firebase Auth
     │                                              ├── Load same data
     │                                              │
     ├── Generate meals for Jun 20                    │
     ├── Write to Firestore ─────────────────────────┤
     │                                                ├── Firestore onSnapshot fires
     │                                                ├── UI re-renders with new data
     │                                                │
     ├── Update meal status (lunch → completed)      │
     ├── Write to Firestore ─────────────────────────┤
     │                                                ├── Receives update
     │                                                └── UI re-renders
```

---

## 6. Firebase Integration

### 6.1 Why Firebase?

| Requirement | How Firebase meets it |
|-------------|----------------------|
| **Free** | Generous free tier, no credit card required |
| **Cross-device sync** | Firestore real-time sync — changes appear on all devices instantly |
| **Authentication** | Firebase Auth — Email/Password |
| **No server management** | Serverless — Google manages everything |
| **Shared data** | Household-level data accessible by multiple users |

### 6.2 Authentication Strategy

**Email/Password Auth:**
- **Sign-Up:** User enters name, email, password → Firebase Auth creates account
- **Login:** Email + password → restore user data
- **No email verification** (simplifies initial sign-up)
- **Persistent:** User can log in from any device

### 6.3 Firestore Collection Structure

```
Collections:
┌─────────────────────────────────────────────────────────────┐
│ referenceMeals/{mealId}:                                    │
│   - 77 Filipino dishes (SHARED — stored once, read by all) │
│   - Read-only for all authenticated users                   │
└─────────────────────────────────────────────────────────────┘

/users/{uid}/
├── profile/main: {displayName, email, householdId, role}
├── preferences/main: {displayName, onboardingComplete}
└── customMeals/{mealId}: {name, ingredients, steps, ...}

/households/{householdId}:
├── (main doc): {name, address, inviteCode, weekStartDay, ...}
├── members/{uid}: {displayName, email, role}
├── joinRequests/{uid}: {status: pending/accepted/rejected}
├── invites/{inviteId}: {invitedEmail, role, status}
├── plans/{date}: {meals: [{mealId, label?, status}], ...}
├── inviteCodes/{codeId}: {code, generatedBy, isActive, ...}
└── activityLog/{logId}: {action, performedBy, date, ...}
```

---

## 7. Data Model

### 7.1 TypeScript Types (Updated for Household Architecture)

```typescript
// ── Meal Types ──

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Meal {
  id: number;
  name: string;
  suggestedFor: string[];       // Already parsed array
  cuisine: string;
  dietaryTags: string[];         // Already parsed array
  prepTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  photoPath: string | null;
  youtubeLink: string | null;
  ingredients: Ingredient[];    // Already parsed array
  steps: string[];              // Already parsed array
  calories: number | null;
  isFavorite: number;
  isCustom: number;
}

export interface ReferenceMeal extends Meal {
  isReference: true;
}

export interface CustomMeal extends Meal {
  isCustom: 1;
}

// ── Meal Entry (inside Day Plan) ──

export type MealStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';

export interface MealEntry {
  mealId: number | null;         // Meal ID (null = unassigned)
  label?: string;                // Optional: "breakfast", "lunch", "dinner", "snack", or ""
  status: MealStatus;            // Cooking progress
}

// ── Day Plan Types ──

export interface HouseholdDayPlan {
  date: string;                  // "2026-06-19"
  weekOfYear: number;
  year: number;
  meals: MealEntry[];            // Flexible array (replaces breakfastId/lunchId/etc.)
  createdBy: string;
  lastModifiedBy: string;
  isGenerated: 0 | 1;
  createdAt: timestamp;
  updatedAt: timestamp;
}

export interface HouseholdDayPlanWithMeals extends HouseholdDayPlan {
  meals: (MealEntry & { meal?: Meal })[];  // Enriched with full meal data
}

// ── Household Types ──

export interface HouseholdAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  formattedAddress?: string;
}

export interface Household {
  name: string;
  address: HouseholdAddress;
  inviteCode: string;
  codeExpiresAt: timestamp;
  maxMembers: number;
  weekStartDay: 'monday' | 'sunday';
  description?: string;
  timezone?: string;
  createdBy: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}

export type HouseholdRole = 'admin' | 'editor' | 'viewer';

export interface HouseholdMember {
  uid: string;
  displayName: string;
  email: string;
  role: HouseholdRole;
  joinedAt: timestamp;
}

export interface JoinRequest {
  uid: string;
  displayName: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedRole?: 'editor' | 'viewer';
  requestedAt: timestamp;
  respondedAt?: timestamp;
  respondedBy?: string;
}

export interface HouseholdInvite {
  inviteId: string;
  invitedEmail: string;
  invitedUid?: string;
  invitedDisplayName?: string;
  invitedBy: string;
  invitedByName: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: timestamp;
  respondedAt?: timestamp;
}

// ── User Types ──

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  householdId?: string;
  householdRole?: HouseholdRole;
  createdAt: timestamp;
  updatedAt: timestamp;
}

export interface UserPreferences {
  displayName: string;
  onboardingComplete: boolean;
  seedDataLoaded: boolean;
  updatedAt: timestamp;
}

// ── Invite Code History ──

export interface InviteCodeRecord {
  code: string;
  generatedBy: string;
  generatedAt: timestamp;
  expiresAt: timestamp;
  isActive: boolean;
  usedCount: number;
}

// ── Activity Log ──

export type ActivityAction = 'created' | 'regenerated' | 'manual_edit' | 'status_updated' | 'suggestion_applied' | 'suggestion_rejected';

export interface ActivityLogEntry {
  date: string;
  action: ActivityAction;
  performedBy: string;
  displayName: string;
  details?: string;
  createdAt: timestamp;
}

// ── Meal Suggestion (Future) ──

export interface MealSuggestion {
  suggestedBy: string;
  displayName: string;
  date: string;
  mealIndex: number;
  currentMealId: number;
  suggestedMealId: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedBy?: string;
  respondedAt?: timestamp;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 7.2 localStorage Keys

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `onboarding_complete` | boolean | false | Whether user has completed onboarding |
| `displayName` | string | '' | User's display name |
| `seed_data_loaded` | boolean | false | Reference meals cached locally |
| `firebase_uid` | string | '' | Firebase user ID |

### 7.3 Key Changes from Previous Data Model

| Old | New | Reason |
|-----|-----|--------|
| `breakfastId`, `lunchId`, `dinnerId`, `snackId` | `meals: MealEntry[]` | Flexible meal count, optional labels |
| No cooking status | `status: 'planned' | 'in_progress' | 'completed' | 'skipped'` | Track meal progress |
| `mealsPerDay` in preferences | Chosen per-generation | More flexible |
| `weekStartDay` in user preferences | In household settings | Household-level decision |
| `users/{uid}/dayPlans/{date}` | `households/{id}/plans/{date}` | Shared household plans |
| No roles | `admin`, `editor`, `viewer` | Role-based access |
| No join requests | `joinRequests/{uid}` | Approval-based joining |
| No admin invites | `invites/{inviteId}` | Admin can invite via email |
| SavedWeekPlan | REMOVED | Simplification |

---

## 8. Database Layer: Firestore-Only (No IndexedDB)

### 8.1 Why Firestore-Only?

| Database | Role | Why |
|----------|------|-----|
| **Firestore** | Single source of truth | Real-time sync, shared across household members |
| **localStorage** | Preferences only | displayName, onboarding flag |

**Firestore-Only Approach:**
- All data reads/writes go directly to Firestore
- Firestore's built-in offline persistence handles temporary disconnections
- No complex IndexedDB sync logic needed
- Simpler codebase, fewer bugs
- Real-time listeners (`onSnapshot`) provide instant updates

### 8.2 Firestore Real-Time Listeners

```typescript
// Listen for household plan changes
const unsubPlans = onSnapshot(
  collection(db, 'households', householdId, 'plans'),
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified') {
        // Update local state
        updatePlanInState(change.doc.data() as HouseholdDayPlan);
      }
    });
  }
);

// Listen for meal changes
const unsubMeals = onSnapshot(
  collection(db, 'referenceMeals'),
  (snapshot) => {
    const meals = snapshot.docs.map(d => d.data() as ReferenceMeal);
    setAllMeals(meals);
  }
);
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

### 9.3 Household Dashboard (Gateway Screen)

```
┌──────────────────────────────────────────┐
│            🍽️ FoodGen Household          │
├──────────────────────────────────────────┤
│  [Pending Invitations] (if any)          │
│  - Smith Family — invited by Mishari     │
│    [✓ Accept] [✗ Reject]                 │
│                                           │
│  ──── Household ────                     │
│                                           │
│  {User has household?}                    │
│  ├── YES:                                 │
│  │   Household: Smith Family              │
│  │   Address: 123 George St, Sydney       │
│  │   Your Role: Admin                     │
│  │   Members: 3 (max 5)                  │
│  │   [  🍽️ Go to Meal Plans  ]           │
│  │   [  ⚙️ Household Settings  ]         │
│  │                                         │
│  └── NO:                                  │
│      "You are not part of any household." │
│      [  🏠 Create Household  ]            │
│      [  🔗 Join Household  ]              │
│                                           │
└──────────────────────────────────────────┘
```

### 9.4 Day Tab Layout

```
┌──────────────────────────────────────────┐
│  ⚙️           🍽️ FoodGen              [+]│
├──────────────────────────────────────────┤
│  📅 [ Jun 19, 2026    ▼ ]               │ ← Date picker (today+)
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐    │
│  │  🍳 Tapsilog                     │    │  ← Optional label if set
│  │  ⏱ 20 min  🔥 easy   [planned]  │    │  ← Status badge
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │  🍗 Chicken Adobo                │    │
│  │  ⏱ 40 min  🔥 easy  [completed] │    │  ← Status can be toggled
│  └──────────────────────────────────┘    │
│                                           │
│  [ 🔄 Generate Meals ] (confirms first)  │
│  [ + Add Meal to This Day ]              │
├──────────────────────────────────────────┤
│  📅 Day      📆 Week     📋 History     │
└──────────────────────────────────────────┘
```

### 9.5 Week Tab Layout

```
┌──────────────────────────────────────────┐
│  ⚙️          📆 Week 25                [+]│
│         Jun 15 – Jun 21, 2026             │
├──────────────────────────────────────────┤
│  [ 📅 Week of:  Jun 16, 2026  ▼ ]       │ ← Week picker
│  (Start: Monday — from household)        │
├──────────────────────────────────────────┤
│  ┌─── Mon 15 ──────────── [↻] ──────┐   │
│  │  🍳 Tapsilog — ✅ completed        │   │ ← With status indicator
│  │  🌙 Adobo — 🔄 in_progress         │   │
│  └───────────────────────────────────┘   │
│  ┌─── Tue 16 ──────────── [↻] ──────┐   │
│  │  (collapsed)                       │   │
│  └───────────────────────────────────┘   │
│  ...through Sunday                       │
│                                           │
│  [ 🔄 Generate This Week ]               │
│  [ 📍 Jump to This Week ]                │
├──────────────────────────────────────────┤
│  📅 Day      📆 Week     📋 History     │
└──────────────────────────────────────────┘
```

### 9.6 History Tab Layout

```
┌──────────────────────────────────────────┐
│           🍽️ 📋 Plan History             │
├──────────────────────────────────────────┤
│  ┌─── Mon, Jun 15 ──────────────────┐    │
│  │  2 meals: Tapsilog, Adobo        │    │
│  │  Status: 1 completed, 1 planned  │    │ ← Shows meal statuses
│  │  [ View ] [ Regenerate ]         │    │
│  └──────────────────────────────────┘    │
│  ┌─── Sun, Jun 14 ──────────────────┐    │
│  │  1 meal: Champorado              │    │
│  │  Status: completed               │    │
│  │  [ View ] [ Regenerate ]         │    │
│  └──────────────────────────────────┘    │
│  ...                                     │
├──────────────────────────────────────────┤
│  📅 Day      📆 Week     📋 History     │
└──────────────────────────────────────────┘
```

### 9.7 Settings Layout

```
┌──────────────────────────────────────────┐
│  ← Back           ⚙️ Settings            │
├──────────────────────────────────────────┤
│                                           │
│  ──── Household ────                     │
│                                           │
│  Household: Smith Family                  │
│  Your Role: Admin                         │
│                                           │
│  [ 🏠 Manage Household ]                 │
│  [ 🔗 View Pending Requests ]            │
│  [ 🔑 Generate New Invite Code ]         │
│                                           │
│  ──── Account ────                        │
│                                           │
│  👤 {displayName}                         │
│  📧 {email}                               │
│                                           │
│  [ 🚪 Sign Out ]                          │
│                                           │
│  ──── About ────                          │
│  Version 1.0.0                            │
│  Data: 77 Filipino dishes                 │
│  Synced via Firebase                      │
│                                           │
└──────────────────────────────────────────┘
```

### 9.8 Sign-Up Screen

```
┌──────────────────────────────────────────┐
│                                           │
│           🍽️ Welcome to FoodGen          │
│                                           │
│  Plan meals with your household.          │
│  Your data syncs across all devices.      │
│                                           │
│  ┌──────────────────────────────────┐    │
│  │  Name *                         │    │
│  │  ┌────────────────────────┐     │    │
│  │  │  Your name...          │     │    │
│  │  └────────────────────────┘     │    │
│  │                                 │    │
│  │  Email *                       │    │
│  │  ┌────────────────────────┐     │    │
│  │  │  email@example.com     │     │    │
│  │  └────────────────────────┘     │    │
│  │                                 │    │
│  │  Password *                     │    │
│  │  ┌────────────────────────┐     │    │
│  │  │  ********              │     │    │
│  │  └────────────────────────┘     │    │
│  └──────────────────────────────────┘    │
│                                           │
│  [  🚀 Sign Up  ]                         │
│                                           │
│  Already have an account? [ Log In ]      │
│                                           │
└──────────────────────────────────────────┘
```

---

## 10. Navigation & Route Design

| Route | Component | Description | Access |
|-------|-----------|-------------|--------|
| `/#/onboarding` | OnboardingPage | Sign-up or Login | Public |
| `/#/` | HouseholdDashboard | Gateway screen — shows household status + pending invites | Auth required |
| `/#/day` | DayPage | Date picker + meals for selected date | Auth + Household required |
| `/#/week` | WeekPage | Week picker + 7-day plan | Auth + Household required |
| `/#/history` | HistoryPage | Browse past plans | Auth + Household required |
| `/#/add-meal` | AddMealPage | Add custom meal form | Auth required |
| `/#/settings` | SettingsPage | Preferences + household management | Auth required |
| `/#/debug` | DebugPage | Debugging tools (dev only) | Auth required |

---

## 11. Project Structure

```
FoodGenWeb/
├── index.html                     # Vite entry
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite bundler
├── .env                           # Firebase API keys (gitignored)
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                   # React entry
│   ├── App.tsx                    # Root + Router + route protection
│   ├── App.css                    # Global styles (modal, cards, forms)
│   ├── index.css                  # Base reset + variables
│   │
│   ├── pages/
│   │   ├── OnboardingPage.tsx     # Sign-up + Login (name/email/password)
│   │   ├── HouseholdDashboard.tsx # Gateway: household status + pending invites
│   │   ├── DayPage.tsx            # Date picker + flexible meals[] display
│   │   ├── WeekPage.tsx           # Week picker + 7-day plan
│   │   ├── HistoryPage.tsx        # Past finalized plans
│   │   ├── AddMealPage.tsx        # Custom meal form
│   │   ├── SettingsPage.tsx       # Preferences + household management
│   │   ├── DebugPage.tsx          # Dev tools (reset DB, test data)
│   │   └── DebugDBPage.tsx        # Database inspection
│   │
│   ├── components/
│   │   ├── MealCard.tsx           # Meal card (no fixed slot labels)
│   │   ├── DayRow.tsx             # Collapsible day row (for Week view)
│   │   ├── MealsPerDayPicker.tsx  # Meal count selector for generation
│   │   ├── MealDetailModal.tsx    # Bottom sheet modal with full details
│   │   ├── DifficultyBadge.tsx    # Easy/Medium/Hard badge
│   │   └── EmptyState.tsx         # Placeholder for empty states
│   │
│   ├── firebase/
│   │   ├── config.ts              # Firebase config (from .env)
│   │   ├── auth.ts                # Auth helpers (signup, login, logout)
│   │   └── firestore.ts           # Firestore CRUD + real-time listeners
│   │
│   ├── services/
│   │   ├── mealPlanGenerator.ts   # Random generation algorithm
│   │   ├── seedDataLoader.ts      # Load 77 reference meals
│   │   └── preferenceManager.ts   # localStorage wrapper
│   │
│   ├── context/
│   │   └── MealPlanContext.tsx     # React Context (auth, plans, households)
│   │
│   ├── types/
│   │   └── meal.ts                # TypeScript interfaces (see section 7)
│   │
│   └── utils/
│       ├── constants.ts           # App-wide constants
│       └── dateHelpers.ts         # Date formatting, week calculation
```

### 11.1 Project Structure Rationale

| Directory | Purpose |
|-----------|---------|
| `pages/` | One file per screen/route — self-contained components |
| `components/` | Reusable UI components shared across pages |
| `firebase/` | Firebase configuration, auth helpers, Firestore CRUD |
| `services/` | Business logic — meal generation, data loading, preferences |
| `context/` | React Context for global state management |
| `types/` | TypeScript interfaces matching Firestore collection structure |
| `utils/` | Utility functions (dates, constants) |

---

## 12. State Management

### 12.1 React Context API

```typescript
interface MealPlanContextType {
  // User & Auth
  user: { uid: string; displayName: string; email: string } | null;
  isOnline: boolean;
  
  // Household
  household: Household | null;
  householdRole: HouseholdRole | null;
  householdMembers: HouseholdMember[];
  pendingJoinRequests: JoinRequest[];
  pendingInvites: HouseholdInvite[];  // For current user
  
  // Current view
  selectedDate: string;           // ISO date for Day tab
  selectedWeek: number;           // Week number for Week tab
  
  // Data
  dayPlan: HouseholdDayPlanWithMeals | null;
  weekPlans: HouseholdDayPlanWithMeals[];
  historyPlans: HouseholdDayPlanWithMeals[];
  
  // Meals
  allMeals: Meal[];
  customMeals: CustomMeal[];
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  createHousehold: (name: string, address: HouseholdAddress, weekStartDay: string) => Promise<string>;
  joinHousehold: (inviteCode: string, role: HouseholdRole) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  rejectInvite: (inviteId: string) => Promise<void>;
  acceptJoinRequest: (uid: string) => Promise<void>;
  rejectJoinRequest: (uid: string) => Promise<void>;
  inviteUser: (email: string, role: HouseholdRole) => Promise<void>;
  
  generateDayPlan: (date: string, mealCount: number) => Promise<void>;
  generateWeekPlan: (weekOfYear: number, year: number, mealCount: number) => Promise<void>;
  updateMealStatus: (date: string, mealIndex: number, status: MealStatus) => Promise<void>;
  addMealToDay: (date: string, mealId: number, label?: string) => Promise<void>;
  removeMealFromDay: (date: string, mealIndex: number) => Promise<void>;
  
  loadPlanForDate: (date: string) => Promise<void>;
  refreshWeek: () => Promise<void>;
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
2. Under **Sign-in method**, enable **Email/Password** (green toggle)

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
5. Paste into `FoodGenWeb/.env` file:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 5: Create Reference Meals Collection

The 77 Filipino dishes need to be seeded once into the `referenceMeals/` collection:
1. Run debug page (`/#/debug`) and click "Seed Reference Meals"
2. OR use Firebase Console to import `src/data/meals.json` into `referenceMeals/`

### Step 6: Update Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reference meals: Read-only for all authenticated users
    match /referenceMeals/{mealId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Users can only access their own profile and preferences
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Household: Only admins can update/delete
    match /households/{householdId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
      allow create: if request.auth != null;
      allow update, delete: if resource.data.createdBy == request.auth.uid;
      
      // Members: read by members, write by admin
      match /members/{uid} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow create: if request.auth.uid == uid;
        allow delete: if get(/databases/$(database)/documents/households/$(householdId)).data.createdBy == request.auth.uid;
      }
      
      // Join requests: create by anyone, read by auth, update by admin
      match /joinRequests/{uid} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid == uid;
        allow update: if get(/databases/$(database)/documents/households/$(householdId)).data.createdBy == request.auth.uid;
      }
      
      // Plans: read by all members, write by admin/editor, status update by anyone
      match /plans/{date} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow create: if request.auth != null && 
          get(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid)).data.role in ['admin', 'editor'];
        allow update: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
      }
    }
  }
}
```

---

## 14. Implementation Roadmap

### Phase 1: Core Architecture (Current)

| # | Task | Status |
|:-:|------|:------:|
| 1.1 | Firebase project + config | ✅ Done |
| 1.2 | Email/Password auth (signup, login, logout) | ✅ Done |
| 1.3 | User profile + preferences collections | ✅ Done |
| 1.4 | Reference meals collection (77 dishes) | ✅ Done |
| 1.5 | MealPlanContext with auth + sync | ✅ Done |
| 1.6 | Route protection (auth + household check) | ✅ Done |
| 1.7 | Day tab with date picker | ✅ Done |
| 1.8 | Week tab with week picker | ✅ Done |
| 1.9 | History tab | ✅ Done |
| 1.10 | Add custom meal | ✅ Done |
| 1.11 | Settings page | ✅ Done |

### Phase 2: Household Features (Next)

| # | Task | Priority |
|:-:|------|:--------:|
| 2.1 | Household Dashboard (gateway screen) | 🔴 High |
| 2.2 | Create Household (name, address, settings) | 🔴 High |
| 2.3 | Join via Invite Code (with pending approval) | 🔴 High |
| 2.4 | Admin Direct Invite (by email) | 🔴 High |
| 2.5 | Accept/Reject Join Requests | 🔴 High |
| 2.6 | Accept/Reject Invites (user side) | 🔴 High |
| 2.7 | Role Management (change member roles) | 🟡 Medium |
| 2.8 | Flexible meals[] array (replace fixed slots) | 🔴 High |
| 2.9 | Per-meal status tracking | 🟡 Medium |
| 2.10 | Generate prompt (how many meals?) | 🟡 Medium |

### Phase 3: Enhanced Features

| # | Task | Priority |
|:-:|------|:--------:|
| 3.1 | Activity Log | 🟡 Medium |
| 3.2 | Invite Code History | 🟡 Medium |
| 3.3 | Household Limits (maxMembers) | 🟢 Low |
| 3.4 | Viewer Suggestions (meal swap) | 🟢 Low |
| 3.5 | Email/Password account recovery | 🟢 Low |

---

## 15. Deployment Strategy

### 15.1 Production Build

```bash
cd FoodGenWeb
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
| Firebase Auth (Email/Password) | **$0** | Free tier |
| Firestore Database | **$0** | 1GB storage, 50K reads/day |
| Firebase Hosting | **$0** | 10GB storage, 100GB bandwidth/month |
| Vite + React + TypeScript | **$0** | Open source |
| Apple Developer Program | **$0** | Not needed for web app |
| **Total Monthly** | **$0** | |

---

## 17. Future Expansion

### Phase 3 — Enhanced Features

- **Multiple Cuisines** — Italian, Asian, Mexican, etc.
- **Dietary Filters** — Vegetarian, vegan, keto, gluten-free
- **Shopping List** — Consolidated grocery list from weekly plan
- **Favorites** — Bookmark favourite meals or week templates
- **Print Plans** — Print-friendly view

### Phase 4 — Advanced

- **PWA Support** — Installable app with service worker
- **Share Plans** — Via Web Share API
- **Notifications** — Daily meal reminder (web push)
- **Export/Import** — Backup household data as JSON

---

*Document version 5.0 — June 2026 (Household-driven architecture with flexible meals array)*