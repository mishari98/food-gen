# FoodGen Web — Implementation Task List

## How to Use This Document

- **Checklist format**: `- [ ]` = incomplete, `- [x]` = completed
- **Priority levels**: 🔴 High, 🟡 Medium, 🟢 Low
- **References**: Links to relevant sections in other docs
- **Update this file** as tasks are completed

---

## Phase 0: Database Cleanup (Do This First!)

**⚠️ CRITICAL**: Before starting Phase 1, you MUST clear the old Firestore data. The existing database has:
- Old `users/{uid}/dayPlans/{date}` documents (per-user plans)
- Old `users/{uid}/preferences` with `mealsPerDay`, `weekStartDay`
- Old `users/{uid}/savedWeekPlans` documents
- Possibly old anonymous auth users

**If you don't clear the database, you'll have conflicting data structures.**

**Phase 0 Status**: ✅ **COMPLETE**

---

### 0.1 Backup (Optional but Recommended)
**Status**: ✅ Skipped (user confirmed)
- [x] Skipped (user confirmed)

### 0.2 Delete Old Collections 🔴 HIGH
**Status**: ✅ Completed  
**Files**: Firebase Console → Firestore → Rules (temporarily set to test mode)

**Recommended approach**: Delete the ENTIRE `users` collection.

- [x] **Delete entire `users` collection** (completed by user)
  - This removes: all profiles, preferences, dayPlans, savedWeekPlans, customMeals
  - All of this data is from the old architecture and will be recreated
  - **Exception**: If you have custom meals you want to keep, export `users/{uid}/customMeals/` first

- [ ] Keep `referenceMeals/{mealId}` (77 Filipino dishes — keep this!)

**How to delete**:
1. Go to Firebase Console → Firestore Database
2. Click on `users` collection
3. Click "Delete collection" (or select all documents → Delete)
4. Confirm deletion

**Alternative (if you want to keep custom meals)**:
1. Export `users/{your-uid}/customMeals/` subcollection first
2. Delete entire `users` collection
3. Re-import custom meals later via debug page

### 0.3 Delete Old Anonymous Auth Users 🔴 HIGH
**Status**: ✅ Completed  
**Files**: Firebase Console → Authentication

- [x] Go to Firebase Console → Authentication → Users
- [x] Delete all anonymous auth users (they have no email)
- [x] Keep any email/password users (if you tested sign-up already)

**Why**: Old anonymous users will conflict with new email/password auth flow.

**Note**: If you deleted the entire `users` collection in 0.2, you can also delete all auth users since they'll be recreated on new sign-ups.

### 0.4 Reset Local Storage (Development Only)
**Status**: ✅ Completed  
**Files**: Browser DevTools → Application → Local Storage

- [x] Clear all localStorage keys:
  - `onboarding_complete`
  - `displayName`
  - `mealsPerDay` (old key)
  - `weekStartDay` (old key)
  - `seed_data_loaded`
  - `firebase_uid` (old anonymous UID)

**How**: 
- Chrome DevTools → Application → Local Storage → Clear All
- OR run in console: `localStorage.clear()`

### 0.5 Verify Clean State ✅
**Status**: ✅ Completed

**Verification Results**:
- [x] Firestore: No `users` collection exists
- [x] Firestore: No `households` collection (will be created in Phase 1)
- [x] Auth: No anonymous users (only email/password users, if any)
- [x] LocalStorage: Empty (or only has test data)
- [ ] Firestore: `referenceMeals/` collection needs to be re-seeded (was deleted)

**Note**: The `referenceMeals/` collection (77 Filipino dishes) was also deleted. This will be re-seeded during Phase 1 (see Task 1.3 — Firestore Service, add `seedReferenceMeals()` function).

**How to verify**:
1. Go to Firebase Console → Firestore Database
2. Confirm no `users` or `households` collections exist
3. Go to Firebase Console → Authentication → Users
4. Confirm no anonymous users (users without email)
5. Open browser DevTools → Application → Local Storage
6. Confirm all old keys are cleared

### 0.6 Update Firestore Security Rules 🔴 HIGH
**Status**: ✅ Completed  
**Files**: Firebase Console → Firestore → Rules

The new security rules have been applied and published. These rules are required for the household collections to work properly.

Before starting Phase 1, update rules to match NEW architecture:

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
    
    // Household: Read by members, create by auth, update/delete by creator
    match /households/{householdId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == get(/databases/$(database)/documents/households/$(householdId)).data.createdBy;
      
      // Members
      match /members/{uid} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow create: if request.auth.uid == uid;
        allow delete: if get(/databases/$(database)/documents/households/$(householdId)).data.createdBy == request.auth.uid;
      }
      
      // Join requests
      match /joinRequests/{uid} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid == uid;
        allow update: if get(/databases/$(database)/documents/households/$(householdId)).data.createdBy == request.auth.uid;
      }
      
      // Invites
      match /invites/{inviteId} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid == get(/databases/$(database)/documents/households/$(householdId)).data.createdBy;
        allow update: if request.auth != null && 
          (request.auth.uid == get(/databases/$(database)/documents/households/$(householdId)).data.createdBy ||
           request.auth.uid == resource.data.invitedUid);
      }
      
      // Plans
      match /plans/{date} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow create: if request.auth != null && 
          get(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid)).data.role in ['admin', 'editor'];
        allow update: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
      }
      
      // Invite codes (admin only)
      match /inviteCodes/{codeId} {
        allow read, write: if request.auth != null && 
          get(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid)).data.role == 'admin';
      }
      
      // Activity log (read by members, write by admin/editor)
      match /activityLog/{logId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow create: if request.auth != null && 
          get(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid)).data.role in ['admin', 'editor'];
      }
    }
  }
}
```

**After updating rules**:
- [x] Click "Publish" in Firebase Console
- [x] Test that rules are working (try reading/writing collections)

---

## Phase 1: Foundation REWORK (Critical — Must Be Done First)

**⚠️ IMPORTANT**: The existing code was built under the OLD architecture (per-user plans, anonymous auth, fixed meal slots, IndexedDB sync). It does NOT match the NEW architecture (household-driven, email/password auth, Firestore-only, flexible meals array). All Phase 1 items below need to be **rewritten** from scratch.

### Priority Order

Start with **1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6**. Each builds on the previous.

**Prerequisite**: Complete Phase 0 (Database Cleanup) before starting Phase 1.

---

### 1.1 TypeScript Types (Rewrite) 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/types/meal.ts`

**Current old code has**:
- `DayPlan` with `breakfastId/lunchId/dinnerId/snackId` ← WRONG
- `DayPlanWithMeals` with `breakfast?/lunch?/dinner?/snack?` ← WRONG
- `UserPreferences` with `mealsPerDay` and `weekStartDay` ← WRONG (removed/moved)
- No `HouseholdDayPlan`, `MealEntry`, `MealStatus` ← MISSING
- No `Household`, `HouseholdMember`, `HouseholdAddress` ← MISSING
- No `JoinRequest`, `HouseholdInvite` ← MISSING
- No `ActivityLogEntry`, `InviteCodeRecord` ← MISSING

**Task**:
- [x] Remove old `DayPlan`, `DayPlanWithMeals`, `SavedWeekPlan`
- [x] Add new `MealStatus` type (`planned | in_progress | completed | skipped`)
- [x] Add new `MealEntry` interface (`{mealId, label?, status}`)
- [x] Add new `HouseholdDayPlan` interface (`{date, weekOfYear, year, meals: MealEntry[], ...}`)
- [x] Add new `HouseholdDayPlanWithMeals` (enriched with meal data)
- [x] Add new `HouseholdAddress` interface
- [x] Add new `Household` interface (with `weekStartDay`, `inviteCode`, `maxMembers`, etc.)
- [x] Add new `HouseholdRole` type (`admin | editor | viewer`)
- [x] Add new `HouseholdMember` interface
- [x] Add new `JoinRequest` interface
- [x] Add new `HouseholdInvite` interface
- [x] Add new `UserProfile` interface (with `householdId?`, `householdRole?`)
- [x] Update `UserPreferences` (remove `mealsPerDay`, remove `weekStartDay`)
- [x] Add new `InviteCodeRecord` interface
- [x] Add new `ActivityLogEntry` interface
- [x] Add new `MealSuggestion` interface

**Reference**:
- `docs/FOOD_GEN_DATA_STRUCTURE.md` → Section 3 (all Firestore Collections)
- `docs/FOOD_GEN_WEB_DOCUMENTATION.md` → Section 7.1 (TypeScript Types)

---

### 1.2 Firebase Auth (Rewrite from Anonymous → Email/Password) 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/firebase/auth.ts`

**Current old code has**:
- Anonymous auth (auto-login, no sign-up form) ← WRONG

**Task**:
- [x] Rewrite `auth.ts` with Email/Password sign-up
- [x] Add `signup(name: string, email: string, password: string)` function
- [x] Add `login(email: string, password: string)` function
- [x] Add `logout()` function
- [x] Store user profile in Firestore on sign-up (`users/{uid}/profile/main`)
- [x] Store user preferences in Firestore on sign-up (`users/{uid}/preferences/main`)

**Reference**:
- `docs/FOOD_GEN_WEB_DOCUMENTATION.md` → Section 6.2 (Authentication Strategy)
- `docs/FOOD_GEN_USER_JOURNEYS.md` → Journey 1 (Sign-Up)

---

### 1.3 Firestore Service (Rewrite) 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/firebase/firestore.ts`

**Current old code has**:
- CRUD for `users/{uid}/dayPlans/{date}` ← WRONG (should be `households/{id}/plans/{date}`)
- CRUD for `users/{uid}/customMeals/` ← OK (per-user)
- Preference storage in Firestore ← needs update (removed fields)

**Task**:
- [x] Add `getHousehold(id)` — read household document
- [x] Add `createHousehold(data)` — create household + add admin member
- [x] Add `getHouseholdMembers(householdId)` — list members
- [x] Add `addMember(householdId, uid, role)` — add household member
- [x] Add `updateMemberRole(householdId, uid, role)` — change role
- [x] Add `removeMember(householdId, uid)` — remove member
- [x] Add `getJoinRequests(householdId)` — list pending join requests
- [x] Add `createJoinRequest(householdId, uid, role)` — send join request
- [x] Add `respondToJoinRequest(householdId, uid, accept)` — accept/reject
- [x] Add `getInvitesForEmail(email)` — find pending invites by email
- [x] Add `createInvite(householdId, email, role)` — admin invites user
- [x] Add `respondToInvite(householdId, inviteId, accept)` — accept/reject invite
- [x] Add `getHouseholdPlan(householdId, date)` — read plan from `households/{id}/plans/{date}`
- [x] Add `saveHouseholdPlan(householdId, date, plan)` — save plan to household
- [x] Add `updateMealStatus(householdId, date, mealIndex, status)` — update meal status
- [x] Add `getWeekPlans(householdId, weekOfYear, year)` — read week plans
- [x] Add real-time listeners for plans (`onSnapshot` on `households/{id}/plans/`)
- [x] Add real-time listeners for members
- [x] Remove old `saveDayPlanToFirestore`, `getDayPlanFromFirestore`, etc.
- [x] Add `createActivityLog(householdId, logEntry)` — log activity (Phase 3)

**Reference**:
- `docs/FOOD_GEN_DATA_STRUCTURE.md` → Section 3 (all collections)
- `docs/FOOD_GEN_WEB_DOCUMENTATION.md` → Section 8 (Firestore-only)

---

### 1.4 Meal Plan Generator (Rewrite) 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/services/mealPlanGenerator.ts`

**Current old code has**:
- Generates plans with `breakfastId/lunchId/dinnerId` ← WRONG

**Task**:
- [x] Rewrite `generateDayPlan(mealCount: number)` to return `MealEntry[]`
- [x] Rewrite `generateWeekPlan(mealCount: number)` to return 7 arrays of `MealEntry[]`
- [x] Accept `mealCount` parameter (no longer reads from preferences)
- [x] Accept optional labels array
- [x] Status defaults to `'planned'` for all entries
- [x] Ensure no meal repeats within the same week

**Reference**:
- `docs/FOOD_GEN_DATA_STRUCTURE.md` → Section 3.8 (Household Day Plans)

---

### 1.5 MealPlanContext (Rewrite) 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/context/MealPlanContext.tsx`

**Current old code has**:
- Manages per-user plans ← WRONG (should be household-level)
- Manages `mealsPerDay`, `weekStartDay` ← WRONG (removed/moved)
- Uses anonymous auth ← WRONG
- Uses old `DayPlanWithMeals` type ← WRONG
- Old sync logic (IndexedDB) ← WRONG (should be Firestore-only)

**Task**:
- [x] Add `user` state (`{uid, displayName, email} | null`)
- [x] Add `household` state (`Household | null`)
- [x] Add `householdRole` state (`HouseholdRole | null`)
- [x] Add `householdMembers` state (`HouseholdMember[]`)
- [x] Add `pendingJoinRequests` state (`JoinRequest[]`)
- [x] Add `pendingInvites` state (`HouseholdInvite[]`)
- [x] Add `dayPlan` state (`HouseholdDayPlanWithMeals | null`)
- [x] Add `weekPlans` state (`HouseholdDayPlanWithMeals[]`)
- [x] Add `allMeals` state (`Meal[]`)
- [x] Add `customMeals` state (`CustomMeal[]`)
- [x] Remove `mealsPerDay` and `weekStartDay` from state
- [x] Add `login()`, `signup()`, `logout()` actions
- [x] Add `createHousehold()`, `joinHousehold()` actions
- [x] Add `acceptInvite()`, `rejectInvite()` actions
- [x] Add `acceptJoinRequest()`, `rejectJoinRequest()` actions
- [x] Add `inviteUser()` action
- [x] Add `generateDayPlan(date, mealCount)` action
- [x] Add `generateWeekPlan(weekOfYear, year, mealCount)` action
- [x] Add `updateMealStatus(date, mealIndex, status)` action
- [x] Add `addMealToDay(date, mealId, label?)` action
- [x] Add `removeMealFromDay(date, mealIndex)` action
- [x] Add real-time Firestore listeners for plans and household data
- [x] Add route protection logic (redirect to dashboard if no household)

**Reference**:
- `docs/FOOD_GEN_WEB_DOCUMENTATION.md` → Section 12 (State Management)

---

### 1.6 Pages (Rewrite) 🔴 HIGH
**Status**: ❌ Need rewrite for household-driven architecture  

### 1.6a OnboardingPage 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/pages/OnboardingPage.tsx`

- [x] Rewrite to show Sign-Up form (name, email, password)
- [x] Add Login form (email, password)
- [x] Add toggle between Sign-Up and Login
- [x] On sign-up success → redirect to Household Dashboard

### 1.6b Household Dashboard (NEW) 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/pages/HouseholdDashboard.tsx`

- [x] Gateway screen after login
- [x] Show pending invites section (query invites by email)
- [x] Show household info if user has householdId
- [x] Show "Create Household" button with route to create form
- [x] Show "Join Household" button with route to join form
- [x] Show "Go to Meal Plans" button if in household
- [x] Accept/Reject invite buttons

### 1.6c Create/Join Household Pages (NEW) 🔴 HIGH
**Files**: Create `src/pages/CreateHouseholdPage.tsx`, `src/pages/JoinHouseholdPage.tsx`
- [ ] Create form: name, address, weekStartDay, timezone, description
- [ ] Join form: invite code input, role selector
- [ ] Validate code, check expiry, check member limit

### 1.6d DayPage 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/pages/DayPage.tsx`

- [x] Rewrite to read from `households/{id}/plans/{date}`
- [x] Show `meals[]` array with optional labels and status badges
- [x] Admin/Editor: Show "Generate Meals" with meal count prompt (random generation)
- [x] Admin/Editor: Show "Regenerate" button (with confirmation)
- [x] Admin/Editor: Show "Add Meal" button → opens meal picker with search
- [x] Admin/Editor: Remove meals with confirmation
- [x] All roles: Tap status to cycle (planned → in_progress → completed → skipped)
- [x] Tap meal card → open MealDetailModal
- [x] Show empty state if no plan exists
- [x] Viewer: No generate/regenerate/add/remove buttons (view only)

### 1.6e WeekPage 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/pages/WeekPage.tsx`

- [x] Rewrite to read from `households/{id}/plans/` (by weekOfYear)
- [x] Show collapsible day rows with meals array and status indicators
- [x] Admin/Editor: Show "Generate Week" with meal count prompt (random generation)
- [x] Admin/Editor: Per-day [↻] regenerate buttons
- [x] Admin/Editor: Per-day "Add Meal" button → opens meal picker
- [x] Admin/Editor: Remove meals per day
- [x] All roles: Tap meal status to update

### 1.6f HistoryPage 🟡 MEDIUM
**Files**: `src/pages/HistoryPage.tsx`
- [ ] Rewrite to read from household plans (all dates)
- [ ] Show past plans with meal summary and status indicators
- [ ] View and Regenerate buttons (admin/editor only)

### 1.6g SettingsPage 🟡 MEDIUM
**Status**: ✅ Completed  
**Files**: `src/pages/SettingsPage.tsx`

- [x] Remove `mealsPerDay` picker (now per-generation)
- [x] Remove `weekStartDay` (now in household settings)
- [x] Add "Manage Household" section (admin: link to household management)
- [x] Add "Pending Requests" section (admin: see join requests)
- [x] Add "Sign Out" button
- [x] Show household name and role

### 1.6h Household Management Page (NEW) 🟡 MEDIUM
**Status**: ✅ Completed  
**Files**: `src/pages/HouseholdManagementPage.tsx`

- [x] Show household info (name, address, weekStartDay, timezone, description)
- [x] Show max members setting
- [x] Show members list with role badges
- [x] Admin: Invite Member form (email + role)
- [x] Admin: Pending Requests list (Accept/Reject)
- [x] Admin: Regenerate Invite Code button
- [x] Viewer/Editor: Leave Household button

### 1.6i AddMealPage ✅ (Mostly OK)
- [ ] Minor update: Save custom meals to `users/{uid}/customMeals/` (almost same as before)
- [ ] Minor update: Ensure new meals have proper Firestore structure

### 1.6j MealDetailModal ✅ (Mostly OK)
- [ ] No changes needed — meal content is same regardless of household

---

### 1.7 Components (Update) 🟡 MEDIUM

### MealCard.tsx
- [ ] Rewrite to display `MealEntry` with optional label and status badge
- [ ] Remove fixed slot labels (breakfast/lunch/dinner)
- [ ] Add status badge (planned/in_progress/completed/skipped)
- [ ] Add tap-to-cycle status functionality
- [ ] Viewer: No edit/remove buttons

### DayRow.tsx
- [ ] Rewrite to display flexible `MealEntry[]` array
- [ ] Show status indicators per meal

### MealsPerDayPicker.tsx
- [ ] Repurpose as generation prompt (1/2/3/4 meals)
- [ ] Show as dialog/modal when generating

### EmptyState.tsx
- [ ] Update to show appropriate messages based on role
- [ ] Viewer: "Ask your household admin to plan meals"
- [ ] Admin/Editor: "No meals planned yet. Generate a plan!"

---

### 1.8 Preferences Manager 🔴 HIGH
**Files**: `src/services/preferenceManager.ts`
- [ ] Remove `getMealsPerDay`, `setMealsPerDay` (no longer stored)
- [ ] Remove `getWeekStartDay`, `setWeekStartDay` (now household-level)
- [ ] Keep: `getDisplayName`, `setDisplayName`
- [ ] Keep: `isSeedDataLoaded`, `setSeedDataLoaded`
- [ ] Update: localStorage wrapper for remaining preferences

**Reference**:
- `docs/FOOD_GEN_DATA_STRUCTURE.md` → Section 3.9 (User Preferences)

---

### 1.9 Security Rules (Update) 🔴 HIGH
**Files**: Firebase Console → Firestore → Rules

- [ ] Add rules for `households/{householdId}` — read by members, create by auth
- [ ] Add rules for `households/{id}/members/{uid}` — read by members, create by self
- [ ] Add rules for `households/{id}/joinRequests/{uid}` — create by anyone, update by admin
- [ ] Add rules for `households/{id}/invites/{inviteId}` — create by admin, update by invitee
- [ ] Add rules for `households/{id}/plans/{date}` — read by members, write by admin/editor, status update by all
- [ ] Add rules for `households/{id}/inviteCodes/{codeId}` — read/write by admin
- [ ] Add rules for `households/{id}/activityLog/{logId}` — read by members, write by admin/editor

**Reference**:
- `docs/FOOD_GEN_DATA_STRUCTURE.md` → Section 6 (Security Rules)

---

## Phase 2: Enhanced Features (Medium Priority)

### 2.1 Activity Log 🟡 MEDIUM
**Files**: Create `src/services/activityLogger.ts`
- [ ] Create function to log actions to `households/{id}/activityLog/{logId}`
- [ ] Log: plan created, regenerated, manually edited, status updated
- [ ] Show Activity Log in Household Management page

### 2.2 Invite Code History 🟡 MEDIUM
**Files**: Update context + household management page
- [ ] When generating new code, add record to `inviteCodes/` subcollection
- [ ] Mark old codes as inactive
- [ ] Show code history in Household Management

### 2.3 Viewer Suggestions 🟢 LOW
**Files**: Create suggestion flow
- [ ] Add "Suggest Swap" option to meal cards (viewer only)
- [ ] Add suggestion approval UI in Household Management

### 2.4 Email/Password Account Recovery 🟢 LOW
- [ ] Add "Forgot Password" link to login page
- [ ] Implement password reset via Firebase Auth

---

## Phase 3: Testing (Medium Priority)

### 3.1 Test Household Flow
- [ ] Test sign-up with email/password
- [ ] Test login
- [ ] Test create household
- [ ] Test join via invite code
- [ ] Test admin direct invite
- [ ] Test accept/reject join requests
- [ ] Test accept/reject invites
- [ ] Test role management

### 3.2 Test Meal Planning
- [ ] Test generate day plan with meal count prompt
- [ ] Test generate week plan
- [ ] Test regenerate day (confirmation dialog)
- [ ] Test per-meal status updates
- [ ] Test add/remove meal from day

### 3.3 Test Role-Based Access
- [ ] Admin: Full access (generate, edit, manage members)
- [ ] Editor: Generate, edit plans (no member management)
- [ ] Viewer: View only + update meal status (no generate/edit)

### 3.4 Test Cross-Device Sync
- [ ] Login on Device A → create household → generate plan
- [ ] Login on Device B → join household → see same plan
- [ ] Update status on Device A → appears on Device B
- [ ] Regenerate on Device B → appears on Device A

---

## Phase 4: Deployment (Low Priority)

### 4.1 Production Build
- [x] Build production bundle (`npm run build`)
- [x] Test production build locally

### 4.2 Hosting
- [x] Deploy to Firebase Hosting
- [ ] Test on actual iPhone via network
- [ ] Set up custom domain (optional)

### 4.3 Polish
- [ ] Add loading spinners
- [ ] Add error handling
- [ ] Improve mobile responsiveness
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add PWA support (service worker)

---

## Dependency Map

```
Types (1.1) ──► Auth (1.2) ──► Firestore (1.3)
                                    │
                                    ▼
                           Generator (1.4)
                                    │
                                    ▼
                        Context (1.5) ──► Pages (1.6)
                                              │
                                              ▼
                                     Components (1.7)
                                              │
                                              ▼
                               Preferences (1.8)
                               Security Rules (1.9)
```

**Every task in Phase 1 must be completed before moving to Phase 2.**

---

## Notes

- **Everything in Phase 1 needs to be REWRITTEN**, not refactored. The old code was built for a completely different architecture.
- **Starting Order**: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9
- **Task 1.5 (Context)** is the largest and most complex — it ties everything together.
- **Phase 2+** features can be deferred to later releases.

---

*Document version 2.0 — June 2026 (Corrected: all Phase 1 marked as REWORK, not completed)*