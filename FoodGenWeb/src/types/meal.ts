// ── Common Types ──

export type Timestamp = string | number;  // ISO string or Unix timestamp from Firestore

// ── Meal Types ──

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Meal {
  id: number;
  name: string;
  suggestedFor: string[];       // ["breakfast", "lunch", "dinner"]
  cuisine: string;
  dietaryTags: string[];         // ["gluten-free"]
  prepTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  photoPath: string | null;
  youtubeLink: string | null;
  ingredients: Ingredient[];    // Parsed array
  steps: string[];              // Parsed array
  calories: number | null;
  isFavorite: number; // 0 or 1
  isCustom: number;   // 0 or 1
}

export interface ReferenceMeal extends Meal {
  isReference: true;
}

export interface CustomMeal extends Meal {
  isCustom: 1;
}

// ── Meal Entry (inside Day Plan) ──

export type MealStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';

export interface MealEntry {
  mealId: number | null;         // Meal ID (null = unassigned)
  label?: string;                // Optional: "breakfast", "lunch", "dinner", "snack", or ""
  status: MealStatus;            // Cooking progress
}

// ── Day Plan Types ──

export interface HouseholdDayPlan {
  date: string;                  // "2026-06-19"
  weekOfYear: number;
  year: number;
  meals: MealEntry[];            // Flexible array (replaces breakfastId/lunchId/etc.)
  createdBy: string;
  lastModifiedBy: string;
  isGenerated: 0 | 1;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HouseholdDayPlanWithMeals extends HouseholdDayPlan {
  meals: (MealEntry & { meal?: Meal })[];  // Enriched with full meal data
}

// ── Household Types ──

export interface HouseholdAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  formattedAddress?: string;
}

export interface Household {
  id: string;
  name: string;
  address: HouseholdAddress;
  inviteCode: string;
  codeExpiresAt: Timestamp;
  maxMembers: number;
  weekStartDay: 'monday' | 'sunday';
  description?: string;
  timezone?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type HouseholdRole = 'admin' | 'editor' | 'viewer';

export interface HouseholdMember {
  uid: string;
  displayName: string;
  email: string;
  role: HouseholdRole;
  joinedAt: Timestamp;
}

export interface JoinRequest {
  uid: string;
  displayName: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedRole?: 'editor' | 'viewer';
  requestedAt: Timestamp;
  respondedAt?: Timestamp;
  respondedBy?: string;
}

export interface HouseholdInvite {
  inviteId: string;
  householdId: string;
  invitedEmail: string;
  invitedUid?: string;
  invitedDisplayName?: string;
  invitedBy: string;
  invitedByName: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}

// ── User Types ──

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  householdId?: string;
  householdRole?: HouseholdRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPreferences {
  displayName: string;
  onboardingComplete: boolean;
  seedDataLoaded: boolean;
  updatedAt: Timestamp;
}

// ── Invite Code History ──

export interface InviteCodeRecord {
  code: string;
  generatedBy: string;
  generatedAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
  usedCount: number;
}

// ── Activity Log ──

export type ActivityAction = 'created' | 'regenerated' | 'manual_edit' | 'status_updated' | 'suggestion_applied' | 'suggestion_rejected';

export interface ActivityLogEntry {
  date: string;
  action: ActivityAction;
  performedBy: string;
  displayName: string;
  details?: string;
  createdAt: Timestamp;
}

// ── Meal Suggestion (Future) ──

export interface MealSuggestion {
  suggestedBy: string;
  displayName: string;
  date: string;
  mealIndex: number;
  currentMealId: number;
  suggestedMealId: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedBy?: string;
  respondedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
