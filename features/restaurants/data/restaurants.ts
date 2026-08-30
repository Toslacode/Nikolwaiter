import { loamaCategories, loamaDishes } from "@/features/menu/data/loama-menu";
import type { Restaurant, RestaurantSummary } from "@/types";

export const loama: Restaurant = {
  id: "loama",
  name: "לואמה",
  subtitle: "מטבח ישראלי עכשווי",
  cuisine: "Mediterranean / Italian",
  logo: "/restaurants/loama/logo.svg",
  heroImage: "/restaurants/loama/hero.jpg",
  colors: {
    // Placeholder values. Replaced by tokens read off the approved references.
    background: "#FAF7F2",
    surface: "#FFFFFF",
    accent: "#C9A24B",
    text: "#2B2724",
  },
  branches: [
    {
      id: "loama-tlv",
      name: "תל אביב",
      address: "רח׳ החשמונאים 74, תל אביב",
      distanceKm: 0.1,
      tables: 24,
    },
  ],
  categories: loamaCategories,
  dishes: loamaDishes,
  featuredDishIds: ["lemon-pasta"],
  popularDishIds: ["hamburger", "lemon-pasta", "sea-bass", "carpaccio"],
  recommendationRules: [
    {
      id: "light-fish",
      boostDishIds: ["sea-bass"],
      when: { mood: ["light"], preference: ["fish"] },
      reason: "ביקשתם משהו קל ודג, וזאת המנה שהכי עונה על שניהם.",
    },
    {
      id: "light-any",
      boostDishIds: ["garden-salad", "eggplant", "sorbet"],
      when: { mood: ["light"] },
      reason: "קלילה ומרעננת, בלי להשאיר תחושת כבדות.",
    },
    {
      id: "light-veg",
      boostDishIds: ["cauliflower", "eggplant", "garden-salad"],
      when: { mood: ["light"], preference: ["vegetarian", "vegan"] },
      reason: "קלילה, צמחונית, ולא משאירה תחושת כבדות.",
    },
    {
      id: "full-meat",
      boostDishIds: ["entrecote", "hamburger", "ragu-pappardelle"],
      when: { mood: ["full-meal"], preference: ["meat"] },
      reason: "ארוחה מלאה ומשביעה, בדיוק מה שחיפשתם.",
    },
    {
      id: "sharing",
      boostDishIds: ["carpaccio", "focaccia", "eggplant", "spiced-fries"],
      when: { mood: ["sharing"] },
      reason: "מנות שנוח לחלוק בשולחן ומשלימות אחת את השנייה.",
    },
    {
      id: "small-appetite",
      boostDishIds: ["garden-salad", "eggplant", "lemon-pasta"],
      when: { appetite: ["small"] },
      reason: "מנה בגודל שלא יכביד עליכם.",
    },
  ],
  toneOfVoice: {
    greeting: "היי 👋 אני המלצרית האישית שלכם לערב",
    signOff: "אני כאן אם תצטרכו עוד משהו",
    traits: ["חם", "אישי", "רגוע"],
  },
};

export const restaurants: Restaurant[] = [loama];

/** Discovery list on the Nikol home screen. Only Loama has a full menu so far. */
export const nearbyRestaurants: RestaurantSummary[] = [
  {
    id: "loama",
    name: "לואמה",
    cuisine: "Mediterranean / Italian",
    address: "רח׳ החשמונאים 74, תל אביב",
    distanceKm: 0.1,
    image: "/restaurants/loama/card.jpg",
  },
  {
    id: "taizu",
    name: "טאיזו",
    cuisine: "Asian",
    address: "רח׳ מנחם בגין 23, תל אביב",
    distanceKm: 0.6,
    image: "/restaurants/taizu/card.jpg",
  },
  {
    id: "cafe-noor",
    name: "קפה נור",
    cuisine: "Café / Brunch",
    address: "רח׳ לילינבלום 12, תל אביב",
    distanceKm: 0.8,
    image: "/restaurants/cafe-noor/card.jpg",
  },
  {
    id: "ola",
    name: "אולה",
    cuisine: "Mediterranean",
    address: "רח׳ אבן גבירול 45, תל אביב",
    distanceKm: 1.2,
    image: "/restaurants/ola/card.jpg",
  },
];

/** The restaurant Nikol believes the diner is sitting in right now. */
export const detectedRestaurantId = "loama";

export function getRestaurant(id: string): Restaurant | undefined {
  return restaurants.find((r) => r.id === id);
}

export function getDish(restaurantId: string, dishId: string) {
  return getRestaurant(restaurantId)?.dishes.find((d) => d.id === dishId);
}
