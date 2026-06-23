# FoodGen Web — Implementation Task List

## How to Use This Document

- **Checklist format**: `- [ ]` = incomplete, `- [x] = completed`
- **Priority levels**: 🔴 High, 🟡 Medium, 🟢 Low
- **References**: Links to relevant sections in other docs
- **Update this file** as tasks are completed

---

## Phase 0: Database Cleanup

**Status**: ✅ **COMPLETE**

---

## Phase 1: Foundation REWORK

### Priority Order: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9

---

### 1.1 TypeScript Types (Rewrite) 🔴 HIGH
**Status**: ✅ Completed

### 1.2 Firebase Auth 🔴 HIGH
**Status**: ✅ Completed

### 1.3 Firestore Service 🔴 HIGH
**Status**: ✅ Completed

### 1.4 Meal Plan Generator 🔴 HIGH
**Status**: ✅ Completed

### 1.5 MealPlanContext 🔴 HIGH
**Status**: ✅ Completed

### 1.6 Pages 🔴 HIGH

| Page | Status | Notes |
|------|--------|-------|
| OnboardingPage | ✅ Completed | Sign-up/login with email/password |
| HouseholdDashboard | ✅ Completed | Gateway after login, create/join household |
| **CreateHouseholdPage** | ❌ Not Started | Form: name, address, weekStartDay, etc. |
| **JoinHouseholdPage** | ❌ Not Started | Form: invite code, role selector |
| DayPage | ✅ Completed | Firestore-only, generate/add/remove meals |
| WeekPage | ✅ Completed | Weekly plan with collapsible days |
| **HistoryPage** | ✅ Completed | Rewritten for household-driven architecture |
| SettingsPage | ✅ Completed | Household info, manage link, sign out |
| HouseholdManagementPage | ✅ Completed | Members, invites, join requests |
| AddMealPage | ✅ Completed | Fixed data format (arrays instead of JSON strings) |
| MealDetailModal | ✅ Complete | No changes needed |

### 1.7 Components (Update) 🟡 MEDIUM

| Component | Status | Notes |
|-----------|--------|-------|
| MealCard.tsx | ✅ Complete | Status badges, remove, flex meals |
| DayRow.tsx | ✅ Complete | Rewritten for flexible meals[] array |
| EmptyState.tsx | ✅ Complete | Role-based messages |
| LoadingSpinner.tsx | ✅ Complete | Simple spinner component |
| DifficultyBadge.tsx | ✅ Complete | No changes needed |
| MealDetailModal.tsx | ✅ Complete | No changes needed |
| **MealsPerDayPicker.tsx** | ❌ Not Started | Repurpose as generation prompt |

### 1.8 Preferences Manager 🔴 HIGH
**Status**: ❌ Not Started  
**Files**: `src/services/preferenceManager.ts`
- [ ] Remove `getMealsPerDay`, `setMealsPerDay`
- [ ] Remove `getWeekStartDay`, `setWeekStartDay`
- [ ] Keep: `getDisplayName`, `setDisplayName`
- [ ] Keep: `isSeedDataLoaded`, `setSeedDataLoaded`
- [ ] Update: localStorage wrapper for remaining preferences

### 1.9 Security Rules 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `firestore.rules` — deployed and active

---

## Phase 2: Enhanced Features (Medium Priority)

### 2.1 Activity Log 🟡 MEDIUM
- [ ] Create activity logger service
- [ ] Log: plan created, regenerated, manually edited, status updated
- [ ] Show Activity Log in Household Management page

### 2.2 Invite Code History 🟡 MEDIUM
- [ ] Track old invite codes as inactive
- [ ] Show code history in Household Management

### 2.3 Viewer Suggestions 🟢 LOW
- [ ] Add "Suggest Swap" option to meal cards
- [ ] Add suggestion approval UI

### 2.4 Email/Password Account Recovery 🟢 LOW
- [ ] Add "Forgot Password" link
- [ ] Implement password reset

---

## Phase 3: Testing

### 3.1 Test Household Flow
- [x] Sign-up with email/password
- [x] Login
- [x] Create household
- [x] Join via invite code
- [ ] Admin direct invite
- [ ] Accept/reject join requests
- [ ] Accept/reject invites
- [ ] Role management

### 3.2 Test Meal Planning
- [ ] Generate day plan with meal count prompt
- [ ] Generate week plan
- [ ] Regenerate day (confirmation dialog)
- [ ] Per-meal status updates
- [ ] Add/remove meal from day

### 3.3 Test Role-Based Access
- [ ] Admin: Full access
- [ ] Editor: Generate, edit plans
- [ ] Viewer: View only + update meal status

### 3.4 Test Cross-Device Sync
- [ ] Login on Device A → create household → generate plan
- [ ] Login on Device B → join household → see same plan
- [ ] Update status on Device A → appears on Device B

---

## Phase 4: Deployment

### 4.1 Production Build
- [x] Build production bundle (`npm run build`)
- [x] Test production build locally
- [x] Deploy to Firebase Hosting

### 4.2 Polish
- [ ] Add error handling
- [ ] Improve mobile responsiveness
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add PWA support (service worker)

---

## Critical Bug Fixes (Session 2026-06-23)

- [x] Fixed `getHousehold()` — was missing document ID (`snap.id`)
- [x] Fixed `getReferenceMeals()` — was doing `Number(d.id)` on string meal names → NaN
- [x] Fixed DayPage — removed localStorage fallback, now Firestore-only
- [x] Fixed DayPage — added proper error handling and debug logging
- [x] Fixed Firestore rules — added subcollection access for `profile`, `preferences`, `customMeals`

---

## Current Sprint Focus

### � High Priority (Next Steps)
1. **MealsPerDayPicker** — Repurpose as generation prompt
2. **Preferences Manager** — Clean up old prefs
3. **CreateHouseholdPage/JoinHouseholdPage** — Extract from dashboard if needed

### 🟡 Medium Priority
4. **Activity Log** — Track changes
5. **Testing** — Role-based access, cross-device sync

### 🟢 Low Priority
6. **Viewer Suggestions** — Suggest swap
7. **Password Reset** — Forgot password

---

*Document version 2.2 — June 2026*