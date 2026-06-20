# FoodGen Web — Enhancements Proposal

## Overview

This document addresses the 5 issues you identified after testing the initial web app. For each issue, I'll explain what's happening now, the implications of the requested change, and present options with recommendations.

---

## Issue 1: Login / Authentication

### Current Behaviour
The app is entirely **offline-first** — no login, no user accounts, no server. All data lives in your browser's IndexedDB. You can open the app on any device and it "just works."

### Requested Change
Add a login screen so users authenticate before using the app.

### Analysis & Trade-offs

| Approach | Pros | Cons | Complexity | Cost |
|----------|------|------|:----------:|:----:|
| **A. Keep offline (no login)** | Instant startup, zero cost, full privacy, works offline | No cross-device sync, no user identity | None | $0 |
| **B. Simple local "onboarding" screen** | Gives a "logged in" feel, no backend needed, user picks a name/avatar stored in IndexedDB | Doesn't provide real auth, no sync | Low | $0 |
| **C. Firebase Auth (email/password or Google)** | Real authentication, can sync data across devices, industry standard | Needs internet for login, adds complexity | Medium | Free tier |
| **D. Self-hosted backend (Node.js + JWT)** | Full control, no third-party dependency | Significantly more complex, needs server maintenance | High | Server cost |

### Recommendation

**Option B — Local Onboarding** (short-term) → **Option C — Firebase Auth** (medium-term)

For an MVP, I recommend a **lightweight onboarding flow** rather than full authentication:
- First visit: show a welcome screen where the user enters a **display name** (stored in localStorage)
- Optionally choose an **avatar emoji**
- This gives the app a personalised feel without requiring a backend

This can evolve to Firebase Auth later when you want cross-device sync (e.g., access your meal plans from both your phone and computer).

---

## Issue 2: Pre-seeded Food Appearing on First Load

### Current Behaviour
When you first open the app, it automatically:
1. Seeds 77 Filipino dishes into IndexedDB
2. **Auto-generates today's meals** using random selection

You see meals immediately with no user action needed.

### Requested Change
Don't show meals automatically. Let the user choose when to generate.

### Analysis

This is a simple change with two approaches:

| Approach | UX Impact | Implementation |
|----------|-----------|---------------|
| **Remove auto-generation** | User sees empty state on first visit with "Generate Today's Meals" button | Remove the auto-generate logic from `MealPlanContext.initialize()` — just seed data, don't generate plans |
| **Keep auto-generation but show intro first** | User sees a brief intro/tutorial, then meals appear | Add an onboarding step before generation |

### Recommendation

**Remove auto-generation entirely.** The app should:
1. First visit → seed data silently in the background
2. Show the **empty state** with a "Generate Today's Meals" button
3. User explicitly taps to generate their first meal plan

This gives the user control from the start and avoids the confusion of "how did these meals appear?"

---

## Issue 3: Breakfast / Lunch / Dinner Labels

### Current Behaviour
Each meal card shows a label like "🌅 Breakfast", "☀️ Lunch", or "🌙 Dinner" above the meal name. There's already a **toggle** (🏷️ ON/OFF) that can hide these labels.

### Requested Change
Remove the labels entirely — just show the meals themselves without categorising by meal slot.

### Analysis

| Approach | Pros | Cons |
|----------|------|------|
| **A. Remove labels entirely** | Cleaner UI, aligns with "user picks meals, not slots" philosophy | Lose context of which meal is for which time of day |
| **B. Keep the toggle but default to OFF** | User can still see labels if they want | Slightly more UI surface area |
| **C. Replace labels with a simpler indicator** | Show only the emoji (🌅☀️🌙) without text | Minimal change |

### Recommendation

**Option A — Remove slot labels entirely from the UI.** This means:
- The `showLabels` toggle in settings becomes unnecessary
- Meal cards show just: emoji + name + prep time + difficulty + custom badge
- The `MealsPerDayPicker` changes from "1 🍽️ (Dinner)" to simply "1 🍽️" — user just picks how many meals, not which slots
- The generator still uses slots internally (breakfast/lunch/dinner) but the UI is slot-agnostic

This simplifies the UX significantly.

---

## Issue 4: Cannot Choose Which Day to Generate (Today Tab)

### Current Behaviour
The **Today tab** always shows **today's date**. You can regenerate today's meals, but you can't pick a different day.

### Requested Change
Let the user freely choose **any date** and generate meals for that specific day.

### Technical Considerations

This requires:
1. A **date picker** component (input type="date" or a calendar)
2. Changing the "Today" tab concept to a **"Day"** tab — user picks any day
3. The generator creates/overwrites meals for the selected date

### Recommendation

**Rename "Today" tab to "Day"** and add a date picker:
- Default to today's date when the tab opens (or last visited date)
- Date input field lets user pick any date (past, present, or future)
- "Generate Meals" button creates a plan for that date
- Plan is stored in IndexedDB keyed by date
- Previously generated days show the stored meals (with option to regenerate)

This is the most impactful UX improvement — it transforms the app from "what's for dinner today" to a full meal planning tool.

---

## Issue 5: Cannot Choose Which Week to Generate (Week Tab)

### Current Behaviour
The **Week tab** always shows the **current week** (Mon–Sun of this week). You can only generate/re-generate for the current week.

### Requested Change
Let the user pick **any week** to view, generate, or modify.

### Technical Considerations

This requires:
1. A **week selector** — could be prev/next arrows with the week label, or a date picker that snaps to weeks
2. Viewing/generating plans for any arbitrary week
3. Storing multiple weeks' worth of plans in IndexedDB (already supported by the data model)

### Recommendation

**Add week navigation** to the Week tab:
- Left arrow (←) and Right arrow (→) to navigate between weeks
- Current week label: "Week 25 — Jun 15–21, 2026"
- "Generate This Week" button creates 7 days of meals for the selected week
- Previously generated weeks are loaded from IndexedDB when navigated to
- "Jump to This Week" button to quickly return to the current week

---

## Finalised Design Decisions (Confirmed)

| # | Issue | Decision |
|:-:|-------|----------|
| 1 | Login / Onboarding | **Required onboarding screen** — first visit shows a welcome screen asking for a display name. Only name, no other fields. |
| 2 | Auto-generated meals | **Remove auto-generation entirely.** Seed data silently, show empty state. User clicks "Generate" to create their first plan. |
| 3 | Slot labels (Breakfast/Lunch/Dinner) | **Remove labels from UI.** Picker shows just "1 🍽️ / 2 🍽️🍽️ / 3 🍽️🍽️🍽️" — no reference to meal slots. |
| 4 | Day tab — date range | **Today and future dates only.** Past dates are accessible via a separate **"📋 History" tab** (3rd tab). |
| 4b | Day tab — existing plan | **Show existing plan immediately** when a date with saved data is selected. Regenerate button shows confirmation dialog. |
| 5 | Week tab — navigation | **Week picker** (flexible, can jump to any week). |
| 5b | Week tab — start day | **Configurable** — user can choose between **Monday** or **Sunday** as the first day of the week. |
| 5c | Week tab — regenerate | **Confirmation dialog** before replacing an existing week plan. |
| 6 | Implementation | **All phases** in order: Phase 1 → Phase 2 → Phase 3 |

## Enhanced Architecture (Post-Decision)

### Tab Structure (3 Tabs)

```
📅 Day Tab          📆 Week Tab          📋 History Tab
├── Date picker     ├── Week picker      ├── List of past
│   (today+)        │   (any week)       │   finalized plans
├── Meal cards      ├── Mon–Sun cards    ├── Click to view/
│   for that date   │   for that week    │   regenerate
├── Generate +      ├── Generate +       └──
│   Regenerate      │   Regenerate       │
└──                 └── Save Plan        │
```

### Changes to Settings

| Setting | Change |
|---------|--------|
| Meals Per Day | **Kept** — simplified to "1 🍽️ / 2 🍽️🍽️ / 3 🍽️🍽️🍽️" |
| Show Labels | **Removed** — labels no longer exist |
| Week Start Day | **New setting** — Monday or Sunday (stored in localStorage) |
| Onboarding | **New** — display name (stored in localStorage) |

---

## Implementation Plan

```
Phase 1: Foundation
  ├── #2 Remove auto-generation from context
  ├── #3 Remove slot labels (MealCard, picker, settings)
  ├── #4b Add confirmation dialogs for regenerate actions
  └── #5c Add confirmation dialogs for week regenerate

Phase 2: Day Tab Enhancement
  ├── Rename "Today" tab → "Day" tab
  ├── Add date input (today & future only)
  ├── Load/save plans by selected date
  └── Show existing plan with "Regenerate" option

Phase 3: Week Tab Enhancement
  ├── Add week picker (date input maps to week)
  ├── Load/save plans by selected week
  ├── Configurable week start day (Mon/Sun)
  └── "This Week" quick-jump button

Phase 4: History Tab
  ├── New 3rd tab listing all past finalized dates
  ├── Click to view/regenerate past plans
  └── Visual distinction between past/future

Phase 5: Onboarding
  ├── Welcome screen on first launch (no auth)
  ├── Display name input → stored in localStorage
  └── Can't bypass — required before using app
```
