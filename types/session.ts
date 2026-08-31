import type { ChatMessage } from "./ai";
import type {
  Diner,
  DiningProfile,
  OrderItem,
  OrderStatus,
  ServiceRequestType,
  SplitMode,
} from "./order";

/**
 * Where the table is in the meal. Nikol uses this to decide what to say
 * proactively, so it advances as the order does rather than on a timer.
 */
export type MealStage =
  | "browsing"
  | "ordering"
  | "waiting"
  | "eating"
  | "dessert"
  | "bill"
  | "done";

export interface ServiceRequest {
  id: string;
  type: ServiceRequestType;
  label: string;
  status: "pending" | "acknowledged" | "done";
  createdAt: number;
}

export interface BillState {
  mode: SplitMode;
  /** Diner ids that have settled their share, for the per-person split. */
  paidDinerIds: string[];
  paid: boolean;
}

/**
 * Everything one table knows about itself. This is the single source of
 * truth the whole customer experience reads from — screens hold no order,
 * preference or chat state of their own.
 */
export interface NikolSession {
  restaurantId: string;
  branchId: string;
  tableNumber: number;
  diners: Diner[];
  /** Whose device this is. Items they add default to them. */
  activeDinerId: string;
  profile: DiningProfile;
  /** Raw answers from the "תמליצי לי" flow, keyed by question id. */
  recommendationAnswers: Record<string, string[]>;
  items: OrderItem[];
  status: OrderStatus;
  /** Set when the order is sent, so the wait estimate counts down for real. */
  submittedAt?: number;
  estimatedMinutes?: number;
  serviceRequests: ServiceRequest[];
  chat: ChatMessage[];
  stage: MealStage;
  bill: BillState;
  /** Nikol's proactive nudges that have already fired, so they don't repeat. */
  seenNudgeIds: string[];
}
