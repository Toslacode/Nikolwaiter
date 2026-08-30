import type { Dish, MenuCategory } from "./menu";

/** Warm/gold palette per restaurant. Values are filled from each brand's config. */
export interface RestaurantColors {
  background: string;
  surface: string;
  accent: string;
  text: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  /** Distance from the diner, in km. Mocked for now; later from geolocation. */
  distanceKm: number;
  tables: number;
}

/**
 * How Nikol speaks on behalf of this restaurant. The mock AI service reads
 * these so replies feel branded rather than generic.
 */
export interface ToneOfVoice {
  greeting: string;
  signOff: string;
  /** Short adjectives describing the register, e.g. "חם", "אישי". */
  traits: string[];
}

/**
 * Declarative nudges the mock recommendation engine applies on top of the
 * diner's answers. A real AI backend can consume the same shape.
 */
export interface RecommendationRule {
  id: string;
  /** Dish ids to favour when every listed condition matches. */
  boostDishIds: string[];
  when: {
    appetite?: Appetite[];
    mood?: Mood[];
    preference?: DietaryPreference[];
  };
  /** Shown to the diner as Nikol's reason for the pick. */
  reason: string;
}

export type Mood = "light" | "full-meal" | "sharing" | "surprise";
export type DietaryPreference = "meat" | "fish" | "vegetarian" | "vegan" | "none";
export type Appetite = "small" | "medium" | "large";

export interface Restaurant {
  id: string;
  name: string;
  /** Short descriptor under the name, e.g. "מטבח ישראלי עכשווי". */
  subtitle: string;
  /** Cuisine label used on discovery cards, e.g. "Mediterranean / Italian". */
  cuisine: string;
  logo: string;
  heroImage: string;
  colors: RestaurantColors;
  branches: Branch[];
  categories: MenuCategory[];
  dishes: Dish[];
  featuredDishIds: string[];
  popularDishIds: string[];
  recommendationRules: RecommendationRule[];
  toneOfVoice: ToneOfVoice;
}

/** Trimmed shape used by the discovery list, where the full menu isn't needed. */
export interface RestaurantSummary {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  distanceKm: number;
  image: string;
}
