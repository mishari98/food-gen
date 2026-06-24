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
| CreateHouseholdPage | ✅ Completed | Integrated into HouseholdDashboard |
| JoinHouseholdPage | ✅ Completed | Integrated into HouseholdDashboard |
| DayPage | ✅ Completed | Firestore-only, generate/add/remove meals |
| WeekPage | ✅ Completed | Weekly plan with collapsible days |
| HistoryPage | ✅ Completed | Rewritten for household-driven architecture |
| SettingsPage | ✅ Completed | Household info, manage link, sign out |
| HouseholdManagementPage | ✅ Completed | Members, invites, join requests, activity log, invite code history |
| AddMealPage | ✅ Completed | Fixed data format (arrays instead of JSON strings) |
| MealDetailModal | ✅ Complete | No changes needed |

### 1.7 Components (Update) 🟡 MEDIUM

| Component | Status | Notes |
|-----------|--------|-------|
| MealCard.tsx | ✅ Complete | Status badges, remove, flex meals, suggest swap |
| DayRow.tsx | ✅ Complete | Rewritten for flexible meals[] array |
| EmptyState.tsx | ✅ Complete | Role-based messages |
| LoadingSpinner.tsx | ✅ Complete | Simple spinner component |
| DifficultyBadge.tsx | ✅ Complete | No changes needed |
| MealDetailModal.tsx | ✅ Complete | No changes needed |
| MealsPerDayPicker.tsx | ✅ Complete | Repurposed as generation prompt (1-4 meals) |

### 1.8 Preferences Manager 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `src/services/preferenceManager.ts`
- [x] Remove `getMealsPerDay`, `setMealsPerDay`
- [x] Remove `getWeekStartDay`, `setWeekStartDay`
- [x] Keep: `getDisplayName`, `setDisplayName`
- [x] Keep: `isSeedDataLoaded`, `setSeedDataLoaded`
- [x] Update: Firestore wrapper for remaining preferences

### 1.9 Security Rules 🔴 HIGH
**Status**: ✅ Completed  
**Files**: `firestore.rules` — deployed and active

---

## Phase 2: Enhanced Features (Medium Priority)

### 2.1 Activity Log 🟡 MEDIUM
**Status**: ✅ Completed
- [x] Create activity logger service (`src/services/activityLogger.ts`)
- [x] Log: plan created, regenerated, manually edited, status updated
- [x] Show Activity Log in Household Management page
- [x] Real-time listener for activity feed

### 2.2 Invite Code History 🟡 MEDIUM
**Status**: ✅ Completed
- [x] Track old invite codes as inactive
- [x] Show code history in Household Management
- [x] Real-time listener for invite codes

### 2.3 Viewer Suggestions 🟢 LOW
**Status**: ✅ Completed
- [x] Add "Suggest Swap" option to meal cards
- [x] Add suggestion approval UI
- [x] Firestore `suggestions` subcollection
- [x] Real-time listener for pending suggestions

### 2.4 Email/Password Account Recovery 🟢 LOW
**Status**: ✅ Completed
- [x] Add "Forgot Password?" link
- [x] Implement password reset modal
- [x] Use Firebase `sendPasswordResetEmail()`
- [x] Show success/error feedback

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
- [x] Live at: https://foodgen-85dbb.web.app

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

### 🔴 High Priority (Next Steps)
1. **Testing** — Complete household flow, meal planning, role-based access
2. **Cross-Device Sync** — Verify real-time sync works across devices

### 🟡 Medium Priority
3. **Admin Direct Invite** — Send invite email to user
4. **Join Request Flow** — Accept/reject join requests UI

### � Low Priority
5. **PWA Support** — Service worker for offline caching
6. **Mobile Responsiveness** — Improve CSS for mobile devices
7. **Error Handling** — Add user-friendly error messages

---

## Completed Features Summary

### ✅ Phase 1: Foundation (Complete)
- Firebase Auth (email/password)
- Firestore database with real-time sync
- Household create/join system
- Day/Week/History meal planning
- Custom meals
- Configurable meals per day (1-4)
- Meal status tracking

### ✅ Phase 2: Enhanced Features (Complete)
- Activity logging with real-time feed
- Invite code history (active/inactive tracking)
- Viewer suggestions (swap proposals)
- Email/password recovery

### 🚀 Live App
**URL**: https://foodgen-85dbb.web.app  
**Firebase Project**: foodgen-85dbb  
**Platform**: Web (React + TypeScript + Vite + Firebase)

---

*Document version 2.3 — June 2026 (All Phase 1 & 2 features complete)*