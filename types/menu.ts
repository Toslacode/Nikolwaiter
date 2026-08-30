export type CategoryId =
  | "starters"
  | "mains"
  | "pasta"
  | "fish"
  | "meat"
  | "vegetarian"
  | "desserts"
  | "drinks";

export interface MenuCategory {
  id: CategoryId;
  name: string;
}

export type DietaryTag = "vegetarian" | "vegan" | "gluten-free" | "lactose-free" | "spicy";

export type Allergen = "gluten" | "lactose" | "nuts" | "sesame" | "eggs" | "fish" | "soy";

/** 0 = not spicy, 3 = very spicy. */
export type SpiceLevel = 0 | 1 | 2 | 3;

/** A single choice inside an option group, e.g. "Medium Well". */
export interface ModifierOption {
  id: string;
  label: string;
  /** Added to the dish price, in shekels. 0 for free choices. */
  extraPrice: number;
}

export interface ModifierGroup {
  id: string;
  label: string;
  /** "single" renders as radio (doneness), "multi" as checkboxes (extras). */
  type: "single" | "multi";
  required: boolean;
  options: ModifierOption[];
}

export interface Dish {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  /** Price in shekels. */
  price: number;
  image: string;
  ingredients: string[];
  allergens: Allergen[];
  dietaryTags: DietaryTag[];
  spiceLevel: SpiceLevel;
  /** Free text, e.g. "מספיק לאדם אחד". */
  portion: string;
  modifierGroups: ModifierGroup[];
  /** Minutes the kitchen needs. Feeds the mock waiting-time estimate. */
  prepMinutes: number;
  /** Dish ids that pair well — drives the upsell rules. */
  pairsWithIds: string[];
  /** Traits the mock engine matches free text against, e.g. "קל", "קרמי". */
  traits: string[];
  available: boolean;
}
