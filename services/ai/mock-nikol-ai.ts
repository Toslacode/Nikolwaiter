import { getDish, getRestaurant } from "@/features/restaurants/data/restaurants";
import type {
  Allergen,
  ChatMessage,
  DietaryTag,
  DiningProfile,
  Dish,
  DishComparison,
  NikolAIService,
  Recommendation,
  UpsellSuggestion,
} from "@/types";

/**
 * Keyword-matching stand-in for a real AI backend. Every method here is
 * deterministic and offline; swapping in a real API means replacing this
 * object, not touching the UI.
 */

const RECOMMENDATION_COUNT = 3;

/** Categories that are never offered as one of the three main picks. */
const NON_MAIN_CATEGORIES = new Set(["drinks", "desserts"]);

const RESTRICTION_BLOCKS: Record<DietaryTag, Allergen[]> = {
  "gluten-free": ["gluten"],
  "lactose-free": ["lactose"],
  vegetarian: [],
  vegan: [],
  spicy: [],
};

function passesRestrictions(dish: Dish, profile: DiningProfile): boolean {
  for (const restriction of profile.restrictions) {
    if (restriction === "vegetarian" && !dish.dietaryTags.includes("vegetarian")) return false;
    if (restriction === "vegan" && !dish.dietaryTags.includes("vegan")) return false;
    const blocked = RESTRICTION_BLOCKS[restriction] ?? [];
    if (blocked.some((a) => dish.allergens.includes(a))) return false;
  }
  return !profile.allergies.some((a) => dish.allergens.includes(a));
}

function scoreDish(dish: Dish, profile: DiningProfile, restaurantId: string) {
  const restaurant = getRestaurant(restaurantId);
  let score = 0;
  let reason = "";

  for (const rule of restaurant?.recommendationRules ?? []) {
    const moodOk = !rule.when.mood || (profile.mood && rule.when.mood.includes(profile.mood));
    const prefOk =
      !rule.when.preference ||
      (profile.preference && rule.when.preference.includes(profile.preference));
    const appetiteOk =
      !rule.when.appetite || (profile.appetite && rule.when.appetite.includes(profile.appetite));

    if (moodOk && prefOk && appetiteOk && rule.boostDishIds.includes(dish.id)) {
      score += 4;
      reason ||= rule.reason;
    }
  }

  if (profile.mood === "light" && dish.traits.includes("קל")) score += 2;
  if (profile.mood === "full-meal" && dish.traits.includes("מנה מלאה")) score += 2;
  if (profile.mood === "sharing" && dish.traits.includes("לחלוקה")) score += 2;
  if (profile.preference === "meat" && dish.traits.includes("בשרי")) score += 2;
  if (profile.preference === "fish" && dish.traits.includes("דג")) score += 2;

  if (profile.appetite === "small" && dish.traits.includes("קל")) score += 1;
  if (profile.appetite === "large" && dish.traits.includes("מנה מלאה")) score += 1;

  if (profile.budgetPerPerson && dish.price > profile.budgetPerPerson) score -= 3;

  return { score, reason };
}

function pickTop(
  dishes: Dish[],
  profile: DiningProfile,
  restaurantId: string,
): Recommendation[] {
  return dishes
    .filter((d) => d.available && !NON_MAIN_CATEGORIES.has(d.categoryId))
    .filter((d) => passesRestrictions(d, profile))
    .map((dish) => ({ dish, ...scoreDish(dish, profile, restaurantId) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RECOMMENDATION_COUNT)
    .map(({ dish, reason }) => ({
      dish,
      reason: reason || "לפי מה שסיפרתם, זאת אחת המנות שהכי מתאימות לכם.",
    }));
}

/** Turns free text such as "בא לי משהו קל, אולי דג, אבל בלי שמנת" into a profile. */
export function parseFreeText(text: string): DiningProfile {
  const profile: DiningProfile = { restrictions: [], allergies: [] };
  const says = (...terms: string[]) => terms.some((t) => text.includes(t));
  const without = (term: string) => text.includes(`בלי ${term}`) || text.includes(`ללא ${term}`);

  if (says("קל", "קליל")) profile.mood = "light";
  if (says("מלאה", "רעב", "משביע")) profile.mood = "full-meal";
  if (says("לחלוק", "לחלוקה", "לשתף")) profile.mood = "sharing";
  if (says("תפתיע")) profile.mood = "surprise";

  if (says("דג", "סלמון", "לברק")) profile.preference = "fish";
  else if (says("בשר", "המבורגר", "אנטריקוט")) profile.preference = "meat";
  else if (says("טבעוני")) profile.preference = "vegan";
  else if (says("צמחוני")) profile.preference = "vegetarian";

  if (without("גלוטן")) profile.restrictions.push("gluten-free");
  if (without("שמנת") || without("לקטוז") || without("חלב")) {
    profile.restrictions.push("lactose-free");
  }
  if (says("אלרגי")) {
    if (says("אגוז")) profile.allergies.push("nuts");
    if (says("שומשום")) profile.allergies.push("sesame");
  }

  return profile;
}

const NOT_SPICY = "המנה הזאת לא חריפה בכלל.";

function spiceAnswer(dish: Dish): string {
  if (dish.spiceLevel === 0) return NOT_SPICY;
  if (dish.spiceLevel === 1) return "יש בה פיקנטיות עדינה, אבל היא לא באמת חריפה.";
  return "כן, היא חריפה. אפשר לבקש מהמטבח להוריד את החריפות.";
}

function allergenAnswer(dish: Dish, allergen: Allergen, label: string): string {
  const has = dish.allergens.includes(allergen);
  const status = has ? `מכילה ${label}` : `לא אמורה להכיל ${label}`;
  return `לפי המידע שסיפקה המסעדה, ${dish.name} ${status}. אם מדובר באלרגיה, כדאי לוודא גם עם איש צוות.`;
}

function answerAboutDish(question: string, dish: Dish): string {
  const asks = (...terms: string[]) => terms.some((t) => question.includes(t));

  if (asks("חריף")) return spiceAnswer(dish);
  if (asks("גלוטן")) return allergenAnswer(dish, "gluten", "גלוטן");
  if (asks("לקטוז", "חלב", "שמנת")) return allergenAnswer(dish, "lactose", "מוצרי חלב");
  if (asks("אגוז")) return allergenAnswer(dish, "nuts", "אגוזים");
  if (asks("שומשום")) return allergenAnswer(dish, "sesame", "שומשום");
  if (asks("מספיק", "גודל", "כמות")) return `${dish.name} — ${dish.portion}.`;
  if (asks("בלי", "ללא")) {
    return "אפשר לציין את זה בהערה למטבח ואני אעביר להם. רוב ההתאמות אפשריות.";
  }
  if (asks("מה יש", "מכיל", "רכיב")) {
    return `${dish.name} מכילה: ${dish.ingredients.join(", ")}.`;
  }
  if (asks("מחיר", "כמה עולה")) return `${dish.name} עולה ₪${dish.price}.`;

  return `${dish.name} — ${dish.description} אם יש משהו ספציפי שחשוב לכם לדעת, שאלו אותי.`;
}

let messageCounter = 0;
function nikolMessage(text: string, dishIds?: string[]): ChatMessage {
  messageCounter += 1;
  return {
    id: `nikol-${messageCounter}`,
    role: "nikol",
    text,
    dishIds,
    createdAt: Date.now(),
  };
}

export const mockNikolAI: NikolAIService = {
  async recommend(profile, restaurantId) {
    const restaurant = getRestaurant(restaurantId);
    if (!restaurant) return [];
    return pickTop(restaurant.dishes, profile, restaurantId);
  },

  async recommendFromText(text, restaurantId) {
    const restaurant = getRestaurant(restaurantId);
    if (!restaurant) return [];
    return pickTop(restaurant.dishes, parseFreeText(text), restaurantId);
  },

  async ask(question, restaurantId, dishId) {
    const restaurant = getRestaurant(restaurantId);
    if (!restaurant) return nikolMessage("רגע, אני בודקת את זה ומיד חוזרת אליכם.");

    if (dishId) {
      const dish = getDish(restaurantId, dishId);
      if (dish) return nikolMessage(answerAboutDish(question, dish));
    }

    const profile = parseFreeText(question);
    const hasSignal =
      profile.mood || profile.preference || profile.restrictions.length > 0;

    if (hasSignal) {
      const picks = pickTop(restaurant.dishes, profile, restaurantId);
      return nikolMessage(
        "יש לי כמה רעיונות שמתאימים למה שתיארתם:",
        picks.map((p) => p.dish.id),
      );
    }

    if (question.includes("פופולרי") || question.includes("מומלץ")) {
      return nikolMessage(
        "אלה המנות שהכי אוהבים אצלנו:",
        restaurant.popularDishIds.slice(0, 3),
      );
    }

    return nikolMessage(
      "אשמח לעזור. תוכלו לספר לי מה בא לכם — משהו קל, ארוחה מלאה, או מנות לחלוקה?",
    );
  },

  async compare(dishIdA, dishIdB, restaurantId) {
    const a = getDish(restaurantId, dishIdA);
    const b = getDish(restaurantId, dishIdB);
    if (!a || !b) {
      throw new Error(`Cannot compare unknown dishes: ${dishIdA}, ${dishIdB}`);
    }

    const pointsFor = (dish: Dish, other: Dish): string[] => {
      const points = [dish.description];
      if (dish.price > other.price) points.push("מנה נדיבה יותר");
      if (dish.traits.includes("קל") && !other.traits.includes("קל")) {
        points.push("קלה יותר");
      }
      if (dish.traits.includes("קרמי")) points.push("קרמית יותר");
      if (dish.traits.includes("עדין")) points.push("עדינה יותר");
      return points;
    };

    // Prefer the lighter dish when both are plausible.
    const lighter = a.traits.includes("קל") && !b.traits.includes("קל") ? a : b;

    return {
      sides: [
        { dishId: a.id, points: pointsFor(a, b) },
        { dishId: b.id, points: pointsFor(b, a) },
      ],
      verdict: `לפי מה שסיפרתם קודם, הייתי בוחרת ב${lighter.name}.`,
    } satisfies DishComparison;
  },

  async upsell(dishIds, restaurantId) {
    const restaurant = getRestaurant(restaurantId);
    if (!restaurant || dishIds.length === 0) return null;

    const inOrder = new Set(dishIds);
    const ordered = dishIds
      .map((id) => getDish(restaurantId, id))
      .filter((d): d is Dish => Boolean(d));

    // A main with no side yet — offer the pairing the kitchen actually suggests.
    for (const dish of ordered) {
      const pairing = dish.pairsWithIds
        .map((id) => getDish(restaurantId, id))
        .find((d): d is Dish => Boolean(d) && !inOrder.has(d!.id));

      if (pairing && pairing.categoryId === "starters") {
        return {
          id: `pair-${dish.id}-${pairing.id}`,
          message: `${pairing.name} הולך מעולה עם ${dish.name}. להוסיף אחד לחלוקה?`,
          suggestedDishIds: [pairing.id],
        } satisfies UpsellSuggestion;
      }
    }

    // Nothing to drink yet.
    const hasDrink = ordered.some((d) => d.categoryId === "drinks");
    if (!hasDrink) {
      return {
        id: "wine-pairing",
        message: "רוצה שאמצא לכם יין שמתאים למה שבחרתם?",
        suggestedDishIds: ["house-red", "house-white"],
      } satisfies UpsellSuggestion;
    }

    // Mains but nothing to share to open with.
    const hasStarter = ordered.some((d) => d.categoryId === "starters");
    if (!hasStarter) {
      return {
        id: "missing-starter",
        message: "נראה שחסרה לכם מנה ראשונה לחלוקה. רוצה שתי הצעות?",
        suggestedDishIds: ["carpaccio", "eggplant"],
      } satisfies UpsellSuggestion;
    }

    return null;
  },
};
