"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NikolAvatar } from "@/components/NikolAvatar";
import { Bell, Book, ChevronLeft, Lock, Mic, Person, Send, Sparkle } from "@/components/Icons";
import { NikolMark } from "@/components/Brand";
import { recommendationQuestions } from "@/features/ai-waiter/data/questions";
import { useSession } from "@/features/session/SessionProvider";
import { nikolAI } from "@/services/ai";
import type { Restaurant } from "@/types";

const TOTAL = recommendationQuestions.length;

interface Turn {
  id: string;
  role: "nikol" | "diner";
  text: string;
  at: string;
}

const clock = () =>
  new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

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
    setTurns((t) => [...t, { id: turnId(role), role, text, at: clock() }]);
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
        className="room-backdrop pointer-events-none absolute"
        style={{ inset: "-12%", filter: "blur(22px)" }}
      />
      {/* A veil that keeps the conversation legible over the room. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(252,248,242,0.40)_0%,rgba(251,245,237,0.34)_45%,rgba(244,233,217,0.46)_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[620px] flex-col px-4 pb-5 pt-4 lg:max-w-[760px] lg:pb-10 lg:pt-8">
        {/* Top: identity in the middle, small floating controls at the edges */}
        <header className="relative flex items-start justify-between gap-2">
          {/* Calling a waiter sits at the inline start, the menu at the end. */}
          <button
            type="button"
            onClick={callWaiter}
            className="glass-control tap flex h-[36px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-ink-soft"
          >
            <Bell className="size-[13px] text-gold" />
            <span className="hidden xs:inline">קריאה למלצר</span>
          </button>

          {/* The brand doubles as the way back to the restaurant home. */}
          <Link href={base} className="tap flex flex-col items-center text-center">
            <NikolMark className="h-[38px] w-[30px] text-gold" />
            <h1 className="mt-[2px] font-display text-[19px] leading-none font-normal text-ink lg:text-[21px]">
              {restaurant.name}
            </h1>
            <p className="mt-[4px] text-[8.5px] font-semibold tracking-[0.05em] text-gold lg:text-[9.5px]">
              {restaurant.subtitle}
            </p>
            <p className="mt-[6px] flex items-center justify-center gap-2 text-[11.5px] text-muted">
              <span className="size-[3px] rounded-full bg-gold" />
              שולחן {tableNumber}
              <span className="size-[3px] rounded-full bg-gold" />
            </p>
          </Link>

          <Link
            href={`${base}/menu`}
            className="glass-control tap flex h-[36px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-ink-soft"
          >
            <Book className="size-[13px] text-gold" />
            <span className="hidden xs:inline">תפריט</span>
          </Link>
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
          <header className="flex items-center justify-center gap-4 px-5 pt-7 pb-1 lg:px-6">
            <div>
              <p className="flex items-center gap-2 text-[24px] font-extrabold leading-none tracking-[-0.01em] text-ink lg:text-[31px]">
                <Sparkle className="size-[17px] text-gold lg:size-[20px]" />
                תמליצי לי
              </p>
              <p className="mt-[10px] text-[12.5px] leading-none text-muted">
                {step < TOTAL ? `שאלה ${step + 1} מתוך ${TOTAL}` : "סיימנו — ההמלצות מוכנות"}
              </p>
              {/* Four steps, shown as four segments rather than one sliding bar. */}
              <div className="mt-2.5 flex gap-1.5">
                {recommendationQuestions.map((q, i) => (
                  <span
                    key={q.id}
                    className={`h-[4px] w-[26px] rounded-full transition-colors duration-[420ms] lg:w-[34px] ${
                      i < step ? "bg-gold" : i === step ? "bg-gold/45" : "bg-gold/12"
                    }`}
                  />
                ))}
              </div>
            </div>
            <NikolAvatar size="md" className="lg:size-[92px]" />
          </header>

          <div
            ref={scrollRef}
            className="no-scrollbar flex min-h-[180px] flex-1 flex-col overflow-y-auto px-5 py-4 lg:px-6"
          >
            <div className="mt-auto space-y-2.5">
            {turns.map((turn) => (
              <div key={turn.id} className="message-enter flex items-end gap-2">
                {turn.role === "nikol" ? (
                  <NikolAvatar size="xs" />
                ) : (
                  <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-deep">
                    <Person className="size-[15px]" />
                  </span>
                )}
                <div
                  className={`flex max-w-[78%] items-end gap-3 rounded-[16px] px-3.5 py-2.5 ${
                    turn.role === "nikol"
                      ? "bg-[color-mix(in_srgb,#ffffff_86%,transparent)] shadow-row"
                      : "bg-[color-mix(in_srgb,#efe3d0_82%,transparent)]"
                  }`}
                >
                  <span className="whitespace-pre-line text-[13.5px] leading-[1.55] text-ink-soft">
                    {turn.text}
                  </span>
                  <time className="shrink-0 pb-[2px] text-[9.5px] tabular-nums text-muted/70">
                    {turn.at}
                  </time>
                </div>
              </div>
            ))}

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
                    className={`chip-enter tap flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold ${
                      on ? "glass-chip-on text-white" : "glass-chip text-ink-soft"
                    }`}
                  >
                    {choice.icon && <span className="text-[13px] leading-none">{choice.icon}</span>}
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
              className="tap flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gold text-white"
            >
              <Mic className="size-[15px]" />
            </button>
          </form>
        </section>

        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[10.5px] text-muted/80">
          <Lock className="size-[11px]" />
          ההמלצות נבנות לצורך שיפור השירות בלבד
        </p>
        </div>
      </div>
    </div>
  );
}
