# FoodGen Web App — Data Structure Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Core Entities](#2-core-entities)
3. [Firestore Collections](#3-firestore-collections)
   - 3.1 [Reference Meals](#31-reference-meals-shared)
   - 3.2 [User Profile](#32-user-profile)
   - 3.3 [Household](#33-household)
   - 3.4 [Household Members](#34-household-members)
   - 3.5 [Join Requests](#35-join-requests)
   - 3.6 [Household Invites](#36-household-invites-new--admin--user)
   - 3.7 [Custom Meals](#37-custom-meals-per-user)
   - 3.8 [Household Day Plans](#38-household-day-plans-shared)
   - 3.9 [User Preferences](#39-user-preferences)
   - 3.10 [Invite Code History](#310-invite-code-history-new)
   - 3.11 [Meal Suggestions](#311-meal-suggestions-future)
   - 3.12 [Plan Activity Log](#312-plan-activity-log-future)
4. [Data Relationships](#4-data-relationships)
5. [Household Management Flow](#5-household-management-flow)
6. [Security Rules](#6-security-rules)
7. [User Journeys Impact](#7-user-journeys-impact)
8. [Cost Comparison](#8-cost-comparison)
9. [Recommendations & Future Features](#9-recommendations--future-features)
10. [Summary of Changes](#10-summary-of-changes)

---

## 1. Overview

FoodGen is a meal planning app that supports:
- **Users with profile** (name, email, password via Firebase Auth)
- **Household-driven planning** — users CANNOT plan meals without being linked to a household
- **77 Filipino dishes** as reference data (stored ONCE, shared by all users)
- **Shared meal plans** — all household members see the same plan
- **Role-based access** — Admin (full control), Editor (can create/edit plans), Viewer (read-only)

### Design Principles

- **Household-first**: Meal planning is a household activity
- **Role-based**: Different levels of access depending on role
- **Efficient**: Reference data stored once, not duplicated per user
- **Flexible**: Meals can be assigned to any slot (breakfast, lunch, dinner, snack) — but slots are optional
- **Offline-first**: Firestore with IndexedDB persistence

### Data Storage Strategy

**Reference Data (Shared)**:
- 77 Filipino dishes stored ONCE in `referenceMeals/` collection
- All users query this collection for meal selection
- No duplication across users

**Household Data (Shared)**:
- Meal plans stored at household level (not per-user)
- All members see the same plan
- Invite codes, join requests managed here
- Week start day configured here

**User Data (Private)**:
- User profile, preferences, custom meals
- Stored in `users/{uid}/` subcollections
- Isolated per user

---

## 2. Core Entities

### 2.1 User Profile
- **Purpose**: Store user information (name, email)
- **Collection**: `users/{uid}/profile/main`
- **One-to-one**: Each Firebase Auth user has exactly one profile
- **Note**: Passwords are NOT stored here — handled by Firebase Authentication

### 2.2 Household
- **Purpose**: Group multiple users who share meal plans
- **Collection**: `households/{householdId}`
- **Members**: Linked via `householdMembers` subcollection
- **Address**: Each household has an address for reference
- **Settings**: Week start day, description, timezone stored here

### 2.3 Household Member
- **Purpose**: Link a user to a household with a role
- **Collection**: `households/{householdId}/members/{uid}`
- **Roles**: 
  - `admin` — full control (create/edit plans, manage members, accept/reject requests)
  - `editor` — can create and edit meal plans, regenerate
  - `viewer` — can only view the plan, cannot create or modify

### 2.4 Join Request (User → Household)
- **Purpose**: User requests to join an existing household
- **Collection**: `households/{householdId}/joinRequests/{uid}`
- **Direction**: User → Household (user initiates)
- **Statuses**: `pending`, `accepted`, `rejected`
- **Accepted**: becomes a household member

### 2.5 Household Invite (Admin → User)
- **Purpose**: Admin invites a user to join the household
- **Collection**: `households/{householdId}/invites/{inviteId}`
- **Direction**: Household → User (admin initiates)
- **Statuses**: `pending`, `accepted`, `rejected`
- **Accepted**: becomes a household member
- **Notified**: The invited user can see the invite on their dashboard

### 2.6 Reference Meals
- **Purpose**: 77 Filipino dishes available for ALL users
- **Collection**: `referenceMeals/{mealId}`
- **Shared**: Stored ONCE, read by all users
- **Read-only**: Users cannot modify reference meals

### 2.7 Custom Meals
- **Purpose**: User-created meals (unique to each user)
- **Collection**: `users/{uid}/customMeals/{mealId}`
- **Private**: Only visible to the user who created them

### 2.8 Household Day Plans (REDESIGNED)
- **Purpose**: Shared meal plans for the household with flexible meal entries
- **Collection**: `households/{householdId}/plans/{date}`
- **Shared**: All members see the same plan
- **Admin/Editor**: Can create, modify
- **Viewer**: Read-only
- **Meals**: Flexible array — each entry has a meal ID, optional label, and status
- **Labels**: Optional — user can label a meal as breakfast, lunch, dinner, snack, or leave empty
- **Status**: Track cooking progress per meal (planned, in_progress, completed, skipped)

### 2.9 User Preferences
- **Purpose**: App settings (display name, onboarding state)
- **Collection**: `users/{uid}/preferences/main`
- **Note**: `mealsPerDay` removed (now decided per-generation), `weekStartDay` moved to Household

---

## 3. Firestore Collections

### 3.1 Reference Meals (Shared)

**Path**: `referenceMeals/{mealId}`

```typescript
interface ReferenceMeal {
  id: number;                     // Numeric ID (1-77)
  name: string;                   // "Chicken Adobo"
  suggestedFor: string[];         // ["breakfast", "lunch", "dinner"]
  cuisine: string;                // "Filipino"
  dietaryTags: string[];          // ["gluten-free"]
  prepTimeMinutes: number;        // 40
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;                  // "🍗"
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  calories?: number;              // 480
  isReference: true;              // Marks this as a reference meal
  createdAt: timestamp;
}
```

---

### 3.2 User Profile

**Path**: `users/{uid}/profile/main`

```typescript
interface UserProfile {
  uid: string;                    // Firebase Auth UID
  displayName: string;            // "John Doe"
  email: string;                  // "john@example.com"
  // Note: Password is NOT stored here — handled by Firebase Authentication
  householdId?: string;           // Linked household ID (null if not in a household)
  householdRole?: 'admin' | 'editor' | 'viewer'; // Role in household
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Authentication Note**: 
- Passwords are handled by Firebase Authentication (separate from Firestore)
- We only store the user's UID, email, and profile data in Firestore

---

### 3.3 Household (UPDATED)

**Path**: `households/{householdId}`

```typescript
interface Household {
  name: string;                   // "Smith Family" (household name)
  address: HouseholdAddress;      // Household address
  inviteCode: string;             // Current active invite code "SMITH-JUN2026"
  codeExpiresAt: timestamp;       // Current invite code expiry date
  maxMembers: number;             // Maximum household members (default: 0 = unlimited)
  createdBy: string;              // UID of admin who created
  
  // Settings moved from User Preferences
  weekStartDay: 'monday' | 'sunday';  // When does the week start (default: monday)
  
  // Recommended additional fields
  description?: string;           // "The Smith family meal plan" (optional)
  timezone?: string;              // "Australia/Sydney" (for meal timing)
  
  createdAt: timestamp;
  updatedAt: timestamp;
}

interface HouseholdAddress {
  street: string;                 // "123 Main St"
  city: string;                   // "Sydney"
  state: string;                  // "NSW"
  postcode: string;               // "2000"
  country: string;                // "Australia"
  formattedAddress?: string;      // Full address string for display
}
```

**Example**:
```json
{
  "name": "Smith Family",
  "address": {
    "street": "123 George St",
    "city": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "country": "Australia"
  },
  "inviteCode": "SMITH-JUN2026",
  "codeExpiresAt": "2026-07-20T00:00:00Z",
  "maxMembers": 5,
  "createdBy": "abc123",
  "weekStartDay": "monday",
  "description": "The Smith family meal plan",
  "timezone": "Australia/Sydney",
  "createdAt": "2026-06-20T10:00:00Z",
  "updatedAt": "2026-06-20T10:00:00Z"
}
```

**Fields moved into Household**:
- `weekStartDay` (was in User Preferences) — now set per household

---

### 3.4 Household Members

**Path**: `households/{householdId}/members/{uid}`

```typescript
interface HouseholdMember {
  uid: string;                    // User's Firebase UID
  displayName: string;            // Cached for quick access
  email: string;                  // Cached for quick access
  role: 'admin' | 'editor' | 'viewer'; // Access level
  joinedAt: timestamp;
}
```

**Role Permissions**:

| Action | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| View meal plans | ✅ | ✅ | ✅ |
| Create/edit plans | ✅ | ✅ | ❌ |
| Regenerate meals | ✅ | ✅ | ❌ |
| Delete plans | ✅ | ✅ | ❌ |
| Accept/reject join requests | ✅ | ❌ | ❌ |
| Remove members | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ |
| Generate invite code | ✅ | ❌ | ❌ |
| Delete household | ✅ | ❌ | ❌ |

---

### 3.5 Join Requests

**Path**: `households/{householdId}/joinRequests/{uid}`

```typescript
interface JoinRequest {
  uid: string;                    // User's Firebase UID requesting to join
  displayName: string;            // User's name (cached)
  email: string;                  // User's email (cached)
  status: 'pending' | 'accepted' | 'rejected';
  requestedRole?: 'editor' | 'viewer'; // Requested role (default: viewer)
  requestedAt: timestamp;
  respondedAt?: timestamp;        // When admin accepted/rejected
  respondedBy?: string;           // UID of admin who responded
}
```

**Example**:
```json
{
  "uid": "def456",
  "displayName": "Jane Smith",
  "email": "jane@example.com",
  "status": "pending",
  "requestedRole": "viewer",
  "requestedAt": "2026-06-20T10:00:00Z"
}
```

**Accepted state**:
```json
{
  "uid": "def456",
  "displayName": "Jane Smith",
  "email": "jane@example.com",
  "status": "accepted",
  "requestedRole": "viewer",
  "requestedAt": "2026-06-20T10:00:00Z",
  "respondedAt": "2026-06-20T10:30:00Z",
  "respondedBy": "abc123"
}
```

---

### 3.6 Household Invites (NEW — Admin → User)

**Path**: `households/{householdId}/invites/{inviteId}`

```typescript
interface HouseholdInvite {
  inviteId: string;               // Auto-generated invite ID
  invitedEmail: string;           // Email of the invited user
  invitedUid?: string;            // UID of invited user (populated when they accept/reject)
  invitedDisplayName?: string;    // Name of invited user (populated after acceptance)
  invitedBy: string;              // UID of admin who sent the invite
  invitedByName: string;          // Name of admin who sent the invite (cached)
  role: 'editor' | 'viewer';      // Role being offered (default: viewer)
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: timestamp;
  respondedAt?: timestamp;        // When user accepted/rejected
}
```

**Example - Pending**:
```json
{
  "inviteId": "invite_abc123",
  "invitedEmail": "jane@example.com",
  "invitedUid": null,
  "invitedDisplayName": null,
  "invitedBy": "abc123",
  "invitedByName": "Mishari",
  "role": "viewer",
  "status": "pending",
  "createdAt": "2026-06-20T10:00:00Z"
}
```

**Example - Accepted**:
```json
{
  "inviteId": "invite_abc123",
  "invitedEmail": "jane@example.com",
  "invitedUid": "def456",
  "invitedDisplayName": "Jane Smith",
  "invitedBy": "abc123",
  "invitedByName": "Mishari",
  "role": "viewer",
  "status": "accepted",
  "createdAt": "2026-06-20T10:00:00Z",
  "respondedAt": "2026-06-20T12:00:00Z"
}
```

**Purpose**: Track invites sent by admin to specific users via email. The invited user can see all pending invites on their Household Dashboard and accept or reject them.

**How user discovers invites**:
- On login, app queries `households/{id}/invites/` where status is `pending` and `invitedEmail` matches the logged-in user's email
- Displays a "Pending Invites" section on the Household Dashboard

---

### 3.7 Custom Meals (Per User)

**Path**: `users/{uid}/customMeals/{mealId}`

```typescript
interface CustomMeal {
  id: number;                     // Auto-generated ID (100+)
  name: string;                   // "Pork Sisig"
  suggestedFor: string[];         // ["breakfast", "lunch", "dinner"]
  cuisine: string;                // "Filipino"
  dietaryTags: string[];          // ["gluten-free"]
  prepTimeMinutes: number;        // 40
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;                  // "🍳"
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  calories?: number;              // 480
  isCustom: 1;                    // Marks as user-created
  createdAt: timestamp;
}
```

---

### 3.8 Household Day Plans (REDESIGNED)

**Path**: `households/{householdId}/plans/{date}`

```typescript
interface HouseholdDayPlan {
  date: string;                   // "2026-06-20"
  weekOfYear: number;             // 25
  year: number;                   // 2026
  
  // Flexible meals array — replaces individual breakfastId/lunchId/dinnerId/snackId
  meals: MealEntry[];
  
  createdBy: string;              // UID of who created/modified
  lastModifiedBy: string;         // UID of last person to edit
  isGenerated: 0 | 1;             // 1 = auto-generated, 0 = manual
  createdAt: timestamp;
  updatedAt: timestamp;
}

interface MealEntry {
  mealId: number | null;          // Meal ID (from referenceMeals or customMeals), null = slot empty/unassigned
  label?: string;                 // Optional: "breakfast", "lunch", "dinner", "snack", or empty
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';  // Cooking progress
}
```

**Example**:
```json
{
  "date": "2026-06-20",
  "weekOfYear": 25,
  "year": 2026,
  "meals": [
    { "mealId": 1, "label": "breakfast", "status": "completed" },
    { "mealId": 5, "label": "lunch", "status": "in_progress" },
    { "mealId": 12, "label": "dinner", "status": "planned" },
    { "mealId": null, "label": "", "status": "planned" }
  ],
  "createdBy": "abc123",
  "lastModifiedBy": "abc123",
  "isGenerated": 1,
  "createdAt": "2026-06-20T10:00:00Z",
  "updatedAt": "2026-06-20T10:00:00Z"
}
```

**Status Meanings**:
| Status | Meaning |
|--------|---------|
| `planned` | Meal is scheduled but not started |
| `in_progress` | Currently cooking the meal |
| `completed` | Meal has been cooked/eaten |
| `skipped` | Skipped this meal (not cooked) |

**Label Flexibility**:
- Label is **optional** — can be empty string if user doesn't want to categorize
- Recommended labels: `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"`
- Users can use custom labels if desired

**Key Changes from Previous Design**:
- Removed: `breakfastId`, `lunchId`, `dinnerId`, `snackId` (4 separate fields)
- Added: `meals: MealEntry[]` (single flexible array)
- Added: Per-meal `status` for tracking cooking progress
- Added: Optional `label` field (replaces rigid slot assignment)

---

### 3.9 User Preferences (SIMPLIFIED)

**Path**: `users/{uid}/preferences/main`

```typescript
interface UserPreferences {
  displayName: string;            // "John"
  onboardingComplete: boolean;    // true
  seedDataLoaded: boolean;        // true
  updatedAt: timestamp;
}
```

**Example**:
```json
{
  "displayName": "John",
  "onboardingComplete": true,
  "seedDataLoaded": true,
  "updatedAt": "2026-06-20T10:00:00Z"
}
```

**Fields Removed**:
- `mealsPerDay` — REMOVED. Number of meals is now decided per-generation (admin/editor chooses how many meals when generating)
- `weekStartDay` — MOVED to Household (section 3.3). This is a household-level setting, not per-user.

**Fields Remaining**:
- `displayName` — User's display name
- `onboardingComplete` — Whether onboarding is done
- `seedDataLoaded` — Whether reference meals have been cached locally

---

### 3.10 Invite Code History (NEW)

**Path**: `households/{householdId}/inviteCodes/{codeId}`

```typescript
interface InviteCodeRecord {
  code: string;                   // "SMITH-JUN2026"
  generatedBy: string;            // UID of admin who generated
  generatedAt: timestamp;         // When generated
  expiresAt: timestamp;           // Expiry date
  isActive: boolean;              // true = current active, false = replaced/expired
  usedCount: number;              // Number of times this code was used to join
}
```

**Example**:
```json
{
  "code": "SMITH-JUN2026",
  "generatedBy": "abc123",
  "generatedAt": "2026-06-20T10:00:00Z",
  "expiresAt": "2026-07-20T00:00:00Z",
  "isActive": true,
  "usedCount": 2
}
```

**Purpose**: Track all invite codes generated for a household. When admin regenerates a code, old code becomes inactive, but history is preserved for auditing.

---

### 3.11 Meal Suggestions (FUTURE)

**Path**: `households/{householdId}/suggestions/{suggestionId}`

```typescript
interface MealSuggestion {
  suggestedBy: string;            // UID of viewer who suggested
  displayName: string;            // Viewer's name (cached)
  date: string;                   // "2026-06-20" (which date to change)
  mealIndex: number;              // Index in the meals[] array to replace
  currentMealId: number;          // Current meal ID
  suggestedMealId: number;        // Suggested replacement meal ID
  reason?: string;                // Optional reason for suggestion
  status: 'pending' | 'approved' | 'rejected';
  respondedBy?: string;           // UID of admin/editor who responded
  respondedAt?: timestamp;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Example**:
```json
{
  "suggestedBy": "def456",
  "displayName": "Jane Smith",
  "date": "2026-06-20",
  "mealIndex": 2,
  "currentMealId": 12,
  "suggestedMealId": 5,
  "reason": "I'm craving Sinigang tonight!",
  "status": "pending",
  "createdAt": "2026-06-20T10:00:00Z"
}
```

**Purpose**: Viewers can suggest meal swaps. Admins/Editors can approve or reject. This gives viewers a voice without letting them directly modify plans.

**Note**: The `mealIndex` field references the position in the `meals[]` array of the day plan document.

---

### 3.12 Plan Activity Log (FUTURE)

**Path**: `households/{householdId}/activityLog/{logId}`

```typescript
interface ActivityLog {
  date: string;                   // "2026-06-20" (which plan date was modified)
  action: 'created' | 'regenerated' | 'manual_edit' | 'status_updated' | 'suggestion_applied' | 'suggestion_rejected';
  performedBy: string;            // UID of who did the action
  displayName: string;            // Name of who did the action
  details?: string;               // "Changed dinner from Chicken Adobo to Sinigang"
  createdAt: timestamp;
}
```

**Example**:
```json
{
  "date": "2026-06-20",
  "action": "status_updated",
  "performedBy": "def456",
  "displayName": "Jane Smith",
  "details": "Marked lunch as completed",
  "createdAt": "2026-06-20T10:00:00Z"
}
```

**Note**: Added `status_updated` action type for when users change meal statuses (planned → in_progress → completed).

---

## 4. Data Relationships

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Reference Meals                        │
│              (77 Filipino dishes - SHARED)                │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ (queried by all users)
                        │
┌───────────────────────▼─────────────────────────────────┐
│                      Firebase Auth                        │
│                    (uid: string)                          │
└──────────┬────────────────────────────────────┬─────────┘
           │                                    │
           ▼                                    ▼
┌─────────────────────┐    ┌──────────────────────────────┐
│   User Profile      │    │      Household               │
│  (1:1 per user)     │    │  (has address, invite code,  │
│                      │    │   weekStartDay, timezone)   │
└─────────────────────┘    └──────────┬───────────────────┘
           │                          │
           │                          ├──────────────────┐
           │                          │                  │
           │              ┌───────────▼────┐    ┌───────▼──────────┐
           │              │  Household     │    │  Join Requests    │
           │              │  Members       │    │  (pending/accepted│
           │              │  (roles)       │    │   /rejected)      │
           │              └────────────────┘    └───────────────────┘
           │                          │
           │                          ▼
           │              ┌─────────────────────────────────────────┐
           │              │  Household Day Plans (SHARED)           │
           │              │  - meals: [{mealId, label?, status}]    │
           │              │  - Flexible array with per-meal status  │
           │              └─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Custom Meals       │
│  (per user)         │
└─────────────────────┘
```

### 4.2 Relationship Rules

1. **User → Household**: Many-to-one (a user must belong to a household to plan meals)
2. **Household → Users**: One-to-many (a household can have multiple members)
3. **Household → Day Plans**: One-to-many (household has shared plans)
4. **User → Custom Meals**: One-to-many (a user can create custom meals)
5. **Reference Meals → All**: Many-to-many (all users/Households query the same meals)
6. **Day Plan → Meals[]**: One-to-many (a day plan has multiple meal entries)

---

## 5. Household Management Flow

### 5.1 Creating a Household

**Scenario**: User A wants to create their own household

1. User A signs up
2. User A is redirected to "Create Household" screen
3. User A enters:
   - Household name (e.g., "Smith Family")
   - Address (street, city, state, postcode, country)
   - Week start day (monday or sunday)
   - Timezone (optional)
   - Description (optional)
4. System creates:
   - New document in `households/{householdId}`
   - Member document in `households/{householdId}/members/{uidA}` with role `admin`
   - Updates User A's profile: `householdId = householdId`, `householdRole = 'admin'`
5. System auto-generates an invite code:
   - Format: `{NAME}-{MONTH}{YEAR}` (e.g., "SMITH-JUN2026")
   - Sets expiry date (default: 30 days)
6. User A can now create meal plans

### 5.2 Household Dashboard (NEW — Gateway Screen)

**Scenario**: User logs in and sees their household status

```
[User logs in]
    ↓
[Show Household Dashboard]
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
    │         - Button: "Create Household"
    │         - Button: "Join Household"
    │
    └── [Check for pending invites]
        [Query all households by invitedEmail]
        ↓
        {Pending invites found?}
            ├── YES → [Show "Pending Invitations" section]
            │         For each invite:
            │         - Household name
            │         - Invited by: [admin name]
            │         - Role offered: Viewer/Editor
            │         - [✓ Accept] [✗ Reject] buttons
            │
            └── NO → (no invites to show)
```

### 5.3 Joining via Invite Code

**Scenario**: User B wants to join User A's household

1. User B signs up
2. User B is redirected to the Household Dashboard
3. User B taps "Join Household"
4. User B enters the invite code (e.g., "SMITH-JUN2026")
5. System looks up household by code:
   - **Not found** → error "Invalid invite code"
   - **Expired** → error "This code has expired (expired on [date])"
   - **Valid** → creates a join request
6. Join request created in `households/{householdId}/joinRequests/{uidB}`
   - Status: `pending`
   - User B sees: "Request sent! Waiting for admin approval."

### 5.4 Admin: Direct Invite to User (NEW)

**Scenario**: User A (admin) wants to invite User C to join the household

1. User A opens Household Management → "Invite Member"
2. User A enters:
   - User C's email address
   - Role to offer (Viewer or Editor)
3. System creates invite in `households/{householdId}/invites/{inviteId}`
   - Status: `pending`
   - invitedEmail: User C's email
   - invitedBy: User A's UID
4. User A sees: "Invitation sent to user@example.com!"
5. User C sees the pending invite on their Household Dashboard next time they log in

### 5.5 User: Accept/Reject Invite (NEW)

**Scenario**: User C sees a pending invite and responds

1. User C logs in
2. User C sees "Pending Invitations" on their Household Dashboard
3. User C can:
   - **Accept**:
     - Creates member document in `households/{householdId}/members/{uidC}`
     - Updates invite status to `accepted`
     - Updates User C's profile: householdId, householdRole
     - User C now sees the household meal plans
   - **Reject**:
     - Updates invite status to `rejected`
     - User C sees invite disappear

### 5.6 Admin: Accept/Reject Join Request

**Scenario**: User A (admin) sees a pending join request

1. User A opens Settings → Household → "Pending Requests"
2. System shows all pending requests:
   - User display name + email
   - Requested role (viewer/editor)
   - Requested date
3. User A can:
   - **Accept**: 
     - Creates member document in `households/{householdId}/members/{uidB}`
     - Updates join request status to `accepted`
     - User B receives notification
   - **Reject**:
     - Updates join request status to `rejected`
     - User B receives notification
   - **Accept with different role**:
     - Admin can assign a different role than requested

### 5.7 Post-Acceptance

**After acceptance, User B can:**
1. See the household shared meal plan
2. View meals for any date
3. If role is `editor`: can create/edit/regenerate plans
4. If role is `viewer`: can only view
5. **Update meal statuses** (all roles can update status: planned → in_progress → completed)

**Meal plan flow:**
1. Admin or Editor creates/generates a plan
2. During generation, they choose how many meals per day
3. Plan is saved to `households/{householdId}/plans/{date}` with `meals[]` array
4. All members see the SAME plan
5. Any member can update meal statuses (planned → cooking → done)
6. When a member views Day or Week, they query `households/{householdId}/plans/`

---

## 6. Security Rules

### 6.1 Firestore Security Rules

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
      allow update, delete: if request.auth.uid == get(/databases/$(database)/documents/households/$(householdId)).data.createdBy;
      
      // Members: Read by household members, write by admin
      match /members/{uid} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow create: if request.auth.uid == uid; // For join request acceptance
        allow delete: if request.auth.uid == get(/databases/$(database)/documents/households/$(householdId)).data.createdBy;
      }
      
      // Join requests: Read by admin, create by anyone, update by admin
      match /joinRequests/{uid} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid == uid;
        allow update: if request.auth.uid == get(/databases/$(database)/documents/households/$(householdId)).data.createdBy;
      }
      
      // Plans: Read by all members, write by admin/editor, status update by all members
      match /plans/{date} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow create: if request.auth != null && 
          get(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid)).data.role in ['admin', 'editor'];
        allow update: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        // Note: All members can update status, but only admin/editor can change meals
      }
    }
  }
}
```

---

## 7. User Journeys Impact

### Key Changes from Previous Design

| Aspect | Before | After |
|--------|--------|-------|
| **Meal planning requirement** | Any logged-in user | Must belong to a household |
| **Plan storage** | `users/{uid}/dayPlans/{date}` | `households/{householdId}/plans/{date}` |
| **Plan structure** | 4 fixed slots (breakfastId, lunchId, dinnerId, snackId) | Flexible `meals[]` array |
| **Meal labels** | Fixed (breakfast/lunch/dinner/snack) | Optional — user can label or leave empty |
| **Cooking status** | Not tracked | Per-meal status: planned → in_progress → completed → skipped |
| **Roles** | None | admin, editor, viewer |
| **Joining** | Direct (no approval) | Request → Accept/Reject or Invite → Accept/Reject |
| **Invite codes** | Optional | Required, with expiry |
| **Meals per day** | Fixed from user preferences | Chosen per-generation by admin/editor |
| **Week start day** | Per user | Per household |
| **Address** | Per user (optional) | Per household (required) |

### Journey Updates Required

1. **Sign-Up**: No change (email + password)
2. **Post Sign-Up**: User MUST create or join a household before planning meals
3. **Settings**: Remove `weekStartDay` and `mealsPerDay` (these are now household-level)
4. **Days/Week**: Display `meals[]` array instead of fixed slots
5. **Generate**: Show prompt asking "How many meals per day?" before generating
6. **Meal status**: All members can update meal status (planned → in_progress → completed/skipped)
7. **Labels**: Optional — user can add/remove labels on meals

---

## 8. Cost Comparison

### Old Approach (Per User Plans)
```
users/{uid}/
  ├── dayPlans/{date} (per user) ❌ Duplicated
  └── ... (other user data)

1000 users in 200 households:
  - Storage: 1000 users × 365 days = 365,000 day plan documents
```

### New Approach (Shared Household Plans)
```
households/{householdId}/
  └── plans/{date} (shared by all members)

1000 users in 200 households:
  - Storage: 200 households × 365 days = 73,000 day plan documents
  - 80% reduction in plan storage
  - No duplication across family members
```

---

## 9. Recommendations & Future Features

### 9.1 Activity Log (Recommended)
- **Type**: Implement now if admin auditing is important; future otherwise
- **Purpose**: Track who created/modified/regenerated meal plans
- **Collection**: `households/{householdId}/activityLog/{logId}`
- **Benefit**: Admin can see who changed what and when
- **Data**: Already partially covered by `createdBy` and `lastModifiedBy` fields in household plans

### 9.2 Invite Code History (Recommended)
- **Type**: Implement now
- **Purpose**: Preserve invite code history when regenerating
- **Collection**: `households/{householdId}/inviteCodes/{codeId}`
- **Benefit**: Admin can see all past codes, who generated them, and how many times they were used
- **Anti-pattern**: Without this, regenerating a code loses all history

### 9.3 Viewer Suggestions (Future Feature)
- **Type**: Future
- **Purpose**: Viewers can suggest meal swaps that admins/editors can approve/reject
- **Collection**: `households/{householdId}/suggestions/{suggestionId}`
- **Benefit**: Gives viewers a voice without granting them edit permissions
- **Implementation**: When viewer taps a meal, they see "Suggest Swap" option

### 9.4 Household Limits (Recommended)
- **Type**: Implement now
- **Purpose**: Prevent households from growing too large
- **Field**: `maxMembers` in household document (0 = unlimited)
- **Benefit**: Admin can control household size
- **Implementation**: Before accepting a join request, check if current members < maxMembers

### 9.5 Collection Relationships (New Subcollections)
```
households/{householdId}/
  ├── members/{uid}             (existing)
  ├── joinRequests/{uid}        (existing)
  ├── plans/{date}              (existing)
  ├── inviteCodes/{codeId}      (NEW - recommended)
  ├── activityLog/{logId}       (NEW - recommended)
  └── suggestions/{id}          (NEW - future)
```

---

## 10. Summary of Changes

### Data Structure Changes (This Version)

| Change | Description |
|--------|-------------|
| **Household** | Added `weekStartDay`, `description`, `timezone` (was in User Preferences) |
| **Household Plans** | Replaced 4 fixed slots with flexible `meals[]` array |
| **Meal Entry** | NEW structure: `{mealId, label?, status}` — optional label, per-meal cooking status |
| **Meal Status** | NEW field: `planned`, `in_progress`, `completed`, `skipped` |
| **User Preferences** | Removed `mealsPerDay` (now per-generation), removed `weekStartDay` (moved to Household) |
| **Activity Log** | Added `status_updated` action type for meal status changes |
| **Security Rules** | All members can update meal status; only admin/editor can modify meals |

### Previous Changes (Carried Over)

| Change | Description |
|--------|-------------|
| **Household** | Added `address`, `inviteCode`, `codeExpiresAt`, `maxMembers`, `formattedAddress` |
| **Household Members** | Roles changed: `admin`, `editor`, `viewer` (was `admin`, `member`) |
| **Join Requests** | NEW collection for pending/accepted/rejected requests |
| **Household Plans** | Moved from per-user to household level |
| **Household Invites** | NEW collection for admin → user invitations |
| **Invite Codes** | NEW subcollection for code history |
| **Activity Log** | NEW subcollection for plan change tracking |
| **Suggestions** | NEW subcollection for viewer meal swap suggestions (future) |
| **User Profile** | `householdRole` updated to `admin | editor | viewer` |
| **User Day Plans** | REMOVED — no longer stored per-user |

### User Journey Changes

| Journey | Impact |
|---------|--------|
| **Sign-Up** | No change |
| **Post Sign-Up** | Must create or join household first |
| **Login** | Check household membership, redirect to Dashboard |
| **Day View** | Display flexible `meals[]` array; generate prompt for meal count |
| **Week View** | Display flexible `meals[]` array; generate prompt for meal count |
| **Settings** | Removed `mealsPerDay` and `weekStartDay` (household-level now) |
| **Meal Planning** | Only admin/editor can create/modify plans |
| **Meal Status** | All members can update meal statuses |
| **Viewing** | All members can view (viewer=read-only for meals, but can update status) |

---

*Document version 4.0 — June 2026 (Household-driven architecture with flexible meals array)*