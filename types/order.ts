import type { Allergen, DietaryTag } from "./menu";
import type { Appetite, DietaryPreference, Mood } from "./restaurant";

/** A diner at the table. "shared" items belong to no single diner. */
export interface Diner {
  id: string;
  name: string;
}

export const SHARED_DINER_ID = "shared";

export interface OrderItem {
  id: string;
  dishId: string;
  /** Diner id, or SHARED_DINER_ID for לחלוקה. */
  dinerId: string;
  quantity: number;
  /** Selected option ids, keyed by modifier group id. */
  selectedModifiers: Record<string, string[]>;
  noteToKitchen?: string;
  /** Dish price plus modifiers, times quantity. */
  lineTotal: number;
}

export type OrderStatus =
  | "draft"
  | "received"
  | "preparing"
  | "almost-ready"
  | "on-the-way"
  | "served"
  | "paid";

export interface TableSession {
  restaurantId: string;
  branchId: string;
  tableNumber: number;
  diners: Diner[];
  items: OrderItem[];
  status: OrderStatus;
  /** Minutes until serving, from the mock kitchen estimate. */
  estimatedMinutes?: number;
  /** Preferences and allergies gathered during the session. */
  profile?: DiningProfile;
}

export interface DiningProfile {
  mood?: Mood;
  preference?: DietaryPreference;
  restrictions: DietaryTag[];
  allergies: Allergen[];
  /** Free text when the diner picks "יש לי אלרגיה" and describes it. */
  allergyNote?: string;
  appetite?: Appetite;
  budgetPerPerson?: number;
}

export type SplitMode = "together" | "equal" | "per-person" | "manual";

export type PaymentMethod = "apple-pay" | "google-pay" | "card" | "waiter";

export type ServiceRequestType =
  | "water"
  | "napkins"
  | "bread"
  | "waiter"
  | "drinks"
  | "issue";
