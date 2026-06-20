# FoodGen Web App — User Journeys Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Journey 1: Sign-Up](#2-journey-1-sign-up)
3. [Journey 2: Household Dashboard (Gateway Screen)](#3-journey-2-household-dashboard-gateway-screen--redesigned)
4. [Journey 3: Admin — Create Household](#4-journey-3-admin--create-household)
5. [Journey 4: Join Household via Invite Code](#5-journey-4-join-household-via-invite-code)
6. [Journey 5: Admin — Manage Join Requests](#6-journey-5-admin--manage-join-requests)
7. [Journey 6: Login (Returning User)](#7-journey-6-login-returning-user)
8. [Journey 7: Day View (Shared Household Plan)](#8-journey-7-day-view-shared-household-plan)
9. [Journey 8: Week View (Shared Household Plan)](#9-journey-8-week-view-shared-household-plan)
10. [Journey 9: Add Custom Meal](#10-journey-9-add-custom-meal)
11. [Journey 10: Settings](#11-journey-10-settings)
12. [Journey 11: Household Management Page](#12-journey-11-household-management-page)
13. [Journey 12: Meal Detail Modal](#12-journey-12-meal-detail-modal)
14. [Data Structure Validation](#14-data-structure-validation)
15. [Summary of Changes](#15-summary-of-changes)

---

## 1. Overview

This document maps out all user journeys in FoodGen to:
- Ensure all user actions are covered
- Validate the data structure supports all features
- Identify missing features or data requirements
- Provide a reference for implementation

### Current Status
- ✅ = Implemented
- 🚧 = Partially implemented
- ❌ = Not implemented

### Key Architectural Change

**Meal plans are now household-level, not user-level.**
- Users CANNOT plan meals without belonging to a household
- All household members see the SAME shared meal plan
- Roles determine what each member can do (admin/editor/viewer)
- Meals are stored in a flexible `meals[]` array with optional labels and per-meal cooking status

---

## 2. Journey 1: Sign-Up

**Status**: 🚧 Needs update (currently uses anonymous auth)  
**Trigger**: First-time user opens app  
**Goal**: Create account

### Flow

```
[App Opens]
    ↓
[Check: Is user logged in?]
    ├── NO → [Show Sign-Up / Login Page]
    │         ↓
    │   [User enters:]
    │   - Name (required)
    │   - Email (required)
    │   - Password (required, min 6 characters)
    │         ↓
    │   [User taps "Sign Up"]
    │         ↓
    │   [Firebase Auth creates account]
    │   - No email verification
    │         ↓
    │   [Save profile to Firestore]
    │   - uid, displayName, email
    │   - householdId: null (not in household yet)
    │   - householdRole: null
    │         ↓
    │   [Save preferences]
    │   - displayName
    │   - onboardingComplete: true
    │         ↓
    │   [Navigate to Household Dashboard]
    │   - User must create or join a household
    │         ↓
    └── YES → [Go to Journey 6: Login]
```

### Data Written

**Collection**: `users/{uid}/profile/main`
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  householdId: null;      // NOT in a household yet
  householdRole: null;     // NO role yet
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Collection**: `users/{uid}/preferences/main`
```typescript
{
  displayName: string;
  onboardingComplete: true;
  seedDataLoaded: true;
  updatedAt: timestamp;
}
```

**Note**: `mealsPerDay` and `weekStartDay` have been removed from User Preferences. `weekStartDay` is now a household-level setting (set when creating the household). `mealsPerDay` is chosen per-generation.

---

## 3. Journey 2: Household Dashboard (Gateway Screen — REDESIGNED)

**Status**: ❌ Not implemented (NEW)  
**Trigger**: User signs up or logs in  
**Goal**: Show household status, pending invites, and options

### Flow

```
[User signs up or logs in]
    ↓
[Load user profile]
    ↓
[Load ALL households to find pending invites matching user's email]
- Query households/{id}/invites/ where status=pending AND invitedEmail matches
    ↓
[Show Household Dashboard — NOT Day/Week page]
    ↓
{User has householdId?}
    ├── YES → [Show linked household info]
    │         - Household name, address
    │         - Your role (Admin/Editor/Viewer)
    │         - Members list
    │         - Button: "Go to Meal Plans" (Day/Week)
    │         - Button: "Household Settings"
    │
    ├── NO → [Show "No household" message]
    │         - "You are not part of any household yet."
    │         - Button: "Create Household" → Journey 3
    │         - Button: "Join Household"  → Journey 4
    │
    └── [ALWAYS check for pending invites]
        {Pending invites found?}
            ├── YES → [Show "Pending Invitations" section ABOVE other content]
            │         For each invite:
            │         - Household name
            │         - Invited by: [admin name]
            │         - Role offered: Viewer/Editor
            │         - [✓ Accept] [✗ Reject] buttons
            │
            └── NO → (no section shown)
```

### Important Rules

1. **No household = No meal planning** — user must create or join first
2. **Household Dashboard is the GATEWAY** — always shown after login before Day/Week
3. **Pending invites are checked on EVERY login**
4. User CAN only access Settings while not in a household
5. Day/Week pages are BLOCKED until user has a linked household

---

## 4. Journey 3: Admin — Create Household

**Status**: ❌ Not implemented (NEW)  
**Trigger**: User taps "Create my own household"  
**Goal**: Create a household and become admin

### Flow

```
[User taps "Create Household"]
    ↓
[Show form:]
- Household name * (required)
- Address *
  - Street *
  - City *
  - State *
  - Postcode *
  - Country *
- Week start day (monday or sunday, default: monday)
- Timezone (optional, default: Australia/Sydney)
- Description (optional)
    ↓
[User taps "Create Household"]
    ↓
[System generates:]
- householdId (auto-generated Firestore ID)
- inviteCode (e.g., "SMITH-JUN2026")
- codeExpiresAt (30 days from now)
    ↓
[Write to Firestore:]
1. households/{householdId} (with address, weekStartDay, inviteCode, codeExpiresAt)
2. households/{householdId}/members/{uid} (role: admin)
3. Update user profile: householdId, householdRole: 'admin'
    ↓
[Show success screen:]
- "🎉 Household created!"
- Invite code to share: "SMITH-JUN2026"
- Button: "Go to My Meal Plan"
- Button: "Share Invite Code"
    ↓
[User can now plan meals]
```

### Data Written

**Collection**: `households/{householdId}`
```typescript
{
  name: "Smith Family",
  address: {
    street: "123 George St",
    city: "Sydney",
    state: "NSW",
    postcode: "2000",
    country: "Australia"
  },
  weekStartDay: "monday",
  timezone: "Australia/Sydney",
  description: "The Smith family meal plan",
  inviteCode: "SMITH-JUN2026",
  codeExpiresAt: "2026-07-20T00:00:00Z",
  createdBy: "abc123",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Collection**: `households/{householdId}/members/{uid}`
```typescript
{
  uid: "abc123",
  displayName: "Mishari",
  email: "mishari@example.com",
  role: "admin",
  joinedAt: timestamp
}
```

---

## 5. Journey 4: Join Household via Invite Code

**Status**: ❌ Not implemented (NEW)  
**Trigger**: User taps "Join an existing household"  
**Goal**: Send a request to join a household

### Flow

```
[User taps "Join Household"]
    ↓
[Show form:]
- Invite code * (e.g., "SMITH-JUN2026")
- Requested role: (optional, default: viewer)
  - Viewer (can only view meals)
  - Editor (can help plan meals)
    ↓
[User taps "Send Request"]
    ↓
[System looks up household by inviteCode]
    ↓
{Code valid?}
    ├── NO → [Show error: "Invalid invite code"]
    │
    ├── EXPIRED → [Show error: "This code expired on [date]"]
    │
    └── YES → [Create join request]
              ↓
      [Write to Firestore:]
      1. households/{householdId}/joinRequests/{uid}
         - status: 'pending'
         - requestedRole: 'viewer' (or 'editor')
         - requestedAt: now
              ↓
      [Show success screen:]
      - "✅ Request sent!"
      - "Waiting for admin approval..."
      - Button: "Check Status"
              ↓
      [User waits for admin to accept/reject]
```

### Data Written

**Collection**: `households/{householdId}/joinRequests/{uid}`
```typescript
{
  uid: "def456",
  displayName: "Jane Smith",
  email: "jane@example.com",
  status: "pending",
  requestedRole: "viewer",
  requestedAt: timestamp
}
```

---

## 6. Journey 5: Admin — Manage Join Requests

**Status**: ❌ Not implemented (NEW)  
**Trigger**: Admin opens Settings → Household → "Pending Requests"  
**Goal**: Accept or reject join requests

### Flow

```
[Admin opens Household Management page]
    ↓
[System queries households/{householdId}/joinRequests]
    ↓
{Any pending requests?}
    ├── NO → [Show "No pending requests"]
    │
    └── YES → [Show pending requests list:]
              ↓
      [For each request:]
      - Display name + email
      - Requested role: "Viewer" or "Editor"
      - Requested date
      - [✓ Accept] [✗ Reject] buttons
              ↓
      {Admin taps Accept}
          ↓
      [Write to Firestore:]
      1. households/{householdId}/members/{uid}
         - role: admin's choice (can change)
      2. Update joinRequest: status: 'accepted'
      3. User's profile: householdId, householdRole: role
              ↓
      [Show success: "Jane Smith accepted!"]
              ↓
      {Admin taps Reject}
          ↓
      [Update joinRequest: status: 'rejected']
              ↓
      [Show success: "Request rejected"]
```

---

## 7. Journey 6: Login (Returning User)

**Status**: 🚧 Needs update  
**Trigger**: User opens app after signing up  
**Goal**: Restore user's data and redirect

### Flow

```
[App Opens]
    ↓
[Check: Is user logged in?]
    ├── NO → [Show Login Screen]
    │         ↓
    │   [User enters email + password]
    │         ↓
    │   [Firebase Auth signs in]
    │         ↓
    └── YES → [Load user data]
              ↓
      [Load preferences from Firestore]
              ↓
      [Check: Does user have householdId?]
         ├── NO → [Redirect to Household Dashboard]
         │         (Journey 2: Create or Join)
         │
         └── YES → [Load household data]
                    ↓
            [Load household members]
            - Get role (admin/editor/viewer)
                    ↓
            [Load household settings]
            - weekStartDay, timezone, description
                    ↓
            [Load reference meals]
            - Query referenceMeals/ collection
                    ↓
            [Load household plans]
            - Query households/{householdId}/plans/{date}
            - Parse meals[] array
                    ↓
            [Enrich plans with meal data]
            - Match mealIds to meal documents
                    ↓
            [Navigate to Day View]
            - If viewer: no "Generate" button visible
            - All roles: can update meal statuses
```

---

## 8. Journey 7: Day View (Shared Household Plan)

**Status**: 🚧 Needs major rework (was per-user, now shared)  
**Trigger**: User taps "Day" tab  
**Goal**: Show the household's meal plan for a specific date

### Flow

```
[Day Page Loads]
    ↓
[Check: User role?]
    ├── admin/editor → [Show generation controls]
    │   - Generate, Regenerate buttons
    │   - Can add/remove/edit meals
    │
    └── viewer → [Show status-only view]
        - No generate/edit buttons
        - Can update meal status only
    ↓
[Show date picker]
- Default: Today
    ↓
[Load household plan for selected date]
- Query: households/{householdId}/plans/{date}
    ↓
{Plan exists?}
    ├── YES → [Display meals[] array]
    │         For each meal in meals[]:
    │         - Show emoji, name, prep time, difficulty
    │         - Show optional label tag (breakfast/lunch/dinner/snack)
    │         - Show current status badge: planned/in_progress/completed/skipped
    │         - Tap card → open Meal Detail Modal
    │         - Tap status → cycle to next status
    │         - Admin/Editor: can edit/remove meal from array
    │
    └── NO → [Show Empty State]
              - "No meals planned for this date"
              - Admin/Editor: "Generate Meals" button
              - Viewer: "Ask the household admin to plan meals"
    ↓
{Admin/Editor taps Generate}
    ↓
[Show prompt: "How many meals for this day?"]
- Select: 1 / 2 / 3 / 4 (or custom number)
- Optional: add labels (breakfast, lunch, dinner, snack)
- Or leave labels empty
    ↓
[Generate random plan]
- Pick random meals from referenceMeals + custom meals
- Ensure no repeats within the week
- Save to: households/{householdId}/plans/{date}
  - meals[] with status: 'planned' for all entries
  - Labels: as chosen by user (or empty)
- Update UI (all members see it)
```

### Data Operations

**Read**:
- `households/{householdId}/plans/{date}` - Shared household plan
- `households/{householdId}/members/{uid}` - Check role permissions

**Write** (admin/editor only):
- `households/{householdId}/plans/{date}` - Create/modify meals

**Write** (all roles):
- `households/{householdId}/plans/{date}` - Update meal statuses only

---

## 9. Journey 8: Week View (Shared Household Plan)

**Status**: 🚧 Needs major rework  
**Trigger**: User taps "Week" tab  
**Goal**: Show the full week meal plan

### Flow

```
[Week Page Loads]
    ↓
[Check: User role?]
    ├── admin/editor → [Show generation controls]
    └── viewer → [Show read-only + status update]
    ↓
[Show week picker]
- Date input showing week start date
- Week start day from household settings
    ↓
[Load week plans]
- Query: households/{householdId}/plans/ (by weekOfYear)
    ↓
{Week has plans?}
    ├── YES → [Show collapsible day rows]
    │         - Each day shows meals[] with status indicators
    │         - All members: tap meal to update status
    │         - Admin/Editor: each day has [↻] regenerate
    │         - Show action button: "Generate This Week"
    │
    └── NO → [Show Empty State]
              - "No weekly plan yet"
              - Admin/Editor: "Generate Weekly Plan" button
    ↓
{Admin/Editor taps Generate}
    ↓
[Show prompt: "How many meals per day this week?"]
- Select: 1 / 2 / 3 / 4 (same count applied to all 7 days)
- Optional: add labels or leave empty
    ↓
[Generate week plan]
- Same count applied to each day
- Save meals[] with status 'planned'
- Labels as chosen
```

---

## 10. Journey 9: Add Custom Meal

**Status**: ✅ Same as before (not affected by household change)  
**Trigger**: User taps [+] button  
**Goal**: Add user-created meal to their personal collection

### Note

Custom meals are **still per-user**. They are:
- Private to the user who created them
- Used in the household plan generation
- Visible to household members only through generated plans

---

## 11. Journey 10: Settings

**Status**: 🚧 Partially implemented  
**Trigger**: User taps gear icon ⚙️  
**Goal**: Manage settings

### Features

1. **Meals Per Day** (REMOVED — now chosen per-generation when generating meals)

2. **Household Section** (NEW)
   - Show household name + address
   - Show your role (Admin/Editor/Viewer)
   - Admin: "Manage Household" link
   - Admin: "Pending Requests" link
   - Admin: "Generate New Invite Code" button
   - Editor: "Leave Household" button
   - Viewer: "Leave Household" button

3. **Account Section**
   - Display name
   - Logout

---

## 12. Journey 11: Household Management Page

**Status**: ❌ Not implemented (NEW)  
**Trigger**: Admin taps "Manage Household" in Settings  
**Goal**: Full household management

### Features

**Admin View:**
```
[Household Management Page]
    ↓
[Household Info]
- Name: Smith Family
- Address: 123 George St, Sydney, NSW 2000
- Week Start Day: Monday
- Timezone: Australia/Sydney
- Description: The Smith family meal plan
- Max Members: 5 (2 remaining)
- Invite Code: SMITH-JUN2026 (Expires: July 20, 2026)
  [Generate New Code] button
    ↓
[Members] (Members: 3 / Max: 5)
- Mishari (You) — Admin
- Jane Smith — Viewer
- John Smith — Editor
  ↓
  [Click member] → [Change Role] or [Remove Member]
    ↓
[Pending Requests] (2 pending — badge count)
- Jane Smith — requested Viewer — [Accept] [Reject]
- Mark — requested Editor — [Accept] [Reject]
    ↓
[Invite Code History] (NEW)
- SMITH-JUN2026 — Active — Used 2 times — Expires Jul 20
- SMITH-MAY2026 — Expired — Used 1 time — Generated by Mishari
- [View All Codes]
    ↓
[Activity Log] (NEW)
- Jun 20: Mishari regenerated Week 26 — 2 hours ago
- Jun 19: John updated meal status on Jun 20 — 1 day ago
- Jun 18: Mishari created household — 2 days ago
- [View All Activity]
    ↓
[Invite Code Management]
- Current: SMITH-JUN2026 (expires 2026-07-20)
- [Regenerate Code] → creates new code, old one invalidated in history
- Set expiry: [7 days] [30 days] [90 days] [Custom]
- Max members: [5] (0 = unlimited)
```

**Editor/Viewer View:**
```
[Household Info]
- Name: Smith Family
- Your Role: Viewer
- Admin: Mishari (mishari@example.com)
- Members: Mishari (Admin), Jane Smith (Viewer), John Smith (Editor)
    ↓
[Suggest a Meal Swap] (NEW — if viewer)
- Tap any meal → "Suggest Swap"
- Pick replacement meal from list
- Add reason (optional)
- Status: Pending / Approved / Rejected
    ↓
[Activity Log] (NEW — read-only)
- See recent changes to meal plans
- Who changed what and when
    ↓
[Leave Household] button
- Confirmation: "Are you sure? You'll lose access to meal plans."
```

---

## 13. Journey 12: Meal Detail Modal

**Status**: ✅ Unchanged  
**Trigger**: User taps a meal card  
**Goal**: Show full meal details

No changes needed — meal content is the same regardless of household.

---

## 14. Data Structure Validation

### Collections Used by Each Journey

| Journey | Collections | Status |
|---------|-------------|--------|
| Sign-Up | `users/{uid}/profile`, `users/{uid}/preferences` | ✅ |
| Create Household | `households/{id}`, `members/{uid}`, `inviteCodes/{codeId}`, user profile | ✅ |
| Join (Request) | `joinRequests/{uid}` | ✅ |
| Admin Accept/Reject | `joinRequests/{uid}`, `members/{uid}`, user profile | ✅ |
| Login | user profile, preferences | ✅ |
| Day View | `households/{id}/plans/{date}`, referenceMeals | ✅ |
| Week View | `households/{id}/plans/`, referenceMeals | ✅ |
| Add Custom Meal | `users/{uid}/customMeals` | ✅ |
| Settings | user profile, preferences | ✅ |
| Household Management | `households/{id}`, `members/`, `joinRequests/`, `inviteCodes/`, `activityLog/` | ✅ |
| Suggest Meal Swap | `households/{id}/suggestions/` (future) | 🚧 |

### What Changed (Latest Version)

| Old | New | Reason |
|-----|-----|--------|
| 4 fixed meal slots (breakfastId, lunchId, dinnerId, snackId) | Flexible `meals[]` array with `{mealId, label?, status}` | Allow flexible meal count + optional labels |
| No cooking tracking | Per-meal status: planned/in_progress/completed/skipped | Track meal progress |
| `mealsPerDay` in user preferences | Chosen per-generation | More flexible |
| `weekStartDay` in user preferences | In household settings | Household-level decision |
| Only admin/editor can write plans | All members can update meal status | Enable progress tracking |

### Additional Changes (Carried Over)

| Change | Description |
|--------|-------------|
| Plans per user → Plans per household | Shared view across household |
| admin/member roles → admin/editor/viewer | Role-based access |
| No join requests → joinRequests collection | Approval-based joining |
| No admin invites → invites collection | Admin can invite via email |
| No invite code history → inviteCodes collection | Track code generations |
| No activity tracking → activityLog collection | Audit plan changes |
| No viewer input → suggestions collection (future) | Viewers can suggest swaps |
| No member limit → maxMembers field | Control household size |

---

## 15. Summary of Changes

### New Journeys Created
1. **Journey 3**: Create Household (admin)
2. **Journey 4**: Join via Invite Code
3. **Journey 5**: Admin Manage Requests
4. **Journey 11**: Household Management Page

### Journeys Updated (This Version)
1. **Journey 1**: Sign-Up → removed `mealsPerDay` and `weekStartDay` from preferences
2. **Journey 2**: Household Dashboard as gateway (checks pending invites)
3. **Journey 3**: Create Household → added `weekStartDay` to household form
4. **Journey 6**: Login → redirects to Household Dashboard, not Day page
5. **Journey 7**: Day View → flexible `meals[]` array, per-meal status, generate prompt
6. **Journey 8**: Week View → flexible `meals[]` array, generate prompt for meal count
7. **Journey 10**: Settings → removed `mealsPerDay`, updated household section
8. **Journey 11**: Household Management → added `weekStartDay`, activity log with `status_updated`

### Recommendations Added to Documentation

| Recommendation | Status | Section |
|----------------|--------|---------|
| Activity Log | Added to Household Management UI | Journey 11 |
| Invite Code History | Added to Household Management UI | Journey 11 |
| Viewer Suggestions | Added to Viewer UI | Journey 11 |
| Household Limits | Added (`maxMembers` field) | Journey 3 |

### Key Constraint
**User CANNOT access meal planning features without a household.** This is checked on:
- Every login
- Every page navigation
- Every "Generate" button tap

---

*Document version 4.2 — June 2026 (Meals array with flexible labels + per-meal status)*