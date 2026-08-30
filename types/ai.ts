import type { Dish } from "./menu";
import type { DiningProfile } from "./order";

export interface ChatMessage {
  id: string;
  role: "nikol" | "diner";
  text: string;
  /** Dishes Nikol attached to the reply, rendered as cards under the bubble. */
  dishIds?: string[];
  createdAt: number;
}

export interface Recommendation {
  dish: Dish;
  /** Why Nikol picked this dish, phrased for this diner. */
  reason: string;
}

/** One side of a two-dish comparison, e.g. פסטה vs ריזוטו. */
export interface DishComparisonSide {
  dishId: string;
  points: string[];
}

export interface DishComparison {
  sides: [DishComparisonSide, DishComparisonSide];
  /** Nikol's closing verdict, informed by the diner's profile. */
  verdict: string;
}

export interface UpsellSuggestion {
  id: string;
  message: string;
  suggestedDishIds: string[];
}

/**
 * The seam between the UI and whatever answers questions.
 * Today a keyword-matching mock; later a real AI API behind the same calls.
 */
export interface NikolAIService {
  recommend(profile: DiningProfile, restaurantId: string): Promise<Recommendation[]>;
  /** Interprets free text like "בא לי משהו קל, אולי דג, אבל בלי שמנת". */
  recommendFromText(text: string, restaurantId: string): Promise<Recommendation[]>;
  ask(question: string, restaurantId: string, dishId?: string): Promise<ChatMessage>;
  compare(dishIdA: string, dishIdB: string, restaurantId: string): Promise<DishComparison>;
  upsell(dishIds: string[], restaurantId: string): Promise<UpsellSuggestion | null>;
}
