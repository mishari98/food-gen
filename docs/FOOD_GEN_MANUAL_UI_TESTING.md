# FoodGen Manual UI Testing Checklist

> **Purpose:** Step-by-step manual testing guide for all pages and functionalities
> **Status:** Use `- [ ]` for pending, `- [x]` for completed, `- [~]` for partial
> **Tester:** _______________
> **Date:** _______________

---

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Authentication & Onboarding](#1-authentication--onboarding)
3. [Household Dashboard](#2-household-dashboard)
4. [Day Page (Meal Planning)](#3-day-page-meal-planning)
5. [Week Page](#4-week-page)
6. [History Page](#5-history-page)
7. [Add Meal Page](#6-add-meal-page)
8. [Settings Page](#7-settings-page)
9. [Household Management Page](#8-household-management-page)
10. [Cross-Page Navigation & Routing](#9-cross-page-navigation--routing)
11. [Role-Based Access Control](#10-role-based-access-control)
12. [Error Handling & Edge Cases](#11-error-handling--edge-cases)
13. [Responsive Design & UI/UX](#12-responsive-design--uiux)

---

## Pre-Testing Setup

### Environment Setup
- [ ] Application is deployed and accessible via browser
- [ ] Firebase is properly configured
- [ ] Test accounts available:
  - [ ] Admin account (email: _______________)
  - [ ] Editor account (email: _______________)
  - [ ] Viewer account (email: _______________)
  - [ ] New user account (for signup testing)
- [ ] Test household exists with invite code: _______________
- [ ] Browser console open for error monitoring
- [ ] Network tab open for API call monitoring

### Test Data Prepared
- [ ] At least 1 household created
- [ ] At least 3 members in household (admin, editor, viewer)
- [ ] At least 2 pending invites available
- [ ] At least 1 pending join request available
- [ ] At least 5 meals generated for current week
- [ ] At least 3 custom meals added
- [ ] At least 2 meal suggestions pending

---

## 1. Authentication & Onboarding

### Page: `/` or `/onboarding` (OnboardingPage)

#### Visual Checks
- [ ] Page loads with FoodGen logo (🍽️) and title "FoodGen"
- [ ] Subtitle "Filipino Meal Planning for Your Household" is visible
- [ ] Form is centered and visually appealing
- [ ] Input fields have proper labels and placeholders
- [ ] Buttons have appropriate styling (primary, secondary, danger)

#### Sign Up Flow Tests

##### Happy Path
- [ ] **TC-AUTH-001:** Sign up with valid data
  - Name: "Test User"
  - Email: `testuser@example.com`
  - Password: `password123` (6+ characters)
  - Confirm Password: `password123`
  - **Expected:** Account created, redirected to `/dashboard`
  - **Result:** ☐ Pass ☐ Fail
  - **Notes:** _______________

##### Validation Tests
- [ ] **TC-AUTH-002:** Sign up with empty name field
  - **Expected:** Error "Please enter your name"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-003:** Sign up with mismatched passwords
  - Password: `password123`
  - Confirm Password: `password456`
  - **Expected:** Error "Passwords do not match"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-004:** Sign up with short password (< 6 characters)
  - Password: `12345`
  - **Expected:** Error "Password must be at least 6 characters"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-005:** Sign up with invalid email format
  - Email: `invalid-email`
  - **Expected:** Browser validation error or Firebase error
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-006:** Sign up with already registered email
  - **Expected:** Error "The email address is already in use"
  - **Result:** ☐ Pass ☐ Fail

#### Login Flow Tests

##### Happy Path
- [ ] **TC-AUTH-007:** Login with valid credentials
  - Click "Log In" toggle
  - Email: `existing@example.com`
  - Password: `correctpassword`
  - **Expected:** Successfully logged in, redirected to `/dashboard`
  - **Result:** ☐ Pass ☐ Fail

##### Error Tests
- [ ] **TC-AUTH-008:** Login with wrong password
  - **Expected:** Error "Firebase: Error (auth/wrong-password)"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-009:** Login with non-existent email
  - **Expected:** Error "Firebase: Error (auth/user-not-found)"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-010:** Login with empty fields
  - **Expected:** Browser validation prevents submission
  - **Result:** ☐ Pass ☐ Fail

#### Forgot Password Flow
- [ ] **TC-AUTH-011:** Forgot password - valid email
  - Click "Forgot Password?" link
  - Enter registered email
  - Click "Send Reset Link"
  - **Expected:** Success message "Password reset email sent! Check your inbox."
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-012:** Forgot password - invalid email
  - **Expected:** Error message
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-013:** Forgot password modal - cancel
  - Click "Cancel" button
  - **Expected:** Modal closes
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-014:** Forgot password modal - close on overlay click
  - Click outside modal
  - **Expected:** Modal closes
  - **Result:** ☐ Pass ☐ Fail

#### UI/UX Tests
- [ ] **TC-AUTH-015:** Toggle between Sign Up and Login modes
  - **Expected:** Form switches correctly, confirm password field shows/hides
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-016:** Loading state during authentication
  - **Expected:** Button shows "Please wait..." and is disabled
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-017:** Error message display
  - **Expected:** Error appears in red below form
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-AUTH-018:** Already logged in user visits onboarding
  - **Expected:** Redirected to `/dashboard`
  - **Result:** ☐ Pass ☐ Fail

---

## 2. Household Dashboard

### Page: `/dashboard` (HouseholdDashboard)

#### Pre-condition: User must be logged in

#### No Household State

##### Visual Checks
- [ ] **TC-DASH-001:** Page loads with welcome message
  - **Expected:** "Welcome, [User Name]!" displayed
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-002:** "Not part of a household" message visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-003:** Two action buttons visible: "Create Household" and "Join Household"
  - **Result:** ☐ Pass ☐ Fail

##### Create Household Flow
- [ ] **TC-DASH-004:** Create household - happy path
  - Click "Create Household"
  - Enter household name: "Test Family"
  - Click "Create"
  - **Expected:** Household created, redirected to household view
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-005:** Create household - empty name
  - **Expected:** Browser validation prevents submission
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-006:** Create household - cancel
  - Click "Cancel" button
  - **Expected:** Modal closes, no household created
  - **Result:** ☐ Pass ☐ Fail

##### Join Household Flow
- [ ] **TC-DASH-007:** Join household - valid invite code
  - Click "Join Household"
  - Enter invite code: `ABC12345`
  - Select role: "Editor"
  - Click "Join"
  - **Expected:** Successfully joined, redirected to household view
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-008:** Join household - invalid invite code
  - **Expected:** Error "Invalid invite code"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-009:** Join household - empty invite code
  - **Expected:** Browser validation prevents submission
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-010:** Join household - cancel
  - **Expected:** Modal closes
  - **Result:** ☐ Pass ☐ Fail

#### With Household State

##### Visual Checks
- [ ] **TC-DASH-011:** Household info displayed
  - **Expected:** Household name, address, member count, week start day visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-012:** Role badge displayed
  - **Expected:** Shows "admin", "editor", or "viewer"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-013:** "Go to Meal Plans" button visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-014:** Admin sees "Manage Household" button
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-015:** "Leave Household" button visible
  - **Result:** ☐ Pass ☐ Fail

##### Pending Invites
- [ ] **TC-DASH-016:** Accept invite
  - Click "Accept" on pending invite
  - **Expected:** Invite accepted, household loaded
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-017:** Reject invite
  - Click "Reject" on pending invite
  - **Expected:** Invite removed from list
  - **Result:** ☐ Pass ☐ Fail

##### Navigation
- [ ] **TC-DASH-018:** Click "Go to Meal Plans"
  - **Expected:** Navigate to `/day`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-019:** Click "Manage Household" (admin only)
  - **Expected:** Navigate to `/household/manage`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DASH-020:** Click "Leave Household"
  - **Expected:** Confirmation dialog, then back to no-household state
  - **Result:** ☐ Pass ☐ Fail

---

## 3. Day Page (Meal Planning)

### Page: `/day` (DayPage)

#### Pre-condition: User must be in a household

#### Visual Checks
- [ ] **TC-DAY-001:** Page loads with header
  - **Expected:** Home icon (🏠), "FoodGen" title, Settings icon (⚙️)
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-002:** Date picker visible and functional
  - **Expected:** Shows today's date, can select future dates (up to 1 year)
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-003:** "Today" button appears when viewing past/future date
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-004:** Tab bar visible at bottom
  - **Expected:** Day, Week, History tabs
  - **Result:** ☐ Pass ☐ Fail

#### Empty State (No Meals)

##### Admin/Editor View
- [ ] **TC-DAY-005:** Empty state shows "No meals planned yet"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-006:** "Generate Meals" button visible for admin/editor
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-007:** "Add Meal Manually" button visible for admin/editor
  - **Result:** ☐ Pass ☐ Fail

##### Viewer View
- [ ] **TC-DAY-008:** Viewer sees "Ask your household admin to plan meals"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-009:** No action buttons for viewer
  - **Result:** ☐ Pass ☐ Fail

#### Generate Meals Flow

##### Happy Path
- [ ] **TC-DAY-010:** Generate meals - select count
  - Click "Generate Meals"
  - Select "3 meals"
  - Click "Generate"
  - **Expected:** 3 meals generated and displayed
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-011:** Generate meals - 1 meal
  - **Expected:** 1 meal generated
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-012:** Generate meals - 2 meals
  - **Expected:** 2 meals generated
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-013:** Generate meals - 4 meals
  - **Expected:** 4 meals generated
  - **Result:** ☐ Pass ☐ Fail

##### Regenerate Flow
- [ ] **TC-DAY-014:** Regenerate meals - confirm
  - Click "Regenerate Meals"
  - Confirm dialog appears
  - Click OK
  - **Expected:** Meals regenerated
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-015:** Regenerate meals - cancel
  - Click "Regenerate Meals"
  - Click Cancel in dialog
  - **Expected:** Meals unchanged
  - **Result:** ☐ Pass ☐ Fail

##### Error Cases
- [ ] **TC-DAY-016:** Generate meals - no meals available
  - **Expected:** Error message displayed
  - **Result:** ☐ Pass ☐ Fail

#### Meal Card Interactions

##### View Meal Details
- [ ] **TC-DAY-017:** Click meal card to view details
  - **Expected:** MealDetailModal opens with full recipe
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-018:** Close meal detail modal
  - Click X or overlay
  - **Expected:** Modal closes
  - **Result:** ☐ Pass ☐ Fail

##### Status Cycling
- [ ] **TC-DAY-019:** Click status badge to cycle
  - Click status: "Planned" → "In Progress" → "Completed" → "Skipped" → "Planned"
  - **Expected:** Status changes correctly
  - **Result:** ☐ Pass ☐ Fail

##### Remove Meal
- [ ] **TC-DAY-020:** Remove meal - confirm
  - Click remove button (🗑️)
  - Click OK in confirmation
  - **Expected:** Meal removed from plan
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-021:** Remove meal - cancel
  - Click remove button
  - Click Cancel
  - **Expected:** Meal remains
  - **Result:** ☐ Pass ☐ Fail

#### Add Meal Manually

##### Happy Path
- [ ] **TC-DAY-022:** Add meal from picker
  - Click "Add Meal"
  - Search for "Adobo"
  - Click on "Adobo" in list
  - **Expected:** Meal added to plan
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-023:** Add meal - no search
  - Click "Add Meal"
  - Browse list
  - Select any meal
  - **Expected:** Meal added
  - **Result:** ☐ Pass ☐ Fail

##### Search Functionality
- [ ] **TC-DAY-024:** Search meals - found
  - Search: "Sinigang"
  - **Expected:** Only matching meals shown
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-025:** Search meals - not found
  - Search: "xyznonexistent"
  - **Expected:** "No meals found matching" message
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-026:** Search meals - clear search
  - Search then clear input
  - **Expected:** All meals shown again
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-027:** Search meals - case insensitive
  - Search: "adobo" (lowercase)
  - **Expected:** "Adobo" found
  - **Result:** ☐ Pass ☐ Fail

#### Meal Suggestions
- [ ] **TC-DAY-028:** View pending suggestions banner
  - **Expected:** Banner shows "Pending Suggestions (N)"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-029:** Accept suggestion
  - Click ✓ on suggestion
  - **Expected:** Suggestion accepted, meal swapped
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-030:** Reject suggestion
  - Click ✕ on suggestion
  - **Expected:** Suggestion rejected, removed from list
  - **Result:** ☐ Pass ☐ Fail

#### Suggest Swap Flow
- [ ] **TC-DAY-031:** Suggest swap - happy path
  - Click swap button on meal
  - Select replacement meal
  - Click "Suggest Swap"
  - **Expected:** Swap suggested, modal closes
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-032:** Suggest swap - cancel
  - Click swap button
  - Click "Cancel"
  - **Expected:** Modal closes, no change
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-033:** Suggest swap - no meal selected
  - Click swap button
  - Click "Suggest Swap" without selecting
  - **Expected:** Button disabled
  - **Result:** ☐ Pass ☐ Fail

#### Date Navigation
- [ ] **TC-DAY-034:** Navigate to future date
  - Select date 7 days from now
  - **Expected:** Date picker updates, empty state shown
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-035:** Navigate to past date
  - Select date 7 days ago
  - **Expected:** Shows meals for that date if generated
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-036:** Click "Today" button
  - Navigate away, then click "Today"
  - **Expected:** Returns to current date
  - **Result:** ☐ Pass ☐ Fail

#### Loading & Error States
- [ ] **TC-DAY-037:** Loading state
  - Refresh page
  - **Expected:** "Loading your meals..." shown briefly
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-DAY-038:** Error state
  - **Expected:** Error banner shown if Firebase error
  - **Result:** ☐ Pass ☐ Fail

---

## 4. Week Page

### Page: `/week` (WeekPage)

#### Pre-condition: User must be in a household

#### Visual Checks
- [ ] **TC-WEEK-001:** Page loads with header
  - **Expected:** Home icon, "Week N" title, Settings icon
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-002:** Week picker visible
  - **Expected:** Date input showing week start
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-003:** "This Week" button appears when viewing other weeks
  - **Result:** ☐ Pass ☐ Fail

#### Empty State
- [ ] **TC-WEEK-004:** No weekly plan - empty state
  - **Expected:** "No weekly plan yet" message
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-005:** "Generate Weekly Plan" button for admin/editor
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-006:** Viewer sees "Ask your household admin"
  - **Result:** ☐ Pass ☐ Fail

#### Generate Week Plan
- [ ] **TC-WEEK-007:** Generate week - confirm
  - Click "Generate This Week"
  - Confirm dialog
  - Select meal count
  - Click "Generate Week"
  - **Expected:** 7 day plans generated
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-008:** Generate week - cancel
  - Click "Generate This Week"
  - Click "Cancel"
  - **Expected:** No changes
  - **Result:** ☐ Pass ☐ Fail

#### Day Row Interactions

##### Expand/Collapse
- [ ] **TC-WEEK-009:** Expand day row
  - Click on day header
  - **Expected:** Day expands, shows meals
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-010:** Collapse day row
  - Click expanded day header
  - **Expected:** Day collapses
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-011:** Multiple days expanded
  - Expand multiple days
  - **Expected:** All remain expanded
  - **Result:** ☐ Pass ☐ Fail

##### Day Actions (Admin/Editor)
- [ ] **TC-WEEK-012:** Regenerate single day
  - Expand day
  - Click "Regenerate"
  - Confirm
  - **Expected:** Day meals regenerated
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-013:** Add meal to specific day
  - Expand day
  - Click "Add Meal"
  - Select meal
  - **Expected:** Meal added to that day
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-014:** Remove meal from day
  - Expand day
  - Click remove on meal
  - Confirm
  - **Expected:** Meal removed
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-015:** Change meal status in week view
  - Click status badge
  - **Expected:** Status cycles
  - **Result:** ☐ Pass ☐ Fail

##### Viewer Restrictions
- [ ] **TC-WEEK-016:** Viewer cannot see regenerate button
  - **Expected:** No regenerate/add buttons
  - **Result:** ☐ Pass ☐ Fail

#### Week Navigation
- [ ] **TC-WEEK-017:** Navigate to previous week
  - Click ◀ button
  - **Expected:** Shows previous week's plans
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-018:** Navigate to next week
  - Click ▶ button
  - **Expected:** Shows next week's plans
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-019:** Jump to current week
  - Navigate away, click "This Week"
  - **Expected:** Returns to current week
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-020:** Week picker date change
  - Select date in different week
  - **Expected:** Week updates
  - **Result:** ☐ Pass ☐ Fail

#### Meal Detail Modal
- [ ] **TC-WEEK-021:** View meal details from week view
  - Click meal card
  - **Expected:** Modal opens
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-WEEK-022:** Close modal
  - **Expected:** Modal closes
  - **Result:** ☐ Pass ☐ Fail

---

## 5. History Page

### Page: `/history` (HistoryPage)

#### Pre-condition: User must be in a household with generated meals

#### Visual Checks
- [ ] **TC-HIST-001:** Page loads with header
  - **Expected:** Back arrow, "Plan History" title
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-002:** Week selector visible
  - **Expected:** ◀ Week N Year ▶ buttons
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-003:** "This Week" button when viewing other weeks
  - **Result:** ☐ Pass ☐ Fail

#### No Household State
- [ ] **TC-HIST-004:** No household message
  - **Expected:** "Join or create a household" message
  - **Result:** ☐ Pass ☐ Fail

#### No Plans State
- [ ] **TC-HIST-005:** No plans for week
  - **Expected:** "No plans for this week" message
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-006:** "Go to Meal Plans" button
  - **Expected:** Navigate to `/day`
  - **Result:** ☐ Pass ☐ Fail

#### History Cards
- [ ] **TC-HIST-007:** History card displays correctly
  - **Expected:** Day name, date, meal count, emoji preview
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-008:** Meal emoji preview (up to 4)
  - **Expected:** Shows first 4 meal emojis
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-009:** Overflow indicator
  - **Expected:** Shows "+N" if more than 4 meals
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-010:** View day from history
  - Click "View" button
  - **Expected:** Navigate to `/day` for that date
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-011:** Regenerate from history
  - Click "Regenerate" button
  - Confirm
  - **Expected:** Day regenerated
  - **Result:** ☐ Pass ☐ Fail

#### Week Navigation
- [ ] **TC-HIST-012:** Previous week
  - Click ◀
  - **Expected:** Shows previous week
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-013:** Next week
  - Click ▶
  - **Expected:** Shows next week
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-014:** Year boundary - week 52 to week 1
  - Navigate to week 52, then next
  - **Expected:** Shows week 1 of next year
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-015:** Year boundary - week 1 to week 52
  - Navigate to week 1, then previous
  - **Expected:** Shows week 52 of previous year
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-HIST-016:** Jump to current week
  - Navigate away, click "This Week"
  - **Expected:** Returns to current week
  - **Result:** ☐ Pass ☐ Fail

#### Sorting
- [ ] **TC-HIST-017:** Plans sorted by date (newest first)
  - **Expected:** Most recent date at top
  - **Result:** ☐ Pass ☐ Fail

#### Meal Detail Modal
- [ ] **TC-HIST-018:** View meal details from history
  - Click on meal emoji
  - **Expected:** Modal opens
  - **Result:** ☐ Pass ☐ Fail

---

## 6. Add Meal Page

### Page: `/add-meal` (AddMealPage)

#### Pre-condition: User must be logged in

#### Visual Checks
- [ ] **TC-ADD-001:** Page loads with header
  - **Expected:** Back arrow, "Add Meal" title, Save button
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-002:** All form fields visible
  - **Expected:** Name, Suggested For, Cuisine, Prep Time, Difficulty, Emoji, Ingredients, Steps, Calories
  - **Result:** ☐ Pass ☐ Fail

#### Form Validation

##### Required Fields
- [ ] **TC-ADD-003:** Save with empty name
  - **Expected:** Alert "Please enter a meal name"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-004:** Save with no meal slots selected
  - **Expected:** Alert "Please select at least one meal slot"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-005:** Save with no ingredients
  - **Expected:** Alert "Please add at least one ingredient"
  - **Result:** ☐ Pass ☐ Fail

##### Suggested For (Meal Slots)
- [ ] **TC-ADD-006:** Select single slot
  - Check "Breakfast" only
  - **Expected:** Only breakfast selected
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-007:** Select multiple slots
  - Check "Lunch" and "Dinner"
  - **Expected:** Both selected
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-008:** Deselect slot
  - Check then uncheck
  - **Expected:** Slot removed
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-009:** Default slots selected
  - **Expected:** Lunch and Dinner checked by default
  - **Result:** ☐ Pass ☐ Fail

#### Dynamic Fields

##### Ingredients
- [ ] **TC-ADD-010:** Add ingredient
  - Click "+ Add Ingredient"
  - **Expected:** New empty ingredient row added
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-011:** Add multiple ingredients
  - Add 5 ingredients
  - **Expected:** All 5 rows visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-012:** Remove ingredient
  - Click 🗑️ on ingredient
  - **Expected:** Ingredient removed
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-013:** Cannot remove last ingredient
  - Try to remove when only 1 remains
  - **Expected:** Remove button hidden/disabled
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-014:** Fill ingredient name and quantity
  - Name: "Pork"
  - Quantity: "500g"
  - **Expected:** Values saved
  - **Result:** ☐ Pass ☐ Fail

##### Steps
- [ ] **TC-ADD-015:** Add step
  - Click "+ Add Step"
  - **Expected:** New step textarea added
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-016:** Add multiple steps
  - Add 5 steps
  - **Expected:** All 5 visible, numbered 1-5
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-017:** Remove step
  - Click 🗑️ on step
  - **Expected:** Step removed, numbers updated
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-018:** Cannot remove last step
  - **Expected:** Remove button hidden when only 1 step
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-019:** Enter step text
  - **Expected:** Text saved in textarea
  - **Result:** ☐ Pass ☐ Fail

#### Other Fields
- [ ] **TC-ADD-020:** Cuisine dropdown
  - Select "Italian"
  - **Expected:** Value saved
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-021:** Prep time
  - Enter "45"
  - **Expected:** Value saved
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-022:** Difficulty selection
  - Select "Medium"
  - **Expected:** Radio button selected
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-023:** Emoji field
  - Enter "🍖"
  - **Expected:** Value saved (max 2 chars)
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-024:** Calories field
  - Enter "350"
  - **Expected:** Value saved
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-025:** Calories - optional
  - Leave empty
  - **Expected:** Can still save
  - **Result:** ☐ Pass ☐ Fail

#### Save Flow
- [ ] **TC-ADD-026:** Save meal - happy path
  - Fill all required fields
  - Click "Save Meal"
  - **Expected:** Success alert, navigate to `/day`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-027:** Save meal - not logged in
  - **Expected:** Alert "You must be logged in"
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-028:** Save meal - error handling
  - **Expected:** Error alert with message
  - **Result:** ☐ Pass ☐ Fail

#### Navigation
- [ ] **TC-ADD-029:** Back button
  - Click ←
  - **Expected:** Navigate to `/day`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ADD-030:** Save button in header
  - **Expected:** Same as bottom save button
  - **Result:** ☐ Pass ☐ Fail

---

## 7. Settings Page

### Page: `/settings` (SettingsPage)

#### Pre-condition: User must be logged in

#### Visual Checks
- [ ] **TC-SET-001:** Page loads with header
  - **Expected:** Home icon, "Settings" title
  - **Result:** ☐ Pass ☐ Fail

#### Household Section
- [ ] **TC-SET-002:** Household info displayed
  - **Expected:** Name, role badge, week start, member count
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-SET-003:** Admin sees "Manage Household" button
  - **Expected:** Button visible for admin
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-SET-004:** Viewer doesn't see manage button
  - **Expected:** Button hidden for viewer
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-SET-005:** Pending requests badge (admin)
  - **Expected:** Shows count if pending requests exist
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-SET-006:** Navigate to household management
  - Click "Manage Household"
  - **Expected:** Navigate to `/household/manage`
  - **Result:** ☐ Pass ☐ Fail

#### Account Section
- [ ] **TC-SET-007:** Account info displayed
  - **Expected:** Avatar, name, email shown
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-SET-008:** Sign out - confirm
  - Click "Sign Out"
  - Click OK in confirmation
  - **Expected:** Signed out, redirected to `/`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-SET-009:** Sign out - cancel
  - Click "Sign Out"
  - Click Cancel
  - **Expected:** Remains logged in
  - **Result:** ☐ Pass ☐ Fail

#### About Section
- [ ] **TC-SET-010:** About info displayed
  - **Expected:** App name, version, meal count, sync status
  - **Result:** ☐ Pass ☐ Fail

#### No Household State
- [ ] **TC-SET-011:** Household section hidden when no household
  - **Expected:** Only Account and About sections shown
  - **Result:** ☐ Pass ☐ Fail

---

## 8. Household Management Page

### Page: `/household/manage` (HouseholdManagementPage)

#### Pre-condition: User must be admin of a household

#### Access Control
- [ ] **TC-MGMT-001:** Non-admin access denied
  - Login as viewer/editor
  - Navigate to `/household/manage`
  - **Expected:** "Only admins can manage household" message
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-002:** No household access denied
  - **Expected:** Redirect or access denied message
  - **Result:** ☐ Pass ☐ Fail

#### Visual Checks (Admin View)
- [ ] **TC-MGMT-003:** Page loads with header
  - **Expected:** Back arrow, "Manage Household" title
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-004:** Household info section
  - **Expected:** Name, address, member count, week start, invite code
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-005:** Invite code displayed
  - **Expected:** 8-character code shown
  - **Result:** ☐ Pass ☐ Fail

#### Members Section
- [ ] **TC-MGMT-006:** Member list displayed
  - **Expected:** All members with name and role badge
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-007:** Member count matches
  - **Expected:** Count matches household.maxMembers
  - **Result:** ☐ Pass ☐ Fail

#### Pending Requests (Admin)
- [ ] **TC-MGMT-008:** Pending requests displayed
  - **Expected:** List of requests with name, email, role
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-009:** Accept join request
  - Click "Accept"
  - **Expected:** Request approved, user becomes member
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-010:** Reject join request
  - Click "Reject"
  - **Expected:** Request removed
  - **Result:** ☐ Pass ☐ Fail

#### Invite Member
- [ ] **TC-MGMT-011:** Send invite - happy path
  - Enter email: `newmember@example.com`
  - Select role: "Editor"
  - Click "Send Invite"
  - **Expected:** Invite sent, form cleared
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-012:** Send invite - empty email
  - **Expected:** Browser validation prevents submission
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-013:** Send invite - invalid email
  - **Expected:** Validation error
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-014:** Send invite - error handling
  - **Expected:** Error message displayed
  - **Result:** ☐ Pass ☐ Fail

#### Activity Log
- [ ] **TC-MGMT-015:** Activity log displayed
  - **Expected:** Recent activities listed (max 20)
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-016:** Activity log format
  - **Expected:** Action, details, user name shown
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-017:** Empty activity log
  - **Expected:** "No activity yet" message
  - **Result:** ☐ Pass ☐ Fail

#### Invite Code History
- [ ] **TC-MGMT-018:** Invite code history displayed
  - **Expected:** Previous codes with status and date
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-019:** Empty invite code history
  - **Expected:** "No previous invite codes" message
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-020:** Regenerate invite code
  - Click "Regenerate Invite Code"
  - **Expected:** New code generated, old code marked inactive
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-021:** New invite code active
  - **Expected:** New code shown in household info
  - **Result:** ☐ Pass ☐ Fail

#### Leave Household
- [ ] **TC-MGMT-022:** Leave household - confirm
  - Click "Leave Household"
  - Click OK
  - **Expected:** Left household, redirected to dashboard
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-MGMT-023:** Leave household - cancel
  - Click "Leave Household"
  - Click Cancel
  - **Expected:** Remains in household
  - **Result:** ☐ Pass ☐ Fail

#### Navigation
- [ ] **TC-MGMT-024:** Back button
  - Click ←
  - **Expected:** Navigate to `/settings`
  - **Result:** ☐ Pass ☐ Fail

---

## 9. Cross-Page Navigation & Routing

### Navigation Flow Tests

#### Tab Bar Navigation
- [ ] **TC-NAV-001:** Day tab - active state
  - Navigate to `/day`
  - **Expected:** Day tab highlighted
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-002:** Week tab - active state
  - Navigate to `/week`
  - **Expected:** Week tab highlighted
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-003:** History tab - active state
  - Navigate to `/history`
  - **Expected:** History tab highlighted
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-004:** Tab navigation works
  - Click each tab
  - **Expected:** Page changes correctly
  - **Result:** ☐ Pass ☐ Fail

#### Header Navigation
- [ ] **TC-NAV-005:** Home icon navigates to dashboard
  - Click 🏠 on any main page
  - **Expected:** Navigate to `/dashboard`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-006:** Settings icon navigates to settings
  - Click ⚙️ on Day/Week page
  - **Expected:** Navigate to `/settings`
  - **Result:** ☐ Pass ☐ Fail

#### Deep Linking
- [ ] **TC-NAV-007:** Direct URL to `/day`
  - Enter URL: `/#/day`
  - **Expected:** Loads DayPage (if authenticated with household)
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-008:** Direct URL to `/week`
  - Enter URL: `/#/week`
  - **Expected:** Loads WeekPage
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-009:** Direct URL to `/history`
  - Enter URL: `/#/history`
  - **Expected:** Loads HistoryPage
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-010:** Direct URL to `/settings`
  - Enter URL: `/#/settings`
  - **Expected:** Loads SettingsPage (if authenticated)
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-011:** Direct URL to `/household/manage`
  - Enter URL: `/#/household/manage`
  - **Expected:** Loads HouseholdManagementPage (if admin)
  - **Result:** ☐ Pass ☐ Fail

#### Route Guards
- [ ] **TC-NAV-012:** Unauthenticated access to protected routes
  - Logout, try to access `/day`
  - **Expected:** Redirected to `/`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-013:** No household access to household routes
  - Login without household, try `/day`
  - **Expected:** Redirected to `/dashboard`
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-014:** Invalid route
  - Enter `/#/invalid`
  - **Expected:** Redirected to `/`
  - **Result:** ☐ Pass ☐ Fail

#### Browser Navigation
- [ ] **TC-NAV-015:** Back button works
  - Navigate through pages, click browser back
  - **Expected:** Returns to previous page
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-NAV-016:** Forward button works
  - After back, click forward
  - **Expected:** Returns to next page
  - **Result:** ☐ Pass ☐ Fail

---

## 10. Role-Based Access Control

### Admin Role Tests
- [ ] **TC-ROLE-001:** Admin can generate meals
  - **Expected:** Generate buttons visible on Day/Week
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-002:** Admin can regenerate meals
  - **Expected:** Regenerate buttons visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-003:** Admin can add meals manually
  - **Expected:** "Add Meal" buttons visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-004:** Admin can remove meals
  - **Expected:** Remove buttons (🗑️) visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-005:** Admin can change meal status
  - **Expected:** Status badges clickable
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-006:** Admin can suggest swaps
  - **Expected:** Swap button visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-007:** Admin can manage household
  - **Expected:** "Manage Household" button visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-008:** Admin can accept/reject requests
  - **Expected:** Accept/Reject buttons on requests
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-009:** Admin can invite members
  - **Expected:** Invite form visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-010:** Admin can regenerate invite code
  - **Expected:** "Regenerate Invite Code" button visible
  - **Result:** ☐ Pass ☐ Fail

### Editor Role Tests
- [ ] **TC-ROLE-011:** Editor can generate meals
  - **Expected:** Generate buttons visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-012:** Editor can regenerate meals
  - **Expected:** Regenerate buttons visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-013:** Editor can add meals manually
  - **Expected:** "Add Meal" buttons visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-014:** Editor can remove meals
  - **Expected:** Remove buttons visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-015:** Editor can change meal status
  - **Expected:** Status badges clickable
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-016:** Editor can suggest swaps
  - **Expected:** Swap button visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-017:** Editor CANNOT manage household
  - **Expected:** No "Manage Household" button
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-018:** Editor CANNOT accept/reject requests
  - **Expected:** No request management UI
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-019:** Editor CANNOT invite members
  - **Expected:** No invite form
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-020:** Editor CANNOT regenerate invite code
  - **Expected:** Button not visible
  - **Result:** ☐ Pass ☐ Fail

### Viewer Role Tests
- [ ] **TC-ROLE-021:** Viewer CANNOT generate meals
  - **Expected:** No generate buttons
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-022:** Viewer CANNOT regenerate meals
  - **Expected:** No regenerate buttons
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-023:** Viewer CANNOT add meals
  - **Expected:** No "Add Meal" buttons
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-024:** Viewer CANNOT remove meals
  - **Expected:** No remove buttons
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-025:** Viewer CANNOT change meal status
  - **Expected:** Status badges not clickable
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-026:** Viewer CANNOT suggest swaps
  - **Expected:** No swap button
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-027:** Viewer can view meals
  - **Expected:** Meals displayed, can click for details
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ROLE-028:** Viewer can navigate all pages
  - **Expected:** All navigation works
  - **Result:** ☐ Pass ☐ Fail

---

## 11. Error Handling & Edge Cases

### Network Errors
- [ ] **TC-ERR-001:** Offline mode
  - Disconnect network, try to load page
  - **Expected:** Error message or graceful degradation
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-002:** Slow network
  - Use throttling (Slow 3G)
  - **Expected:** Loading states shown
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-003:** Firebase timeout
  - **Expected:** Error after timeout, not infinite loading
  - **Result:** ☐ Pass ☐ Fail

### Data Errors
- [ ] **TC-ERR-004:** Missing meal data
  - **Expected:** Graceful handling, no crash
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-005:** Corrupted plan data
  - **Expected:** Error message, not crash
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-006:** Empty meal pool
  - **Expected:** Error "No meals available"
  - **Result:** ☐ Pass ☐ Fail

### Concurrent Actions
- [ ] **TC-ERR-007:** Double-click generate
  - Rapidly click generate button
  - **Expected:** Only one generation occurs
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-008:** Multiple status changes
  - Rapidly click status badge
  - **Expected:** Final state correct
  - **Result:** ☐ Pass ☐ Fail

### Browser Compatibility
- [ ] **TC-ERR-009:** Chrome/Edge
  - **Expected:** All features work
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-010:** Firefox
  - **Expected:** All features work
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-011:** Safari
  - **Expected:** All features work
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-ERR-012:** Mobile browser
  - **Expected:** Responsive, all features work
  - **Result:** ☐ Pass ☐ Fail

---

## 12. Responsive Design & UI/UX

### Desktop (> 1024px)
- [ ] **TC-UI-001:** Layout fits screen
  - **Expected:** No horizontal scroll
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-002:** Content centered
  - **Expected:** Max-width container, centered
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-003:** Modals centered
  - **Expected:** Modal in center of screen
  - **Result:** ☐ Pass ☐ Fail

### Tablet (768px - 1024px)
- [ ] **TC-UI-004:** Layout adapts
  - **Expected:** Content readable, no overflow
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-005:** Tab bar accessible
  - **Expected:** Bottom nav visible and tappable
  - **Result:** ☐ Pass ☐ Fail

### Mobile (< 768px)
- [ ] **TC-UI-006:** Single column layout
  - **Expected:** Content stacks vertically
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-007:** Touch-friendly buttons
  - **Expected:** Buttons large enough to tap
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-008:** Modals fullscreen
  - **Expected:** Modal takes most of screen
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-009:** Text readable
  - **Expected:** Font size appropriate
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-010:** No horizontal scroll
  - **Expected:** Content fits width
  - **Result:** ☐ Pass ☐ Fail

### Visual Design
- [ ] **TC-UI-011:** Consistent color scheme
  - **Expected:** Primary, secondary, danger colors used correctly
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-012:** Proper spacing
  - **Expected:** Consistent padding/margins
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-013:** Typography hierarchy
  - **Expected:** Headings, body, labels distinct
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-014:** Icons render correctly
  - **Expected:** All emojis/icons visible
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-015:** Loading spinners
  - **Expected:** Spinner animated, text centered
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-016:** Error messages styled
  - **Expected:** Red background/border, readable
  - **Result:** ☐ Pass ☐ Fail

- [ ] **TC-UI-017:** Success messages styled
  - **Expected:** Green background/border
  - **Result:** ☐ Pass ☐ Fail

---

## Testing Summary

### Test Execution Log

| Category | Total Tests | Passed | Failed | Skipped | Notes |
|----------|-------------|--------|--------|---------|-------|
| Authentication | 18 | 0 | 0 | 0 | |
| Household Dashboard | 20 | 0 | 0 | 0 | |
| Day Page | 38 | 0 | 0 | 0 | |
| Week Page | 22 | 0 | 0 | 0 | |
| History Page | 18 | 0 | 0 | 0 | |
| Add Meal Page | 30 | 0 | 0 | 0 | |
| Settings Page | 10 | 0 | 0 | 0 | |
| Household Management | 24 | 0 | 0 | 0 | |
| Navigation | 16 | 0 | 0 | 0 | |
| Role-Based Access | 28 | 0 | 0 | 0 | |
| Error Handling | 12 | 0 | 0 | 0 | |
| UI/UX | 17 | 0 | 0 | 0 | |
| **TOTAL** | **253** | **0** | **0** | **0** | |

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Minor Issues Found
1. _______________
2. _______________
3. _______________

### Improvements Suggested
1. _______________
2. _______________
3. _______________

---

## Sign-Off

**Tester Name:** _______________

**Date Completed:** _______________

**Overall Status:** ☐ All Tests Passed ☐ Minor Issues Found ☐ Major Issues Found

**Signature:** _______________

---

## Appendix: Quick Reference

### Test Accounts
- Admin: _______________
- Editor: _______________
- Viewer: _______________
- New User: _______________

### Test Household
- Name: _______________
- Invite Code: _______________
- Admin Email: _______________

### URLs
- Production: _______________
- Staging: _______________
- Local: `http://localhost:5173`

### Browser Info
- Browser: _______________
- Version: _______________
- OS: _______________
- Screen Resolution: _______________

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-24  
**Next Review:** _______________