import type { Appetite, DietaryPreference, DietaryTag, Mood } from "@/types";

export interface QuestionChoice<T = string> {
  id: T;
  label: string;
  /** Small glyph on the reply chip, as in the approved concept. */
  icon?: string;
}

export interface Question {
  id: "mood" | "preference" | "restrictions" | "appetite";
  /** The short form, used for the progress header. */
  title: string;
  /**
   * What Nikol actually says to ask this. Kept to one or two short lines —
   * she is a waitress at the table, not a form label.
   */
  ask: string;
  /**
   * Her reaction to what was just chosen, keyed by choice id. Acknowledging
   * the answer before moving on is the whole difference between a
   * conversation and a questionnaire.
   */
  react: Record<string, string>;
  /** Used when the diner types instead of tapping a chip. */
  reactFreeText: string;
  /** "multi" lets the diner pick several, e.g. dietary restrictions. */
  type: "single" | "multi";
  choices: QuestionChoice[];
}

/** The four questions from the "תמליצי לי" flow, in order. */
export const recommendationQuestions: Question[] = [
  {
    id: "mood",
    title: "מה בא לכם היום?",
    ask: "היי, אני ניקול 👋\nאעזור לכם לבחור. מה בא לכם היום?",
    react: {
      light: "מעולה, משהו קל.",
      "full-meal": "יופי, הולכים על ארוחה מלאה.",
      sharing: "אהבתי, מנות לחלוקה זה תמיד כיף.",
      surprise: "בכיף, אני אוהבת את זה 😊",
    },
    reactFreeText: "הבנתי, רשמתי לי.",
    type: "single",
    choices: [
      { id: "light", label: "משהו קל", icon: "🌱" },
      { id: "full-meal", label: "ארוחה מלאה", icon: "🍽️" },
      { id: "sharing", label: "מנות לחלוקה", icon: "🤝" },
      { id: "surprise", label: "תפתיעי אותי", icon: "✨" },
    ] satisfies QuestionChoice<Mood>[],
  },
  {
    id: "preference",
    title: "יש העדפות?",
    ask: "מה אתם יותר אוהבים?",
    react: {
      meat: "בשר, מצוין.",
      fish: "דגים, בחירה יפה.",
      vegetarian: "צמחוני, יש לנו כמה מנות שאני ממש אוהבת.",
      vegan: "טבעוני, אין בעיה.",
      none: "מצוין, אז יש לי יותר מקום לשחק.",
    },
    reactFreeText: "סבבה, לקחתי בחשבון.",
    type: "single",
    choices: [
      { id: "meat", label: "בשר", icon: "🥩" },
      { id: "fish", label: "דגים", icon: "🐟" },
      { id: "vegetarian", label: "צמחוני", icon: "🌿" },
      { id: "vegan", label: "טבעוני", icon: "🌱" },
      { id: "none", label: "אין לי העדפה", icon: "✨" },
    ] satisfies QuestionChoice<DietaryPreference>[],
  },
  {
    id: "restrictions",
    title: "יש משהו שחשוב לדעת?",
    ask: "יש משהו שחשוב שאדע? אפשר לבחור כמה.",
    react: {
      "gluten-free": "ללא גלוטן, רשמתי.",
      "lactose-free": "ללא לקטוז, רשמתי.",
      vegetarian: "צמחוני, רשמתי.",
      vegan: "טבעוני, רשמתי.",
      allergy: "תודה שאמרתם. אעדכן גם את הצוות.",
      none: "מצוין, בלי מגבלות.",
    },
    reactFreeText: "תודה, שמתי לב לזה.",
    type: "multi",
    choices: [
      { id: "gluten-free", label: "ללא גלוטן", icon: "🌾" },
      { id: "lactose-free", label: "ללא לקטוז", icon: "🥛" },
      { id: "vegetarian", label: "צמחוני", icon: "🌿" },
      { id: "vegan", label: "טבעוני", icon: "🌱" },
      // Selecting this reveals a free-text field for the diner to describe it.
      { id: "allergy", label: "יש לי אלרגיה", icon: "⚠️" },
      { id: "none", label: "אין מגבלות", icon: "✨" },
    ] satisfies QuestionChoice<DietaryTag | "allergy" | "none">[],
  },
  {
    id: "appetite",
    title: "כמה אתם רעבים?",
    ask: "אחרון — כמה אתם רעבים?",
    react: {
      small: "קצת, הבנתי.",
      medium: "בינוני, מושלם.",
      large: "מאוד, נדאג לזה 😊",
    },
    reactFreeText: "הבנתי.",
    type: "single",
    choices: [
      { id: "small", label: "קצת", icon: "🍃" },
      { id: "medium", label: "בינוני", icon: "🍽️" },
      { id: "large", label: "מאוד", icon: "🔥" },
    ] satisfies QuestionChoice<Appetite>[],
  },
];

export const totalQuestions = recommendationQuestions.length;

/** e.g. "שאלה 1 מתוך 4" */
export function questionProgressLabel(index: number): string {
  return `שאלה ${index + 1} מתוך ${totalQuestions}`;
}
