# FoodGen Web — UI Design Guide

## Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#FF6B35` | Main buttons, active states, brand |
| Secondary | `#2EC4B6` | Save buttons, secondary actions |
| Background | `#FAFAFA` | Page background |
| Card | `#FFFFFF` | Cards, modals, headers |
| Text | `#1C1C1E` | Primary text |
| Text Secondary | `#666666` | Subtitles, meta info |
| Border | `#E0E0E0` | Dividers, borders |
| Custom Badge | `#9C27B0` | User-created meals |
| Danger | `#F44336` | Delete, errors |
| Success | `#4CAF50` | Completed, easy |
| Warning | `#FF9800` | Medium difficulty |

### Typography
- **Font**: System font stack (`-apple-system`, `Segoe UI`, `Roboto`)
- **Title**: 18px, bold (700)
- **Section Title**: 15px, bold (700)
- **Body**: 15px, regular
- **Secondary**: 13px, regular
- **Small**: 11px, bold (600) — tab labels

### Spacing
- Page padding: `16px`
- Card padding: `14px 16px`
- Gap between cards: `10px`
- Border radius: `8px` (inputs), `10px` (cards), `12px` (buttons), `20px` (onboarding card)

### Components

#### Buttons
| Class | Background | Text | Usage |
|-------|-----------|------|-------|
| `.primary-btn` | `#FF6B35` | White | Main actions |
| `.secondary-btn` | `#2EC4B6` | White | Secondary actions |
| `.danger-btn` | `#F44336` | White | Destructive |
| `.small-btn` | `#FFFFFF` | `#666` | Inline actions |

#### Cards
- Background: `#FFFFFF`
- Border: `1px solid #E0E0E0`
- Border radius: `10px`
- Shadow: `0 1px 3px rgba(0,0,0,0.06)`

#### Inputs
- Border: `1px solid #E0E0E0`
- Border radius: `8px`
- Padding: `10px 12px`
- Focus: `border-color: #FF6B35`

---

## Pages That Need Design Updates

### Plain Pages (No Design Yet)
| Page | Issue |
|------|-------|
| **OnboardingPage** | Uses wrong CSS class names (`.onboarding-page` vs `.onboarding-container`) |
| **HouseholdDashboard** | No card styling, plain text |
| **SettingsPage** | Missing `.settings-section` styling |
| **HouseholdManagementPage** | Missing card styling |

### Pages With Good Design ✅
| Page | Status |
|------|--------|
| **DayPage** | ✅ Uses `.meal-card`, `.date-picker-row`, `.primary-btn` |
| **WeekPage** | ✅ Uses `.day-row`, `.week-picker-row` |
| **MealCard** | ✅ Uses `.meal-card`, status badges |
| **EmptyState** | ✅ Uses `.empty-state` |

---

## Loading Indicators

### Current State
- `isLoading` state exists in context
- `.loading-state` CSS class exists but is basic text only

### Recommended Approach
**Use CSS spinner** (no GIF needed — lighter, sharper, themeable):

```css
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E0E0E0;
  border-top-color: #FF6B35;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
```

### Where to Add Loading
| Action | Location |
|--------|----------|
| Login/Signup | OnboardingPage (button shows "Please wait...") |
| Generate meals | DayPage/WeekPage (show spinner on button) |
| Save plan | DayPage/WeekPage (brief spinner) |
| Add/remove meal | DayPage/WeekPage (instant, no spinner needed) |
| Create household | HouseholdDashboard (button state) |
| Join household | HouseholdDashboard (button state) |

---

## Implementation Plan

### Phase 1: Fix CSS Classes (OnboardingPage)
**Current issue**: Component uses `.onboarding-page` but CSS has `.onboarding-container`

**Fix**: Update component to use existing CSS classes OR update CSS to match component.

### Phase 2: Style HouseholdDashboard
- Wrap sections in `.settings-section` cards
- Use `.primary-btn` for main actions
- Use `.secondary-btn` for secondary actions
- Add proper spacing and typography

### Phase 3: Style SettingsPage
- Already uses `.settings-section` — verify it works
- Add `.account-info` styling

### Phase 4: Style HouseholdManagementPage
- Wrap in `.settings-section` cards
- Use existing button classes
- Add proper spacing

### Phase 5: Add Loading Spinner Component
- Create `src/components/LoadingSpinner.tsx`
- Use in all async actions

---

## Code Patterns to Follow

### From DayPage (Good Example)
```tsx
<div className="page-container">
  <div className="header">
    <button className="icon-btn">🏠</button>
    <div className="header-title">
      <span className="app-title">📅 FoodGen</span>
    </div>
    <button className="icon-btn">⚙️</button>
  </div>
  <div className="content-area">
    {/* Content */}
  </div>
</div>
```

### From MealCard (Good Example)
```tsx
<div className="meal-card">
  <div className="meal-card-content">
    <span className="meal-emoji">🍗</span>
    <div className="meal-info">
      <span className="meal-name">Meal Name</span>
      <div className="meal-meta">
        <span className="prep-time">⏱ 40 min</span>
        <span className="difficulty-badge easy">Easy</span>
      </div>
    </div>
  </div>
</div>
```

---

## Next Steps

1. **Update OnboardingPage** to use correct CSS classes
2. **Style HouseholdDashboard** with cards and proper buttons
3. **Style SettingsPage** (minor tweaks)
4. **Style HouseholdManagementPage** with cards
5. **Create LoadingSpinner component**
6. **Add loading states** to all async actions
7. **Redeploy** and test on iPhone

---

*Document created June 2026 — FoodGen Web UI Design Guide*