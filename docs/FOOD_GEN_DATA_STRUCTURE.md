# FoodGen Web App — Data Structure Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Core Entities](#2-core-entities)
3. [Firestore Collections](#3-firestore-collections)
4. [Data Relationships](#4-data-relationships)
5. [Household Linking Flow](#5-household-linking-flow)
6. [Security Rules](#6-security-rules)
7. [Migration from Current State](#7-migration-from-current-state)

---

## 1. Overview

FoodGen is a meal planning app that supports:
- **Individual users** with personal preferences
- **Household linking** — multiple users can share meal plans
- **77 Filipino dishes** as reference data (stored ONCE, shared by all users)
- **Day/Week meal plans** with flexible slot assignment

### Design Principles

- **User-centric**: Each user has their own profile and preferences
- **Household-aware**: Users can link to a household to share meal plans
- **Efficient**: Reference data stored once, not duplicated per user
- **Flexible**: Meals can be assigned to any slot (breakfast, lunch, dinner, snack)
- **Offline-first**: Firestore with IndexedDB persistence

### Data Storage Strategy

**Reference Data (Shared)**:
- 77 Filipino dishes stored ONCE in `referenceMeals/` collection
- All users query this collection for meal selection
- No duplication across users

**User Data (Private)**:
- User profiles, preferences, custom meals, day plans
- Stored in `users/{uid}/` subcollections
- Isolated per user

---

## 2. Core Entities

### 2.1 User Profile
- **Purpose**: Store user information (name, email, address, preferences)
- **Collection**: `users/{uid}/profile/main`
- **One-to-one**: Each Firebase Auth user has exactly one profile
- **Note**: Passwords are NOT stored here — handled by Firebase Authentication

### 2.2 Household
- **Purpose**: Group multiple users who share meal plans
- **Collection**: `households/{householdId}`
- **Members**: Linked via `householdMembers` subcollection

### 2.3 Household Member
- **Purpose**: Link a user to a household with a role
- **Collection**: `households/{householdId}/members/{uid}`
- **Roles**: `admin` (creator) or `member` (joined)

### 2.4 Reference Meals
- **Purpose**: 77 Filipino dishes available for ALL users
- **Collection**: `referenceMeals/{mealId}`
- **Shared**: Stored ONCE, read by all users
- **Read-only**: Users cannot modify reference meals

### 2.5 Custom Meals
- **Purpose**: User-created meals (unique to each user)
- **Collection**: `users/{uid}/customMeals/{mealId}`
- **Private**: Only visible to the user who created them

### 2.6 Day Plans
- **Purpose**: Generated meal plans for specific dates
- **Collection**: `users/{uid}/dayPlans/{date}`
- **Household sharing**: If user is in a household, plan is also visible to household members

### 2.7 User Preferences
- **Purpose**: App settings (meals per day, week start day, display name)
- **Collection**: `users/{uid}/preferences/main`

---

## 3. Firestore Collections

### 3.1 Reference Meals (NEW - Shared)

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

**Example**:
```json
{
  "id": 1,
  "name": "Chicken Adobo",
  "suggestedFor": ["breakfast", "lunch", "dinner"],
  "cuisine": "Filipino",
  "dietaryTags": ["gluten-free"],
  "prepTimeMinutes": 40,
  "difficulty": "easy",
  "emoji": "🍗",
  "ingredients": [
    { "name": "Chicken thighs", "quantity": "500g" },
    { "name": "Soy sauce", "quantity": "1/4 cup" }
  ],
  "steps": [
    "Combine chicken with soy sauce, vinegar, and garlic.",
    "Marinate for 30 minutes."
  ],
  "calories": 480,
  "isReference": true,
  "createdAt": "2026-06-19T10:00:00Z"
}
```

**Total**: 77 documents (one-time setup)

---

### 3.2 User Profile

**Path**: `users/{uid}/profile/main`

```typescript
interface UserProfile {
  uid: string;                    // Firebase Auth UID
  displayName: string;            // "John Doe"
  email: string;                  // "john@example.com"
  // Note: Password is NOT stored here
  // Passwords are handled securely by Firebase Authentication
  phoneNumber?: string;           // "+1234567890"
  address?: Address;              // User's address
  householdId?: string;           // Linked household ID (if any)
  householdRole?: 'admin' | 'member'; // Role in household
  createdAt: timestamp;
  updatedAt: timestamp;
}

interface Address {
  street: string;                 // "123 Main St"
  city: string;                   // "Sydney"
  state: string;                  // "NSW"
  postcode: string;               // "2000"
  country: string;                // "Australia"
}
```

**Example**:
```json
{
  "uid": "abc123",
  "displayName": "Mishari",
  "email": "mishari@example.com",
  "phoneNumber": "+61412345678",
  "address": {
    "street": "123 George St",
    "city": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "country": "Australia"
  },
  "householdId": "household_xyz",
  "householdRole": "admin",
  "createdAt": "2026-06-19T10:00:00Z",
  "updatedAt": "2026-06-19T10:00:00Z"
}
```

**Authentication Note**: 
- Passwords are handled by Firebase Authentication (separate from Firestore)
- Firebase Auth stores passwords securely (hashed, encrypted)
- We only store the user's UID, email, and profile data in Firestore
- When user signs in, Firebase Auth verifies credentials and returns UID
- We use that UID to access their Firestore data

---

### 3.3 Households

**Path**: `households/{householdId}`

```typescript
interface Household {
  id: string;                     // Auto-generated Firestore ID
  name: string;                   // "Smith Family"
  createdBy: string;              // UID of admin
  code: string;                   // "SMITH-2024" (shareable code)
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Example**:
```json
{
  "name": "Smith Family",
  "createdBy": "abc123",
  "code": "SMITH-2024",
  "createdAt": "2026-06-19T10:00:00Z",
  "updatedAt": "2026-06-19T10:00:00Z"
}
```

---

### 3.4 Household Members

**Path**: `households/{householdId}/members/{uid}`

```typescript
interface HouseholdMember {
  uid: string;                    // User's Firebase UID
  displayName: string;            // Cached for quick access
  email: string;                  // Cached for quick access
  role: 'admin' | 'member';       // admin = creator, member = joined
  joinedAt: timestamp;
}
```

**Example**:
```json
{
  "uid": "abc123",
  "displayName": "Mishari",
  "email": "mishari@example.com",
  "role": "admin",
  "joinedAt": "2026-06-19T10:00:00Z"
}
```

---

### 3.5 Custom Meals

**Path**: `users/{uid}/customMeals/{mealId}`

```typescript
interface CustomMeal {
  id: number;                     // Auto-generated ID
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

**Example**:
```json
{
  "id": 101,
  "name": "Pork Sisig",
  "suggestedFor": ["lunch", "dinner"],
  "cuisine": "Filipino",
  "dietaryTags": [],
  "prepTimeMinutes": 40,
  "difficulty": "medium",
  "emoji": "🍳",
  "ingredients": [
    { "name": "Ground pork", "quantity": "250g" },
    { "name": "Onion", "quantity": "1, chopped" }
  ],
  "steps": [
    "Grill pork until crispy.",
    "Chop finely and mix with onions."
  ],
  "calories": 320,
  "isCustom": 1,
  "createdAt": "2026-06-19T10:00:00Z"
}
```

---

### 3.6 Day Plans

**Path**: `users/{uid}/dayPlans/{date}`

```typescript
interface DayPlan {
  date: string;                   // "2026-06-19"
  weekOfYear: number;             // 25
  year: number;                   // 2026
  breakfastId: number | null;     // Meal ID or null
  lunchId: number | null;         // Meal ID or null
  dinnerId: number | null;        // Meal ID or null
  snackId: number | null;         // Meal ID or null
  isGenerated: 0 | 1;             // 1 = auto-generated, 0 = manual
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Example**:
```json
{
  "date": "2026-06-19",
  "weekOfYear": 25,
  "year": 2026,
  "breakfastId": 1,
  "lunchId": 5,
  "dinnerId": 12,
  "snackId": null,
  "isGenerated": 1,
  "createdAt": "2026-06-19T10:00:00Z",
  "updatedAt": "2026-06-19T10:00:00Z"
}
```

**Note**: `breakfastId/lunchId/dinnerId` can reference:
- Reference meals (IDs 1-77 from `referenceMeals/`)
- Custom meals (IDs 100+ from `users/{uid}/customMeals/`)

---

### 3.7 User Preferences

**Path**: `users/{uid}/preferences/main`

```typescript
interface UserPreferences {
  displayName: string;            // "John"
  mealsPerDay: 1 | 2 | 3;         // 1 = dinner only, 2 = lunch+dinner, 3 = all
  weekStartDay: 'monday' | 'sunday';
  onboardingComplete: boolean;    // true
  seedDataLoaded: boolean;        // true (indicates reference meals have been cached locally)
  updatedAt: timestamp;
}
```

**Example**:
```json
{
  "displayName": "John",
  "mealsPerDay": 2,
  "weekStartDay": "monday",
  "onboardingComplete": true,
  "seedDataLoaded": true,
  "updatedAt": "2026-06-19T10:00:00Z"
}
```

**Note**: `seedDataLoaded` now indicates that the 77 reference meals have been cached in IndexedDB for offline use, not that user-specific seed data was loaded.

---

## 4. Data Relationships

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Reference Meals                        │
│              (77 Filipino dishes - SHARED)                │
│              referenceMeals/{mealId}                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ (queried by all users)
                        │
┌───────────────────────▼─────────────────────────────────┐
│                      Firebase Auth                        │
│                    (uid: string)                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ├──────────────────────────────────┐
                        │                                  │
                ┌───────▼────────┐                ┌────────▼──────────┐
                │  User Profile  │                │   Households       │
                │  (1:1)         │                │   (1:many users)   │
                └────────────────┘                └───────────────────┘
                        │                                  │
                        │                                  │
                ┌───────▼──────────────────────────────────▼────────┐
                │              Custom Meals (per user)                │
                │  - User-created meals only (isCustom: 1)           │
                │  - NO seed meals (those are in referenceMeals)      │
                └────────────────────────────────────────────────────┘
                        │
                        ├──────────────────────────────────┐
                        │                                  │
                ┌───────▼────────┐                ┌────────▼──────────┐
                │   Day Plans    │                │  Household Plans  │
                │  (per user)    │                │  (shared view)    │
                └────────────────┘                └───────────────────┘
                        │                                  │
                        │                                  │
                ┌───────▼──────────────────────────────────▼────────┐
                │         Household Members (shared view)            │
                │  - All members see each other's day plans          │
                └────────────────────────────────────────────────────┘
```

### 4.2 Relationship Rules

1. **Reference Meals → Users**: One-to-many (all users query the same 77 meals)
2. **User → Profile**: One-to-one (each Firebase user has one profile)
3. **User → Household**: Many-to-one (a user can belong to only one household)
4. **Household → Users**: One-to-many (a household can have multiple members)
5. **User → Custom Meals**: One-to-many (a user can create multiple custom meals)
6. **User → Day Plans**: One-to-many (a user can have multiple day plans)
7. **Household → Day Plans**: One-to-many (all household members can see each other's day plans)

---

## 5. Household Linking Flow

### 5.1 Creating a Household

**Scenario**: User A wants to create a new household

1. User A signs up / logs in
2. User A goes to Settings → "Create Household"
3. User A enters household name (e.g., "Smith Family")
4. System creates:
   - New document in `households/{householdId}`
   - Member document in `households/{householdId}/members/{uidA}` with role `admin`
   - Updates User A's profile: `householdId = householdId`, `householdRole = 'admin'`
5. User A gets a **household code** (e.g., "SMITH-2024") to share with family

### 5.2 Joining a Household

**Scenario**: User B wants to join User A's household

1. User B signs up / logs in
2. User B goes to Settings → "Join Household"
3. User B enters the household code (e.g., "SMITH-2024")
4. System:
   - Looks up household by code
   - Creates member document in `households/{householdId}/members/{uidB}` with role `member`
   - Updates User B's profile: `householdId = householdId`, `householdRole = 'member'`
5. User B can now see User A's meal plans and vice versa

### 5.3 Household Code Implementation

**Option 1: Firestore Document ID**
- Use the household document ID as the code
- Example: `households/abc123xyz`
- User shares "abc123xyz" with family

**Option 2: Custom Code Field** ✅ **Recommended**
- Add a `code` field to household document
- Example: `code: "SMITH-2024"`
- User shares "SMITH-2024" with family
- Easier for users to share and remember

### 5.4 Sharing Logic

**When a user generates a meal plan:**
1. Plan is saved to `users/{uid}/dayPlans/{date}`
2. If user is in a household:
   - Plan is also saved to `households/{householdId}/plans/{uid}_{date}`
   - All household members can read this document
3. When a household member views their day:
   - App checks if user is in a household
   - If yes, loads plans from `households/{householdId}/plans/`
   - Merges with user's personal plans

### 5.5 Data Visibility Rules

| Data | Personal | Household Members |
|------|----------|-------------------|
| **User Profile** | ✅ Own only | ❌ Private |
| **Custom Meals** | ✅ Own only | ❌ Private |
| **Reference Meals** | ✅ Shared | ✅ Shared (read-only) |
| **Day Plans** | ✅ Own | ✅ Visible to household |
| **Preferences** | ✅ Own | ❌ Private |

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
      allow write: if false; // No one can write
    }
    
    // Users can only access their own profile
    match /users/{userId}/profile/main {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can only access their own preferences
    match /users/{userId}/preferences/main {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can only access their own custom meals
    match /users/{userId}/customMeals/{mealId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can only access their own day plans
    match /users/{userId}/dayPlans/{date} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Households: Anyone can read, only admin can modify
    match /households/{householdId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if resource.data.createdBy == request.auth.uid;
      
      // Members subcollection
      match /members/{uid} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid == uid;
        allow delete: if resource.data.role == 'member' && request.auth.uid == uid;
      }
      
      // Shared plans subcollection
      match /plans/{planId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/households/$(householdId)/members/$(request.auth.uid));
        allow write: if request.auth != null;
      }
    }
  }
}
```

---

## 7. Migration from Current State

### 7.1 Current Structure (Inefficient)

```
users/{uid}/
  ├── customMeals/{mealId} (77 seed meals + custom meals) ❌ DUPLICATED
  ├── dayPlans/{date}
  └── preferences/main
```

**Problem**: Each user has their own copy of 77 seed meals

### 7.2 New Structure (Efficient)

```
referenceMeals/
  └── {mealId} (77 Filipino dishes - ONE TIME SETUP)

users/{uid}/
  ├── profile/main (NEW)
  ├── preferences/main (existing)
  ├── customMeals/{mealId} (user-created meals ONLY)
  └── dayPlans/{date} (existing)

households/{householdId} (NEW)
  ├── members/{uid} (NEW)
  └── plans/{uid}_{date} (NEW)
```

**Benefits**:
- 77 reference meals stored ONCE (not per user)
- Users only store their custom meals
- Significant cost savings on Firestore reads/writes

### 7.3 Migration Steps

1. **Create referenceMeals collection** with 77 Filipino dishes (one-time setup)
2. **Update authentication** from anonymous to email/password
3. **Update onboarding** to:
   - Collect name, email, password
   - Create Firebase user with email/password
   - NOT seed 77 meals per user
   - Cache reference meals in IndexedDB
4. **Update meal generation** to query `referenceMeals/` + `users/{uid}/customMeals/`
5. **Add household collections** (empty for now)
6. **Update Settings** to add household management UI

---

## 8. Cost Comparison

### Current Approach (Per User)
```
Onboarding:
  - Write 77 meal documents to users/{uid}/customMeals/
  - Cost: 77 writes per user

Meal Generation:
  - Read 77 meals from users/{uid}/customMeals/
  - Cost: 77 reads per generation

1000 users:
  - Storage: 77,000 documents
  - Writes: 77,000 (onboarding)
  - Reads: 77,000 per generation cycle
```

### New Approach (Per User)
```
Onboarding:
  - Write 0 meal documents (reference meals already exist)
  - Cost: 0 writes

Meal Generation:
  - Read 77 meals from referenceMeals/ (shared)
  - Read user's custom meals from users/{uid}/customMeals/
  - Cost: 77 reads (cached) + custom meals reads

1000 users:
  - Storage: 77 reference + custom meals only
  - Writes: 0 (onboarding)
  - Reads: 77 (cached) + custom meals per generation
```

**Savings**: ~99% reduction in storage and write costs

---

## 9. Implementation Notes

### 9.1 Querying Meals for Generation

```typescript
// Get reference meals (cached after first load)
const referenceMeals = await getDocs(collection(db, 'referenceMeals'));

// Get user's custom meals
const customMeals = await getDocs(collection(db, 'users/{uid}/customMeals'));

// Merge both arrays
const allMeals = [
  ...referenceMeals.docs.map(d => ({ id: d.data().id, ...d.data() })),
  ...customMeals.docs.map(d => ({ id: d.data().id, ...d.data() }))
];
```

### 9.2 Meal ID Ranges

To avoid ID conflicts:
- **Reference meals**: IDs 1-77
- **Custom meals**: IDs 100+ (auto-increment)

### 9.3 Offline Support

- Enable IndexedDB persistence for `referenceMeals/`
- First load fetches all 77 meals
- Subsequent loads use cached data
- Works offline after first sync

---

## 10. Missing Entities?

Let me know if you think we need:

- **Favorites/Bookmarks**: User's favorite meals
- **Meal History**: Track what users actually cooked
- **Notifications**: Reminders for meal planning
- **Recipes**: Extended recipe details with photos/videos
- **Dietary Restrictions**: User preferences (vegetarian, allergies, etc.)
- **Meal Ratings**: Rate meals after cooking

**Note**: Saved Week Plans were removed to keep the data structure simple. Users can regenerate week plans as needed.

---

## 11. Implementation Priority

### Phase 1: Core Structure
1. ✅ Create referenceMeals collection (77 dishes)
2. ✅ Update authentication to email/password (no verification)
3. ✅ Update onboarding to collect name, email, password
4. ✅ Remove seed data loading from onboarding
5. ✅ Update meal generation to use referenceMeals
6. ✅ User profile (name, email)
7. ✅ Household creation/joining
8. ✅ Household member management
9. ✅ Shared meal plan visibility

### Phase 2: Enhanced Profile
1. Address fields
2. Phone number
3. Profile photo (optional)

### Phase 3: Advanced Features
1. Shopping list generation
2. Meal ratings
3. Dietary restrictions
4. Notifications

---

*Document version 2.0 — June 2026 (Optimized with reference meals)*