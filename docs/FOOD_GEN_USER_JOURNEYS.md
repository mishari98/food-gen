# FoodGen Web App — User Journeys Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Journey 1: Onboarding / Sign-Up](#2-journey-1-onboarding--sign-up)
3. [Journey 2: Login (Returning User)](#3-journey-2-login-returning-user)
4. [Journey 3: Landing Page - Day View](#4-journey-3-landing-page---day-view)
5. [Journey 4: Landing Page - Week View](#5-journey-4-landing-page---week-view)
6. [Journey 5: Add Custom Meal](#6-journey-5-add-custom-meal)
7. [Journey 6: Settings](#7-journey-6-settings)
8. [Journey 9: Household Management](#9-journey-9-household-management)
10. [Data Structure Validation](#10-data-structure-validation)

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

---

## 2. Journey 1: Onboarding / Sign-Up

**Status**: 🚧 Needs update (currently uses anonymous auth)  
**Trigger**: First-time user opens app  
**Goal**: Collect user info and initialize app

### Flow

```
[App Opens]
    ↓
[Check: Is onboarding complete?]
    ├── NO → [Show Sign-Up Screen]
    │         ↓
    │   [User enters:]
    │   - Name (required)
    │   - Email (required)
    │   - Password (required, min 6 characters)
    │         ↓
    │   [User taps "Sign Up"]
    │         ↓
    │   [Create Firebase user with email/password]
    │   - No email verification (for simplicity)
    │         ↓
    │   [Save profile to Firestore]
    │   - uid, displayName, email
    │   - householdId: null
    │   - householdRole: null
    │         ↓
    │   [Save preferences]
    │   - displayName, mealsPerDay: 1, weekStartDay: 'monday'
    │   - onboardingComplete: true
    │   - seedDataLoaded: false
    │         ↓
    │   [Load reference meals from Firestore]
    │   - Query referenceMeals/ collection (77 dishes)
    │   - Cache in IndexedDB for offline use
    │         ↓
    │   [Set seedDataLoaded: true]
    │         ↓
    │   [Navigate to Day Page]
    │         ↓
    └── YES → [Navigate to Day Page]
```

### Data Written

**Collection**: `users/{uid}/profile/main`
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  householdId: null;
  householdRole: null;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Collection**: `users/{uid}/preferences/main`
```typescript
{
  displayName: string;
  mealsPerDay: 1;
  weekStartDay: 'monday';
  onboardingComplete: true;
  seedDataLoaded: true;
  updatedAt: timestamp;
}
```

**Collection**: `referenceMeals/{mealId}` (x77)
- **NOT written by user** - already exists in Firestore
- Read-only reference data shared by all users

### Questions / Improvements Needed

1. **Should we ask about household during onboarding?**
   - Current: No household setup
   - Option A: Skip for now, add later in Settings ✅ **Recommended**
   - Option B: Ask "Are you setting up for a household?" during onboarding

2. **Should we collect address during onboarding?**
   - Current: No address collection
   - Recommendation: Skip for now, add in Settings if needed

3. **Password requirements:**
   - Min 6 characters (Firebase default)
   - No complexity requirements (for simplicity)
   - No "confirm password" field (to reduce friction)

---

## 3. Journey 2: Login (Returning User)

**Status**: 🚧 Needs update (currently uses anonymous auth)  
**Trigger**: User opens app after onboarding  
**Goal**: Restore user's data

### Flow

```
[App Opens]
    ↓
[Check: Is onboarding complete?]
    ├── NO → [Show Sign-Up Screen]
    └── YES → [Show Login Screen]
              ↓
      [User enters email + password]
              ↓
      [Sign in with Firebase email/password]
              ↓
      [Load user data]
              ↓
      [Load preferences from Firestore]
      - mealsPerDay, weekStartDay, displayName
              ↓
      [Load reference meals from Firestore]
      - Query referenceMeals/ collection (77 dishes)
      - Cache in IndexedDB for offline use
              ↓
      [Load user's custom meals]
      - Query users/{uid}/customMeals/
              ↓
      [Load day plans for current week]
      - Get all dayPlans for current week
              ↓
      [Enrich plans with meal data]
      - Match breakfastId/lunchId/dinnerId to meals
      - Merge reference meals + custom meals
              ↓
      [Navigate to Day Page]
```

### Data Read

**Collection**: `users/{uid}/preferences/main`
- Read once on app load

**Collection**: `referenceMeals/`
- Read all 77 reference meals (cached after first load)

**Collection**: `users/{uid}/customMeals`
- Real-time listener for user's custom meals only
- No seed meals (those are in referenceMeals)

**Collection**: `users/{uid}/dayPlans`
- Real-time listener for all day plans
- Used to populate Day and Week views

### Questions / Improvements Needed

1. **Should we show a loading screen?**
   - Current: Shows "Loading..." briefly
   - Could show skeleton UI instead

2. **Should we show a loading screen?**
   - Current: Shows "Loading..." briefly
   - Could show skeleton UI instead

---

## 4. Journey 3: Landing Page - Day View

**Status**: ✅ Implemented  
**Trigger**: User taps "Day" tab or opens app  
**Goal**: Show today's meal plan

### Flow

```
[Day Page Loads]
    ↓
[Show date picker]
- Default: Today
- Min: Today
- Max: Today + 365 days
    ↓
[Show meals per day picker]
- 1 meal (dinner only)
- 2 meals (lunch + dinner)
- 3 meals (breakfast + lunch + dinner)
    ↓
[Load day plan for selected date]
- Read from dayPlans/{date}
    ↓
{Day Plan Exists?}
    ├── YES → [Enrich with meal data]
    │         - Show meal cards with emoji, name, prep time, difficulty
    │         - Tap card → open Meal Detail Modal
    │         ↓
    │         [Show "Regenerate Meals" button]
    │         - Tap → confirm dialog → generate new plan
    │         ↓
    │         [Generate new plan]
    │         - Pick random meals from allMeals
    │         - Ensure no repeats within the week
    │         - Save to dayPlans/{date}
    │         - Update UI
    │
    └── NO → [Show Empty State]
              - "No meals for [date]"
              - "Generate Meals" button
              ↓
              [User taps "Generate Meals"]
              ↓
              [Generate plan]
              - Same as above
```

### Data Operations

**Read**:
- `dayPlans/{selectedDate}` - Get today's plan
- `customMeals` - Get all meals for enrichment

**Write**:
- `dayPlans/{selectedDate}` - Save generated plan
```typescript
{
  date: string;
  weekOfYear: number;
  year: number;
  breakfastId: number | null;
  lunchId: number | null;
  dinnerId: number | null;
  snackId: number | null;
  isGenerated: 1;
  updatedAt: timestamp;
}
```

### Questions / Improvements Needed

1. **Should users be able to manually assign meals?**
   - Current: Only random generation
   - Feature: Tap a slot → pick from meal list
   - Data impact: Same structure, just different write logic

2. **Should users see household members' plans?**
   - Current: Only own plans
   - Feature: If in household, show "Family's Plans" toggle
   - Data impact: Read from `households/{householdId}/plans/`

3. **Should users be able to delete a day plan?**
   - Current: No delete option
   - Feature: Swipe to delete or "Clear" button
   - Data impact: Delete `dayPlans/{date}` document

---

## 5. Journey 4: Landing Page - Week View

**Status**: ✅ Implemented  
**Trigger**: User taps "Week" tab  
**Goal**: Show full week meal plan

### Flow

```
[Week Page Loads]
    ↓
[Show week picker]
- Date input showing week start date
- Dropdown: Mon/Sun start
    ↓
[Show meals per day picker]
- Same as Day view
    ↓
[Load week plans]
- Get all dayPlans for selected week
- Enrich with meal data
    ↓
{Week Has Plans?}
    ├── YES → [Show collapsible day rows]
    │         - Each day shows date + meal emojis
    │         - Tap to expand → show full meal cards
    │         - Each day has [↻] regenerate button
    │         ↓
    │         [Show action buttons]
    │         - "🔄 Generate This Week" → regenerate all 7 days
    │         - "💾 Save This Plan" → (removed, not implemented)
    │         - "📍 Jump to This Week" (if viewing past/future week)
    │
    └── NO → [Show Empty State]
              - "No weekly plan yet"
              - "Generate Weekly Plan" button
              ↓
              [User taps "Generate Weekly Plan"]
              ↓
              [Generate week plan]
              - Generate 7 days (Mon-Sun)
              - Ensure no repeated meals across week
              - Save each day to dayPlans/{date}
              - Update UI
```

### Data Operations

**Read**:
- `dayPlans` - Query by `weekOfYear` and `year`
- `customMeals` - Get all meals for enrichment

**Write**:
- `dayPlans/{date}` (x7) - Save generated plans

### Questions / Improvements Needed

1. **Should users see household members' week plans?**
   - Same as Day view question

2. **Should users be able to swap meals between days?**
   - Current: Regenerate entire day
   - Feature: Long-press meal → swap with another meal
   - Data impact: Update single `breakfastId/lunchId/dinnerId`

3. **Should users be able to copy a day's plan to another day?**
   - Feature: "Copy to..." button
   - Data impact: Read one day, write to another

---

## 6. Journey 5: Add Custom Meal

**Status**: ✅ Implemented  
**Trigger**: User taps [+] button  
**Goal**: Add user-created meal to database

### Flow

```
[User taps + button]
    ↓
[Navigate to Add Meal Page]
    ↓
[Show form fields]
- Meal Name * (required)
- Suggested For * (checkboxes: Breakfast, Lunch, Dinner, Snack)
- Cuisine (dropdown: Filipino, Italian, Japanese, etc.)
- Prep Time (minutes) * (required)
- Difficulty (radio: Easy, Medium, Hard)
- Emoji (text input, default: 🍽️)
- Photo (optional) - NOT IMPLEMENTED
- YouTube Link (optional) - NOT IMPLEMENTED
- Ingredients * (dynamic list, required)
  - Name + Quantity pairs
  - Add/remove buttons
- Steps * (dynamic list, required)
  - Text areas
  - Add/remove buttons
- Calories (optional)
    ↓
[User taps "Save Meal"]
    ↓
[Validate]
- Name required
- At least 1 suggested slot required
- At least 1 ingredient required
    ↓
{Valid?}
    ├── NO → [Show error message]
    └── YES → [Save to Firestore]
              ↓
              [Generate new meal ID]
              - Use next available number
              ↓
              [Save to users/{uid}/customMeals/{mealId}]
              - isCustom: 1
              ↓
              [Show success toast]
              - "🍽️ [Meal Name] added to your meals!"
              ↓
              [Navigate back to previous page]
```

### Data Written

**Collection**: `users/{uid}/customMeals/{mealId}`
```typescript
{
  id: number; // Auto-generated
  name: string;
  suggestedFor: string[];
  cuisine: string;
  dietaryTags: string[];
  prepTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  calories?: number;
  isCustom: 1;
  createdAt: timestamp;
}
```

### Questions / Improvements Needed

1. **Should custom meals be visible to household members?**
   - Current: Private to user
   - Option A: Keep private (current)
   - Option B: Share with household

2. **Should users be able to edit/delete custom meals?**
   - Current: Can add, but no edit/delete UI
   - Feature: Swipe to delete, tap to edit
   - Data impact: Update/delete document

3. **Should users be able to upload photos?**
   - Current: Not implemented
   - Feature: Camera/gallery picker
   - Data impact: Store in Firebase Storage, save URL in meal document

---

## 7. Journey 6: Settings

**Status**: 🚧 Partially implemented  
**Trigger**: User taps gear icon ⚙️  
**Goal**: Manage app preferences and account

### Current Features

```
[Settings Page]
    ↓
[Meals Per Day]
- 1 🍽️ (Dinner only)
- 2 🍽️🍽️ (Lunch + Dinner)
- 3 🍽️🍽️🍽️ (Breakfast + Lunch + Dinner)
    ↓
[Show meal slot labels toggle]
- ON: Show "Breakfast", "Lunch", "Dinner" headers
- OFF: Show just meal name
    ↓
[About Section]
- Version number
- "Made with ❤️ for Filipino food 🇵🇭"
- Data: 77 Filipino dishes
- Framework: React Native + Expo
```

### Missing Features

1. **User Profile Management**
   - Edit display name
   - Change email/password (if implemented)
   - Upload profile photo

2. **Address Management**
   - Add/edit address
   - Multiple addresses? (home, work, etc.)

3. **Household Management**
   - Create household
   - Join household (enter code)
   - View household members
   - Leave household
   - Admin: Remove members

4. **Account Actions**
   - Logout
   - Delete account
   - Export data

### Data Operations

**Read**:
- `users/{uid}/profile/main`
- `users/{uid}/preferences/main`

**Write**:
- `users/{uid}/preferences/main` (mealsPerDay, weekStartDay)
- `users/{uid}/profile/main` (displayName, address, etc.)

### Questions / Improvements Needed

1. **What settings are most important?**
   - Profile info
   - Household
   - Notifications
   - Theme (light/dark)

2. **Should we add a "Help & Support" section?**
   - FAQ
   - Contact us
   - Privacy policy

---

## 8. Journey 7: Meal Detail Modal

**Status**: ✅ Implemented  
**Trigger**: User taps a meal card  
**Goal**: Show full meal details

### Flow

```
[User taps meal card]
    ↓
[Open Meal Detail Modal (bottom sheet)]
    ↓
[Show meal info]
- Emoji (large)
- Name
- Custom badge (if isCustom: 1)
- Suggested for tags (breakfast, lunch, dinner, snack)
- Prep time
- Difficulty badge
- Calories (if available)
- YouTube link (if available)
    ↓
[Show Ingredients]
- Bullet list with name + quantity
    ↓
[Show Steps]
- Numbered list
    ↓
[Show dietary tags] (if any)
- "🌿 gluten-free"
    ↓
[User taps "Close" or overlay]
    ↓
[Close modal]
```

### Data Read

**Collection**: `users/{uid}/customMeals/{mealId}`
- Read meal document by ID

### Questions / Improvements Needed

1. **Should users be able to edit meal from here?**
   - Current: No edit option
   - Feature: "Edit" button for custom meals
   - Data impact: Navigate to edit form

2. **Should users be able to add to favorites?**
   - Current: No favorites
   - Feature: Heart icon to favorite
   - Data impact: Add `isFavorite` field to meal or separate collection

---

## 9. Journey 8: Household Management

**Status**: ❌ Not implemented  
**Trigger**: User goes to Settings → Household  
**Goal**: Create/join household to share meal plans

### Flow

```
[User opens Settings]
    ↓
[Scroll to "Household" section]
    ↓
{User in household?}
    ├── NO → [Show "Create Household" and "Join Household" buttons]
    │         ↓
    │         [OPTION A: Create Household]
    │         ↓
    │         [User enters household name]
    │         ↓
    │         [Create household document]
    │         - households/{householdId}
    │         ↓
    │         [Create member document]
    │         - households/{householdId}/members/{uid}
    │         - role: 'admin'
    │         ↓
    │         [Update user profile]
    │         - householdId: householdId
    │         - householdRole: 'admin'
    │         ↓
    │         [Show household code]
    │         - "Share this code: SMITH-2024"
    │         ↓
    │         [OPTION B: Join Household]
    │         ↓
    │         [User enters household code]
    │         ↓
    │         [Look up household by code]
    │         ↓
    │         {Household exists?}
    │         ├── NO → [Show error: "Invalid code"]
    │         └── YES → [Create member document]
    │                   - households/{householdId}/members/{uid}
    │                   - role: 'member'
    │                   ↓
    │                   [Update user profile]
    │                   - householdId: householdId
    │                   - householdRole: 'member'
    │                   ↓
    │                   [Show success: "Joined household!"]
    │
    └── YES → [Show household info]
              - Household name
              - Members list
              - Your role (Admin/Member)
              ↓
              [Admin actions]
              - Remove member
              - Generate new code
              - Delete household
              ↓
              [Member actions]
              - Leave household
```

### Data Operations

**Create Household**:
- Write `households/{householdId}`
- Write `households/{householdId}/members/{uid}`
- Update `users/{uid}/profile/main`

**Join Household**:
- Write `households/{householdId}/members/{uid}`
- Update `users/{uid}/profile/main`

**Leave Household**:
- Delete `households/{householdId}/members/{uid}`
- Update `users/{uid}/profile/main` (clear householdId)

### Questions / Improvements Needed

1. **How should household code work?**
   - Option A: Auto-generated (e.g., "SMITH-2024")
   - Option B: User chooses code
   - Option C: Use Firestore document ID

2. **Should household admin be able to remove members?**
   - Yes, but what happens to their data?
   - Option A: Keep their data, just remove access
   - Option B: Delete their shared plans

3. **What happens when household is deleted?**
   - All members lose access
   - All shared plans deleted?
   - Or just mark as "orphaned"?

---

## 10. Data Structure Validation

### Current Data Structure

```
users/{uid}/
  ├── profile/main ✅
  ├── preferences/main ✅
  ├── customMeals/{mealId} ✅
  └── dayPlans/{date} ✅

households/{householdId} ❌
  ├── members/{uid} ❌
  └── plans/{uid}_{date} ❌
```

### Coverage by Journey

| Journey | Data Collections Used | Missing Data? |
|---------|----------------------|---------------|
| Onboarding | profile, preferences, customMeals | ❌ No |
| Login | preferences, customMeals, dayPlans | ❌ No |
| Day View | dayPlans, customMeals | ❌ No |
| Week View | dayPlans, customMeals | ❌ No |
| Add Custom Meal | customMeals | ❌ No |
| Settings | preferences, profile | ❌ No |
| Meal Detail | customMeals | ❌ No |
| Household | households, members, profile | ✅ **YES** |

### Missing Data Structures

1. **Household Plans** (Optional)
   - Path: `households/{householdId}/plans/{uid}_{date}`
   - Purpose: Share day plans with household members
   - **Decision needed**: Do we need this, or can we just query all members' personal plans?

2. **Favorites** (Future)
   - Path: `users/{uid}/favorites/{mealId}`
   - Purpose: User's favorite meals
   - **Decision needed**: Is this a priority?

3. **Meal History** (Future)
   - Path: `users/{uid}/mealHistory/{date}`
   - Purpose: Track what users actually cooked
   - **Decision needed**: Do we need to track cooking history?

### Data Structure Gaps

**Gap 1: Household Plans**
- **Current**: No way to share plans
- **Solution A**: Duplicate plans to `households/{id}/plans/`
- **Solution B**: Query all household members' `dayPlans` and merge
- **Recommendation**: Solution B (simpler, no duplication)

**Gap 2: User Profile Fields**
- **Current**: Only has basic fields
- **Missing**: phoneNumber, address
- **Recommendation**: Add when needed, not now

**Gap 3: Meal Ratings** (Future)
- **Current**: No rating system
- **Missing**: Rating, review text
- **Recommendation**: Add in Phase 3

---

## 11. Implementation Roadmap

### Phase 1: Core Features (Current)
- ✅ Onboarding
- ✅ Day/Week meal planning
- ✅ Add custom meals
- ✅ Settings (basic)

### Phase 2: Household Linking (Next)
- ❌ Household creation/joining
- ❌ Household member management
- ❌ Shared meal plan visibility
- ❌ User profile enhancement

### Phase 3: Enhanced Features (Future)
- ❌ Manual meal assignment (drag & drop)
- ❌ Favorites/bookmarks
- ❌ Shopping list generation
- ❌ Meal ratings/reviews
- ❌ Notifications
- ❌ Dark mode

---

## 12. Open Questions

1. **Household Code**: Auto-generated or user-chosen?
2. **Plan Sharing**: Duplicate to household or query members' plans?
3. **Custom Meal Privacy**: Keep private or share with household?
4. **Login Method**: Anonymous only or add email/password?
5. **Manual Meal Assignment**: Drag-and-drop or picker?
6. **Favorites**: Needed in Phase 1 or later?
7. **Address Collection**: When and why?

---

*Document version 1.0 — June 2026*