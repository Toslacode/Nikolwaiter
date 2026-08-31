"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { RestaurantShell } from "@/components/AppShell";
import { WaitressSketch } from "@/components/Brand";
import {
  ChevronLeft,
  ChevronRight,
  Cloche,
  Fish,
  Heart,
  Leaf,
  Meat,
  People,
  Sparkle,
  Sparkles,
} from "@/components/Icons";
import { recommendationQuestions, questionProgressLabel } from "@/features/ai-waiter/data/questions";
import { RestaurantHeader } from "@/features/restaurants/components/RestaurantHeader";
import { useSession } from "@/features/session/SessionProvider";
import type { Restaurant } from "@/types";
import { NikolAssistant, type QuickPrompt } from "./NikolAssistant";

const RECOMMEND_PROMPTS: QuickPrompt[] = [
  { id: "light", label: "בא לי משהו קל", icon: "🌱" },
  { id: "gluten", label: "יש בלי גלוטן?", icon: "🌾" },
  { id: "best", label: "מה הכי מומלץ?", icon: "⭐" },
];

/** Gold glyphs shown beside each answer, matching the approved screens. */
const CHOICE_ICON: Record<string, React.ReactNode> = {
  light: <span className="text-[15px] leading-none">🌱</span>,
  "full-meal": <Cloche className="size-[19px] text-gold" />,
  sharing: <People className="size-[19px] text-gold" />,
  surprise: <Sparkles className="size-[19px] text-gold" />,
  meat: <Meat className="size-[16px]" />,
  fish: <Fish className="size-[16px]" />,
  vegetarian: <Leaf className="size-[16px] text-[#5BA65B]" />,
  vegan: <Leaf className="size-[16px] text-[#5BA65B]" />,
  none: <Sparkle className="size-[14px] text-gold" />,
};

const PREVIEW_ICON: Record<string, string> = {
  meat: "🥩",
  fish: "🐟",
  vegetarian: "🌱",
  vegan: "🌱",
  none: "✨",
};

const fallbackIcon = <Sparkle className="size-[14px] text-gold" />;

export function RecommendScreen({
  restaurant,
  tableNumber,
}: {
  restaurant: Restaurant;
  tableNumber: number;
}) {
  const router = useRouter();
  const { session, dispatch } = useSession();
  const base = `/r/${restaurant.id}/table/${tableNumber}`;

  const [step, setStep] = useState(0);

  const question = recommendationQuestions[step];
  const next = recommendationQuestions[step + 1];
  const isLast = step === recommendationQuestions.length - 1;
  const progress = (step + 1) / recommendationQuestions.length;

  // Answers live in the session, so leaving and coming back keeps them and
  // the results screen reads the same source the questions wrote to.
  const answers = session.recommendationAnswers;
  const selected = useMemo(() => answers[question.id] ?? [], [answers, question.id]);

  // The question card should visibly arrive when the step advances rather than
  // its contents being swapped underneath the reader.
  const previousStep = useRef(step);
  const [entering, setEntering] = useState(false);
  const [direction, setDirection] = useState(1);
  useEffect(() => {
    if (previousStep.current === step) return;
    setDirection(step > previousStep.current ? 1 : -1);
    previousStep.current = step;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEntering(true);
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntering(false)),
    );
    return () => cancelAnimationFrame(frame);
  }, [step]);

  const choose = (choiceId: string) => {
    const current = answers[question.id] ?? [];
    const values =
      question.type === "multi"
        ? current.includes(choiceId)
          ? current.filter((c) => c !== choiceId)
          : [...current, choiceId]
        : [choiceId];

    dispatch({ type: "setRecommendationAnswer", questionId: question.id, values });

    // A single-choice answer is unambiguous, so move on without a second tap.
    if (question.type === "single" && !isLast) {
      setTimeout(() => setStep((s) => s + 1), 180);
    }
  };

  const advance = () => {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(answers)) params.set(key, value.join(","));
    router.push(`${base}/recommend/results?${params.toString()}`);
  };

  return (
    <RestaurantShell
      header={
        <RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} showBack />
      }
      assistant={
        <NikolAssistant
          prompts={RECOMMEND_PROMPTS}
          helper={null}
          placeholder="אפשר לכתוב כאן מה מתחשק לכם..."
        />
      }
    >
      <div className="px-5 lg:px-0">
        <section className="mt-[9px] rounded-card bg-cream px-[19px] pb-[14px] pt-[12px] shadow-card lg:mt-0 lg:px-8 lg:pb-8 lg:pt-8">
          {/* Hero */}
          <p className="flex items-center justify-center gap-1 leading-none">
            <Sparkle className="size-[8px] text-gold/70" />
            <span className="text-[20px]">👋</span>
            <Sparkle className="size-[9px] text-gold/80" />
          </p>
          <h2 className="mt-[6px] text-center text-[19.5px] font-extrabold leading-none tracking-[-0.01em] text-ink lg:mt-3 lg:text-[27px]">
            בואו נמצא לכם משהו טעים
          </h2>
          <p className="mt-[6px] text-center text-[11.5px] leading-[1.3] text-muted lg:mt-3 lg:text-[14px] lg:leading-[1.5]">
            אני המלצרית החכמה שלכם, אשאל כמה שאלות
            <br />
            מהירות כדי להמליץ בדיוק בשבילכם
          </p>
          <p className="mt-[2px] flex justify-center lg:mt-3">
            <Heart className="size-[12px] text-gold" />
          </p>

          {/* Current question */}
          <div className="mt-[12px] overflow-hidden rounded-[20px] bg-surface px-[11px] pb-[8px] pt-[6px] shadow-card lg:mt-6 lg:px-6 lg:pb-6 lg:pt-5">
            <div className="relative flex items-center justify-center">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  aria-label="לשאלה הקודמת"
                  className="tap absolute start-0 flex size-[26px] items-center justify-center rounded-full text-muted hover:bg-gold-tint hover:text-gold-deep"
                >
                  <ChevronRight className="size-[13px]" />
                </button>
              )}
              <p className="text-center text-[12px] leading-none text-ink-soft lg:text-[13px]">
                {questionProgressLabel(step)}
              </p>
            </div>

            <div
              dir="ltr"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={recommendationQuestions.length}
              className="mt-[7px] h-[4.5px] overflow-hidden rounded-full bg-track lg:mt-3"
            >
              <div
                className="h-full rounded-full bg-gold transition-[width] duration-[380ms] ease-[cubic-bezier(.32,.72,0,1)]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div
              className="mt-[14px] lg:mt-6"
              style={{
                transform: entering ? `translateX(${16 * direction}px)` : "translateX(0)",
                opacity: entering ? 0 : 1,
                transition: entering
                  ? "none"
                  : "transform 340ms var(--ease-settle), opacity 280ms ease",
              }}
            >
              <h3 className="text-center text-[20px] font-extrabold leading-none text-ink lg:text-[24px]">
                {question.title}
              </h3>

              <div className="mt-[10px] space-y-[7px] lg:mt-5 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                {question.choices.map((choice) => {
                  const on = selected.includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => choose(choice.id)}
                      aria-pressed={on}
                      className={`tap flex h-[36px] w-full items-center justify-start rounded-[16px] border pe-[8px] text-right shadow-row lg:h-[52px] ${
                        on ? "border-gold bg-gold-tint" : "border-hairline bg-surface"
                      }`}
                    >
                      <span className="ms-[8px] flex w-[22px] shrink-0 items-center justify-center lg:ms-4">
                        {CHOICE_ICON[choice.id] ?? fallbackIcon}
                      </span>
                      <span className="ms-[19px] text-[14px] font-bold text-ink lg:ms-3 lg:text-[15px]">
                        {choice.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Next question, previewed behind the current one */}
          {next && (
            <div className="mt-[6px] rounded-[20px] px-[11px] pb-[10px] pt-[7px] opacity-55 lg:mt-4">
              <p className="text-center text-[7.5px] leading-none text-muted lg:text-[10px]">
                שאלה הבאה
              </p>
              <p className="mt-[6px] text-center text-[16px] font-extrabold leading-none text-ink-soft lg:mt-2 lg:text-[17px]">
                {next.title}
              </p>
              <div className="no-scrollbar mt-[11px] flex justify-center gap-2 overflow-x-auto lg:mt-3">
                {next.choices.slice(0, 4).map((choice) => (
                  <span
                    key={choice.id}
                    className="flex h-[27px] shrink-0 items-center gap-1.5 rounded-[14px] border border-hairline bg-surface px-2.5 text-[11.5px] text-ink-soft"
                  >
                    <span className="text-[11px] leading-none">
                      {PREVIEW_ICON[choice.id] ?? "✨"}
                    </span>
                    {choice.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Free-text nudge, pointing at the always-available chat */}
        <div className="mt-[-30px] flex items-end gap-1 lg:mt-4">
          <p className="mb-[8px] flex flex-1 items-center gap-2 rounded-[16px] rounded-bl-[4px] bg-surface px-3 py-[7px] text-[12px] text-ink-soft shadow-row lg:py-3 lg:text-[13px]">
            אפשר גם לכתוב לי חופשי מה בא לכם
            <Sparkle className="ms-auto size-[11px] shrink-0 text-gold" />
          </p>
          <WaitressSketch className="h-[62px] w-[50px] shrink-0 lg:h-[76px] lg:w-[62px]" />
        </div>

        <button
          type="button"
          onClick={advance}
          className="tap lift mt-3 flex h-[38px] w-full items-center justify-center gap-2 rounded-full bg-gold-gradient text-[14.5px] font-bold text-white shadow-gold lg:h-[50px] lg:text-[16px]"
        >
          {isLast ? "המשיכו להמלצות" : "לשאלה הבאה"}
          <ChevronLeft className="size-[12px]" />
        </button>
      </div>
    </RestaurantShell>
  );
}
