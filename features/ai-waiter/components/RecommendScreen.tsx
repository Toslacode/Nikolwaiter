"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { WaitressSketch } from "@/components/Brand";
import {
  ChevronLeft,
  Cloche,
  Fish,
  Heart,
  Leaf,
  Meat,
  People,
  Sparkle,
  Sparkles,
} from "@/components/Icons";
import { MobileShell } from "@/components/MobileShell";
import { recommendationQuestions, questionProgressLabel } from "@/features/ai-waiter/data/questions";
import { RestaurantHeader } from "@/features/restaurants/components/RestaurantHeader";
import type { Restaurant } from "@/types";
import { ChatBottomSheet, type QuickPrompt } from "./ChatBottomSheet";

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
  const base = `/r/${restaurant.id}/table/${tableNumber}`;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const question = recommendationQuestions[step];
  const next = recommendationQuestions[step + 1];
  const progress = (step + 1) / recommendationQuestions.length;

  const selected = useMemo(() => answers[question.id] ?? [], [answers, question.id]);

  // The question card should visibly arrive when the step advances rather than
  // its contents being swapped underneath the reader.
  const previousStep = useRef(step);
  const [entering, setEntering] = useState(false);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEntering(true);
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntering(false)),
    );
    return () => cancelAnimationFrame(frame);
  }, [step]);

  const choose = (choiceId: string) => {
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      const value =
        question.type === "multi"
          ? current.includes(choiceId)
            ? current.filter((c) => c !== choiceId)
            : [...current, choiceId]
          : [choiceId];
      return { ...prev, [question.id]: value };
    });

    if (question.type === "single" && step < recommendationQuestions.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 180);
    }
  };

  const advance = () => {
    if (step < recommendationQuestions.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(answers)) params.set(key, value.join(","));
    router.push(`${base}/recommend/results?${params.toString()}`);
  };

  return (
    <MobileShell>
      <div className="flex min-h-dvh flex-col">
        <main className="flex-1 px-5 pt-[10px]">
          <RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} showBack />

          <section className="mt-[9px] rounded-card bg-cream px-[19px] pb-[14px] pt-[12px] shadow-card">
            {/* Hero */}
            <p className="flex items-center justify-center gap-1 leading-none">
              <Sparkle className="size-[8px] text-gold/70" />
              <span className="text-[20px]">👋</span>
              <Sparkle className="size-[9px] text-gold/80" />
            </p>
            <h2 className="mt-[6px] text-center text-[19.5px] font-extrabold leading-none text-ink">
              בואו נמצא לכם משהו טעים
            </h2>
            <p className="mt-[6px] text-center text-[11.5px] leading-[1.3] text-muted">
              אני המלצרית החכמה שלכם, אשאל כמה שאלות
              <br />
              מהירות כדי להמליץ בדיוק בשבילכם
            </p>
            <p className="mt-[2px] flex justify-center">
              <Heart className="size-[12px] text-gold" />
            </p>

            {/* Current question */}
            <div className="mt-[12px] overflow-hidden rounded-[20px] bg-surface px-[11px] pb-[8px] pt-[6px] shadow-card">
              <p className="text-center text-[12px] leading-none text-ink-soft">
                {questionProgressLabel(step)}
              </p>
              <div dir="ltr" className="mt-[7px] h-[4.5px] overflow-hidden rounded-full bg-track">
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-[380ms] ease-[cubic-bezier(.32,.72,0,1)]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div
                className="mt-[14px]"
                style={{
                  transform: entering ? "translateX(16px)" : "translateX(0)",
                  opacity: entering ? 0 : 1,
                  transition: entering
                    ? "none"
                    : "transform 340ms cubic-bezier(.32,.72,0,1), opacity 280ms ease",
                }}
              >
              <h3 className="text-center text-[20px] font-extrabold leading-none text-ink">
                {question.title}
              </h3>

              <div className="mt-[10px] space-y-[7px]">
                {question.choices.map((choice) => {
                  const on = selected.includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => choose(choice.id)}
                      aria-pressed={on}
                      className={`tap flex h-[36px] w-full items-center justify-start rounded-[16px] border pe-[8px] text-right shadow-row transition-colors ${
                        on ? "border-gold bg-gold-tint" : "border-hairline bg-surface"
                      }`}
                    >
                      <span className="ms-[8px] flex w-[22px] shrink-0 items-center justify-center">
                        {CHOICE_ICON[choice.id] ?? fallbackIcon}
                      </span>
                      <span className="ms-[19px] text-[14px] font-bold text-ink">
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
              <div className="mt-[6px] rounded-[20px] px-[11px] pb-[10px] pt-[7px] opacity-55">
                <p className="text-center text-[7.5px] leading-none text-muted">שאלה הבאה</p>
                <p className="mt-[6px] text-center text-[16px] font-extrabold leading-none text-ink-soft">
                  {next.title}
                </p>
                <div className="no-scrollbar mt-[11px] flex justify-center gap-2 overflow-x-auto">
                  {next.choices.slice(0, 4).map((choice) => (
                    <span
                      key={choice.id}
                      className="flex h-[27px] shrink-0 items-center gap-1.5 rounded-[14px] border border-hairline bg-surface px-2.5 text-[11.5px] text-ink-soft"
                    >
                      <span className="text-[11px] leading-none">{PREVIEW_ICON[choice.id] ?? "✨"}</span>
                      {choice.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Free-text nudge */}
          <div className="mt-[-30px] flex items-end gap-1">
            <p className="mb-[8px] flex flex-1 items-center gap-2 rounded-[16px] rounded-bl-[4px] bg-surface px-3 py-[7px] text-[12px] text-ink-soft shadow-row">
              אפשר גם לכתוב לי חופשי מה בא לכם
              <Sparkle className="ms-auto size-[11px] shrink-0 text-gold" />
            </p>
            <WaitressSketch className="h-[62px] w-[50px] shrink-0" />
          </div>
        </main>

        <div>
          <ChatBottomSheet
            prompts={RECOMMEND_PROMPTS}
            helper={null}
            placeholder="אפשר לכתוב כאן מה מתחשק לכם..."
            onSend={(text) =>
              router.push(`${base}/recommend/results?q=${encodeURIComponent(text)}`)
            }
          />

          <div className="bg-cream px-5 pb-4">
            <button
              type="button"
              onClick={advance}
              className="tap flex h-[38px] w-full items-center justify-center gap-2 rounded-full bg-gold-gradient text-[14.5px] font-bold text-white shadow-gold"
            >
              המשיכו להמלצות
              <ChevronLeft className="size-[12px]" />
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
