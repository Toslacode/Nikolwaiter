import type { Appetite, DietaryPreference, DietaryTag, Mood } from "@/types";

export interface QuestionChoice<T = string> {
  id: T;
  label: string;
}

export interface Question {
  id: "mood" | "preference" | "restrictions" | "appetite";
  title: string;
  /** "multi" lets the diner pick several, e.g. dietary restrictions. */
  type: "single" | "multi";
  choices: QuestionChoice[];
}

/** The four questions from the "תמליצי לי" flow, in order. */
export const recommendationQuestions: Question[] = [
  {
    id: "mood",
    title: "מה בא לכם היום?",
    type: "single",
    choices: [
      { id: "light", label: "משהו קל" },
      { id: "full-meal", label: "ארוחה מלאה" },
      { id: "sharing", label: "מנות לחלוקה" },
      { id: "surprise", label: "תפתיעי אותי" },
    ] satisfies QuestionChoice<Mood>[],
  },
  {
    id: "preference",
    title: "יש העדפות?",
    type: "single",
    choices: [
      { id: "meat", label: "בשרי" },
      { id: "fish", label: "דגים" },
      { id: "vegetarian", label: "צמחוני" },
      { id: "vegan", label: "טבעוני" },
      { id: "none", label: "אין העדפה" },
    ] satisfies QuestionChoice<DietaryPreference>[],
  },
  {
    id: "restrictions",
    title: "יש משהו שחשוב לדעת?",
    type: "multi",
    choices: [
      { id: "gluten-free", label: "ללא גלוטן" },
      { id: "lactose-free", label: "ללא לקטוז" },
      { id: "vegetarian", label: "צמחוני" },
      { id: "vegan", label: "טבעוני" },
      // Selecting this reveals a free-text field for the diner to describe it.
      { id: "allergy", label: "יש לי אלרגיה" },
      { id: "none", label: "אין מגבלות" },
    ] satisfies QuestionChoice<DietaryTag | "allergy" | "none">[],
  },
  {
    id: "appetite",
    title: "כמה אתם רעבים?",
    type: "single",
    choices: [
      { id: "small", label: "קצת" },
      { id: "medium", label: "בינוני" },
      { id: "large", label: "מאוד" },
    ] satisfies QuestionChoice<Appetite>[],
  },
];

export const totalQuestions = recommendationQuestions.length;

/** e.g. "שאלה 1 מתוך 4" */
export function questionProgressLabel(index: number): string {
  return `שאלה ${index + 1} מתוך ${totalQuestions}`;
}
