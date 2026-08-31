"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NikolAvatar } from "@/components/NikolAvatar";
import { Book, ChevronLeft, ChevronRight, Mic, People, Send, Sparkle } from "@/components/Icons";
import { recommendationQuestions } from "@/features/ai-waiter/data/questions";
import { useSession } from "@/features/session/SessionProvider";
import { nikolAI } from "@/services/ai";
import type { Restaurant } from "@/types";

const TOTAL = recommendationQuestions.length;

interface Turn {
  id: string;
  role: "nikol" | "diner";
  text: string;
}

let turnSeq = 0;
const turnId = (role: string) => `${role}-${(turnSeq += 1)}`;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function RecommendConversation({
  restaurant,
  tableNumber,
}: {
  restaurant: Restaurant;
  tableNumber: number;
}) {
  const router = useRouter();
  const { dispatch } = useSession();
  const base = `/r/${restaurant.id}/table/${tableNumber}`;

  const [turns, setTurns] = useState<Turn[]>([]);
  /** Index of the question awaiting an answer; TOTAL once the flow is done. */
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [calledWaiter, setCalledWaiter] = useState(false);

  const alive = useRef(true);
  const booted = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const say = useCallback((role: Turn["role"], text: string) => {
    setTurns((t) => [...t, { id: turnId(role), role, text }]);
  }, []);

  /** A pause long enough to read as thinking, skipped under reduced motion. */
  const beat = useCallback(async (ms: number) => {
    if (reducedMotion()) return;
    await wait(ms);
  }, []);

  // Nikol opens the conversation herself.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    say("nikol", recommendationQuestions[0].ask);
  }, [say]);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [turns.length, typing]);

  const question = step < TOTAL ? recommendationQuestions[step] : null;
  const awaitingAnswer = question !== null && !typing;

  /**
   * One conversational round: the diner's answer lands, Nikol acknowledges it,
   * then she asks the next thing. The pauses are what stop it reading as a form.
   */
  const respond = useCallback(
    async (dinerText: string, reaction: string) => {
      say("diner", dinerText);
      setPicked([]);
      setTyping(true);

      await beat(620);
      if (!alive.current) return;
      say("nikol", reaction);
      setTyping(false);

      const next = step + 1;
      await beat(360);
      if (!alive.current) return;

      if (next < TOTAL) {
        setTyping(true);
        await beat(680);
        if (!alive.current) return;
        say("nikol", recommendationQuestions[next].ask);
        setTyping(false);
        setStep(next);
        return;
      }

      setTyping(true);
      await beat(900);
      if (!alive.current) return;
      say("nikol", "מצוין, יש לי בדיוק מה שמתאים לכם 🤎");
      setTyping(false);
      setStep(TOTAL);
    },
    [beat, say, step],
  );

  const answerWithChoices = useCallback(
    (ids: string[]) => {
      if (!question) return;
      const labels = ids
        .map((id) => question.choices.find((c) => c.id === id)?.label)
        .filter(Boolean) as string[];

      dispatch({ type: "setRecommendationAnswer", questionId: question.id, values: ids });

      const reaction =
        ids.length === 1
          ? (question.react[ids[0]] ?? question.reactFreeText)
          : "רשמתי הכל, תודה.";
      void respond(labels.join(" · "), reaction);
    },
    [dispatch, question, respond],
  );

  const onChip = useCallback(
    (id: string) => {
      if (!question || typing) return;

      if (question.type === "single") {
        answerWithChoices([id]);
        return;
      }

      // Multi-select: "no restrictions" is exclusive with everything else.
      setPicked((current) => {
        if (id === "none") return current.includes("none") ? [] : ["none"];
        const without = current.filter((c) => c !== "none");
        return without.includes(id) ? without.filter((c) => c !== id) : [...without, id];
      });
    },
    [answerWithChoices, question, typing],
  );

  const onSendText = useCallback(async () => {
    const text = draft.trim();
    if (!text || typing) return;
    setDraft("");

    if (question) {
      dispatch({ type: "setRecommendationAnswer", questionId: question.id, values: [text] });
      void respond(text, question.reactFreeText);
      return;
    }

    // The flow is over, so the composer becomes an ordinary question to Nikol.
    say("diner", text);
    setTyping(true);
    try {
      const reply = await nikolAI.ask(text, restaurant.id);
      if (alive.current) say("nikol", reply.text);
    } catch {
      if (alive.current) say("nikol", "משהו אצלי נתקע לרגע. אפשר לנסות שוב?");
    } finally {
      if (alive.current) setTyping(false);
    }
  }, [dispatch, draft, question, respond, restaurant.id, say, typing]);

  const callWaiter = () => {
    dispatch({
      type: "addServiceRequest",
      request: {
        id: `req-${Date.now().toString(36)}`,
        type: "waiter",
        label: "קריאה למלצר",
        status: "pending",
        createdAt: Date.now(),
      },
    });
    setCalledWaiter(true);
    setTimeout(() => setCalledWaiter(false), 3200);
  };

  const progress = Math.min(step + 1, TOTAL) / TOTAL;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/*
        The restaurant, softened. A real photograph blurred far past legibility
        gives the glass something warm to refract without competing with the
        conversation. Plain CSS rather than next/image so a venue with no
        photograph yet degrades to the ivory ground in silence.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 bg-ivory bg-cover bg-center"
        style={{
          inset: "-15%",
          backgroundImage: `url(/restaurants/${restaurant.id}/card.jpg)`,
          filter: "blur(50px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(251,248,245,0.86)_0%,rgba(251,248,245,0.92)_55%,rgba(248,242,234,0.95)_100%)]"
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-[620px] flex-col px-4 pb-5 pt-4 lg:max-w-[660px] lg:pb-10 lg:pt-8">
        {/* Top: identity in the middle, small floating controls at the edges */}
        <header className="relative flex flex-col items-center lg:flex-row lg:items-center lg:justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="חזרה"
            className="glass-control tap absolute top-0 start-0 flex size-[34px] items-center justify-center rounded-full text-ink-soft"
          >
            <ChevronRight className="size-[15px]" />
          </button>

          <div className="text-center">
            <h1 className="font-display text-[20px] leading-none font-normal text-ink lg:text-[22px]">
              {restaurant.name}
            </h1>
            <p className="mt-[5px] text-[9px] font-semibold tracking-[0.05em] text-gold lg:text-[10px]">
              {restaurant.subtitle}
            </p>
            <p className="mt-[6px] flex items-center justify-center gap-2 text-[11.5px] text-muted">
              <span className="size-[3px] rounded-full bg-gold" />
              שולחן {tableNumber}
              <span className="size-[3px] rounded-full bg-gold" />
            </p>
          </div>

          <div className="mt-3.5 flex items-center gap-2 lg:absolute lg:end-0 lg:mt-0">
            <Link
              href={`${base}/menu`}
              className="glass-control tap flex h-[34px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-ink-soft"
            >
              <Book className="size-[13px] text-gold" />
              תפריט
            </Link>
            <button
              type="button"
              onClick={callWaiter}
              className="glass-control tap flex h-[34px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-ink-soft"
            >
              <People className="size-[13px] text-gold" />
              קריאה למלצר
            </button>
          </div>
        </header>

        {calledWaiter && (
          <p
            role="status"
            className="glass-control toast-enter mx-auto mt-3 w-fit rounded-full px-4 py-1.5 text-[12px] font-semibold text-gold-deep"
          >
            שלחתי לצוות ✓
          </p>
        )}

        {/* The conversation */}
        <div className="flex min-h-0 flex-1 flex-col lg:justify-center">
        <section
          aria-label="שיחה עם ניקול"
          className="glass-panel mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] lg:mt-6 lg:flex-none lg:max-h-[72vh]"
        >
          <header className="flex items-center gap-3 px-5 pt-5 lg:px-6">
            <NikolAvatar size="md" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[16px] font-extrabold leading-none text-ink">
                תמליצי לי
                <Sparkle className="size-[12px] text-gold" />
              </p>
              <p className="mt-[6px] text-[11.5px] leading-none text-muted">
                {step < TOTAL ? `שאלה ${step + 1} מתוך ${TOTAL}` : "סיימנו — ההמלצות מוכנות"}
              </p>
            </div>
          </header>

          <div className="mx-5 mt-3.5 h-[3px] overflow-hidden rounded-full bg-track/70 lg:mx-6">
            <div
              className="h-full rounded-full bg-gold-gradient transition-[width] duration-[420ms] ease-[cubic-bezier(.32,.72,0,1)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div
            ref={scrollRef}
            className="no-scrollbar flex min-h-[180px] flex-1 flex-col overflow-y-auto px-5 py-4 lg:px-6"
          >
            <div className="mt-auto space-y-2.5">
            {turns.map((turn) =>
              turn.role === "nikol" ? (
                <div key={turn.id} className="message-enter flex items-end gap-2">
                  <NikolAvatar size="xs" />
                  <p className="max-w-[80%] whitespace-pre-line rounded-[18px] rounded-es-[6px] bg-[color-mix(in_srgb,#ffffff_78%,transparent)] px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-ink-soft shadow-row">
                    {turn.text}
                  </p>
                </div>
              ) : (
                <p
                  key={turn.id}
                  className="message-enter ms-auto w-fit max-w-[80%] rounded-[18px] rounded-ee-[6px] bg-gold-gradient px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-white shadow-gold"
                >
                  {turn.text}
                </p>
              ),
            )}

            {typing && (
              <div className="message-enter flex items-end gap-2">
                <NikolAvatar size="xs" />
                <span className="flex items-center gap-1 rounded-[18px] rounded-es-[6px] bg-[color-mix(in_srgb,#ffffff_78%,transparent)] px-3.5 py-3 shadow-row">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-[5px] animate-bounce rounded-full bg-gold/70"
                      style={{ animationDelay: `${i * 140}ms`, animationDuration: "900ms" }}
                    />
                  ))}
                </span>
              </div>
            )}
            </div>
          </div>

          {/* Quick replies for whatever Nikol just asked */}
          {awaitingAnswer && question && (
            <div className="flex flex-wrap gap-2 px-5 pb-1 lg:px-6">
              {question.choices.map((choice, i) => {
                const on = picked.includes(choice.id);
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => onChip(choice.id)}
                    aria-pressed={question.type === "multi" ? on : undefined}
                    style={{ "--rise-index": i } as React.CSSProperties}
                    className={`chip-enter tap rounded-full px-4 py-2 text-[13px] font-semibold ${
                      on ? "glass-chip-on text-white" : "glass-chip text-ink-soft"
                    }`}
                  >
                    {choice.label}
                  </button>
                );
              })}

              {question.type === "multi" && picked.length > 0 && (
                <button
                  type="button"
                  onClick={() => answerWithChoices(picked)}
                  className="tap flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-[13px] font-bold text-white shadow-gold"
                >
                  אפשר להמשיך
                  <ChevronLeft className="size-[11px]" />
                </button>
              )}
            </div>
          )}

          {step >= TOTAL && !typing && (
            <div className="px-5 pb-1 lg:px-6">
              <Link
                href={`${base}/recommend/results`}
                className="chip-enter tap flex h-[44px] items-center justify-center gap-2 rounded-full bg-gold-gradient text-[14.5px] font-bold text-white shadow-gold"
              >
                לראות את ההמלצות
                <ChevronLeft className="size-[12px]" />
              </Link>
            </div>
          )}

          {/* Composer — tap a chip, or just say it */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onSendText();
            }}
            className="m-4 flex h-[46px] items-center gap-2 rounded-full bg-[color-mix(in_srgb,#ffffff_72%,transparent)] px-[6px] shadow-row lg:mx-6"
          >
            <button
              type="submit"
              aria-label="שליחה"
              disabled={typing || !draft.trim()}
              className="tap flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-40"
            >
              <Send className="size-[15px]" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="אפשר לכתוב או לשאול אותי משהו..."
              aria-label="הודעה לניקול"
              className="min-w-0 flex-1 bg-transparent text-right text-[13px] text-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              aria-label="הקלטה קולית"
              title="הקלטה קולית — לא פעיל בהדגמה"
              className="tap flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-deep"
            >
              <Mic className="size-[15px]" />
            </button>
          </form>
        </section>
        </div>
      </div>
    </div>
  );
}
