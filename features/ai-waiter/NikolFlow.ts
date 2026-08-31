import type {
  Appetite,
  DietaryPreference,
  DietaryTag,
  DiningProfile,
  Mood,
} from "@/types";

/**
 * What the diner can ask Nikol for from a standing start. These are the same
 * destinations the old dashboard had as four large buttons — here they are
 * things you say, so the conversation stays the way you get anywhere.
 */
export interface Intent {
  id: "menu" | "recommend" | "popular" | "preferences" | "waiter";
  /** What the diner's message reads as when they tap it. */
  label: string;
  icon: string;
  /** Utility intents render smaller and after a divider. */
  utility?: boolean;
}

export const INTENTS: Intent[] = [
  { id: "menu", label: "תראי לי את התפריט", icon: "📖" },
  { id: "recommend", label: "תמליצי לי מה להזמין", icon: "✨" },
  { id: "popular", label: "מה הכי פופולרי?", icon: "🔥" },
  { id: "preferences", label: "יש לי העדפות / אלרגיות", icon: "🌱" },
  { id: "waiter", label: "לקרוא למלצר", icon: "🔔", utility: true },
];

/** Answers Nikol offers when she asks what she should know about. */
export const PREFERENCE_CHOICES = [
  { id: "vegetarian", label: "צמחוני", icon: "🌿" },
  { id: "vegan", label: "טבעוני", icon: "🌱" },
  { id: "gluten-free", label: "ללא גלוטן", icon: "🌾" },
  { id: "lactose-free", label: "ללא לקטוז", icon: "🥛" },
  { id: "allergy", label: "יש לי אלרגיה", icon: "⚠️" },
  { id: "none", label: "אין לי מגבלות", icon: "✨" },
] as const;

const MOODS = new Set(["light", "full-meal", "sharing", "surprise"]);
const PREFERENCES = new Set(["meat", "fish", "vegetarian", "vegan", "none"]);
const APPETITES = new Set(["small", "medium", "large"]);
const TAGS = new Set(["vegetarian", "vegan", "gluten-free", "lactose-free", "spicy"]);

/**
 * Turns the answers collected in the session into the profile the AI service
 * takes. Anything the diner typed rather than tapped simply won't match a
 * known id, and is skipped — the free text still reached Nikol directly.
 */
export function profileFromAnswers(
  answers: Record<string, string[]>,
  base: DiningProfile,
): DiningProfile {
  const first = (key: string) => answers[key]?.[0];

  const mood = first("mood");
  const preference = first("preference");
  const appetite = first("appetite");

  const restrictions = [
    ...new Set([
      ...base.restrictions,
      ...(answers.restrictions ?? []).filter((r) => TAGS.has(r)),
    ]),
  ] as DietaryTag[];

  return {
    ...base,
    mood: mood && MOODS.has(mood) ? (mood as Mood) : base.mood,
    preference:
      preference && PREFERENCES.has(preference)
        ? (preference as DietaryPreference)
        : base.preference,
    appetite: appetite && APPETITES.has(appetite) ? (appetite as Appetite) : base.appetite,
    restrictions,
  };
}
