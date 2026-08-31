"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NikolMark } from "@/components/Brand";
import { Basket, Bell, Book, Lock, Mic, Person, Send, Sparkle } from "@/components/Icons";
import { NikolAvatar } from "@/components/NikolAvatar";
import { ConversationDishCard } from "@/features/ai-waiter/components/ConversationDishCard";
import { recommendationQuestions } from "@/features/ai-waiter/data/questions";
import {
  INTENTS,
  PREFERENCE_CHOICES,
  profileFromAnswers,
  type Intent,
} from "@/features/ai-waiter/NikolFlow";
import { useSession } from "@/features/session/SessionProvider";
import { nikolAI } from "@/services/ai";
import type { DietaryTag, Restaurant } from "@/types";

const TOTAL = recommendationQuestions.length;

interface Turn {
  id: string;
  role: "nikol" | "diner";
  text: string;
  at: string;
  /** Dishes Nikol attached to this message, rendered as cards beneath it. */
  dishIds?: string[];
  /** Her one-line reason per dish, keyed by dish id. */
  reasons?: Record<string, string>;
}

/** What Nikol is currently doing. Everything happens on this one screen. */
type Mode = "idle" | "recommend" | "preferences";

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

const OPENING =
  "היי, אני ניקול 👋\nאני כאן איתכם לאורך הארוחה.\nמה תרצו לעשות?";

export function NikolConversation({
  restaurant,
  tableNumber,
  /** Deep links can drop the diner straight into a branch. */
  startWith,
}: {
  restaurant: Restaurant;
  tableNumber: number;
  startWith?: Intent["id"];
}) {
  const router = useRouter();
  const { session, dispatch, itemCount } = useSession();
  const base = `/r/${restaurant.id}/table/${tableNumber}`;

  const [turns, setTurns] = useState<Turn[]>([]);
  const [mode, setMode] = useState<Mode>("idle");
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [calledWaiter, setCalledWaiter] = useState(false);

  const alive = useRef(true);
  const booted = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Answers gathered this visit, so the profile is built without a re-render race. */
  const answers = useRef<Record<string, string[]>>({});

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const say = useCallback(
    (role: Turn["role"], text: string, extra?: Pick<Turn, "dishIds" | "reasons">) => {
      setTurns((t) => [...t, { id: turnId(role), role, text, at: clock(), ...extra }]);
    },
    [],
  );

  /** A pause long enough to read as thinking, skipped under reduced motion. */
  const beat = useCallback(async (ms: number) => {
    if (reducedMotion()) return;
    await wait(ms);
  }, []);

  /** Nikol takes a moment, then says her piece. */
  const sayAfter = useCallback(
    async (ms: number, text: string, extra?: Pick<Turn, "dishIds" | "reasons">) => {
      setTyping(true);
      await beat(ms);
      if (!alive.current) return false;
      say("nikol", text, extra);
      setTyping(false);
      return true;
    },
    [beat, say],
  );

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [turns.length, typing]);

  /* ---------------------------------------------------------------- */
  /* Branches                                                          */
  /* ---------------------------------------------------------------- */

  const startRecommend = useCallback(async () => {
    setMode("recommend");
    setStep(0);
    answers.current = {};
    await sayAfter(620, "בשמחה ✨ נתחיל פשוט.");
    await beat(300);
    if (!alive.current) return;
    await sayAfter(560, recommendationQuestions[0].ask);
  }, [beat, sayAfter]);

  const showPopular = useCallback(async () => {
    const ids = restaurant.popularDishIds.slice(0, 3);
    await sayAfter(
      760,
      "אם זו הפעם הראשונה שלכם כאן, יש כמה מנות שקשה לטעות איתן ✨",
      { dishIds: ids },
    );
  }, [restaurant.popularDishIds, sayAfter]);

  const startPreferences = useCallback(async () => {
    setMode("preferences");
    setPicked([]);
    await sayAfter(560, "בטח. מה חשוב שאדע?");
  }, [sayAfter]);

  const openMenu = useCallback(async () => {
    const ok = await sayAfter(520, "בטח, הנה התפריט 🍽️");
    if (!ok) return;
    await beat(650);
    if (!alive.current) return;
    router.push(`${base}/menu`);
  }, [base, beat, router, sayAfter]);

  const callWaiter = useCallback(() => {
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
  }, [dispatch]);

  /** The end of the recommendation branch: real picks, as cards. */
  const deliverRecommendations = useCallback(async () => {
    setTyping(true);
    await beat(900);
    if (!alive.current) return;

    const profile = profileFromAnswers(answers.current, session.profile);
    dispatch({ type: "patchProfile", profile });

    let picks: Awaited<ReturnType<typeof nikolAI.recommend>> = [];
    try {
      picks = await nikolAI.recommend(profile, restaurant.id);
    } catch {
      picks = [];
    }
    if (!alive.current) return;
    setTyping(false);

    if (picks.length === 0) {
      say("nikol", "לא הצלחתי לצמצם את זה. רוצים שאראה לכם את התפריט?");
      setMode("idle");
      return;
    }

    const top = picks.slice(0, 2);
    say(
      "nikol",
      top.length > 1
        ? "מצאתי שתי מנות שנראות לי ממש מתאימות לכם."
        : "מצאתי מנה שנראית לי ממש מתאימה לכם.",
      {
        dishIds: top.map((p) => p.dish.id),
        reasons: Object.fromEntries(top.map((p) => [p.dish.id, p.reason])),
      },
    );
    setMode("idle");
  }, [beat, dispatch, restaurant.id, say, session.profile]);

  /* ---------------------------------------------------------------- */
  /* One conversational round                                          */
  /* ---------------------------------------------------------------- */

  const answerQuestion = useCallback(
    async (dinerText: string, reaction: string, values: string[]) => {
      const question = recommendationQuestions[step];
      answers.current = { ...answers.current, [question.id]: values };
      dispatch({ type: "setRecommendationAnswer", questionId: question.id, values });

      say("diner", dinerText);
      setPicked([]);

      const ok = await sayAfter(620, reaction);
      if (!ok) return;

      const next = step + 1;
      await beat(340);
      if (!alive.current) return;

      if (next < TOTAL) {
        setStep(next);
        await sayAfter(620, recommendationQuestions[next].ask);
        return;
      }

      setStep(TOTAL);
      await deliverRecommendations();
    },
    [beat, deliverRecommendations, dispatch, say, sayAfter, step],
  );

  const runIntent = useCallback(
    async (intent: Intent) => {
      say("diner", intent.label);
      switch (intent.id) {
        case "menu":
          return openMenu();
        case "recommend":
          return startRecommend();
        case "popular":
          return showPopular();
        case "preferences":
          return startPreferences();
        case "waiter":
          callWaiter();
          return void sayAfter(480, "קראתי לצוות, מישהו יגיע אליכם עוד רגע ✓");
      }
    },
    [callWaiter, openMenu, say, sayAfter, showPopular, startPreferences, startRecommend],
  );

  const confirmPreferences = useCallback(async () => {
    const chosen = picked;
    const labels = chosen
      .map((id) => PREFERENCE_CHOICES.find((c) => c.id === id)?.label)
      .filter(Boolean) as string[];

    say("diner", labels.join(" · "));
    setPicked([]);
    setMode("idle");

    const restrictions = chosen.filter(
      (c) => c !== "none" && c !== "allergy",
    ) as DietaryTag[];
    dispatch({
      type: "patchProfile",
      profile: {
        restrictions: [...new Set([...session.profile.restrictions, ...restrictions])],
      },
    });

    if (chosen.includes("allergy")) {
      await sayAfter(
        640,
        "רשמתי, ואעדכן גם את הצוות.\nלפי המידע שסיפקה המסעדה אתאים לכם מנות — אבל כדאי לוודא גם עם איש צוות.",
      );
      return;
    }
    await sayAfter(
      620,
      chosen.includes("none")
        ? "מצוין, בלי מגבלות. אז יש לי יותר מקום לשחק ✨"
        : "רשמתי. אקח את זה בחשבון בכל מה שאמליץ.",
    );
  }, [dispatch, picked, say, sayAfter, session.profile.restrictions]);

  /* ---------------------------------------------------------------- */
  /* Input                                                             */
  /* ---------------------------------------------------------------- */

  const question = mode === "recommend" && step < TOTAL ? recommendationQuestions[step] : null;

  const onChip = useCallback(
    (id: string) => {
      if (typing) return;

      if (mode === "idle") {
        const intent = INTENTS.find((i) => i.id === id);
        if (intent) void runIntent(intent);
        return;
      }

      if (mode === "preferences") {
        setPicked((current) => {
          if (id === "none") return current.includes("none") ? [] : ["none"];
          const without = current.filter((c) => c !== "none");
          return without.includes(id) ? without.filter((c) => c !== id) : [...without, id];
        });
        return;
      }

      if (!question) return;

      if (question.type === "single") {
        const choice = question.choices.find((c) => c.id === id);
        void answerQuestion(
          choice?.label ?? id,
          question.react[id] ?? question.reactFreeText,
          [id],
        );
        return;
      }

      setPicked((current) => {
        if (id === "none") return current.includes("none") ? [] : ["none"];
        const without = current.filter((c) => c !== "none");
        return without.includes(id) ? without.filter((c) => c !== id) : [...without, id];
      });
    },
    [answerQuestion, mode, question, runIntent, typing],
  );

  const confirmMulti = useCallback(() => {
    if (mode === "preferences") return void confirmPreferences();
    if (!question) return;
    const labels = picked
      .map((id) => question.choices.find((c) => c.id === id)?.label)
      .filter(Boolean) as string[];
    void answerQuestion(labels.join(" · "), "רשמתי הכל, תודה.", picked);
  }, [answerQuestion, confirmPreferences, mode, picked, question]);

  /**
   * Free text always works. Inside a question it counts as the answer; the
   * rest of the time it goes to Nikol as an ordinary thing to say, and her
   * reply can bring dishes back with it.
   */
  const onSendText = useCallback(async () => {
    const text = draft.trim();
    if (!text || typing) return;
    setDraft("");

    if (question) {
      void answerQuestion(text, question.reactFreeText, [text]);
      return;
    }

    say("diner", text);
    setTyping(true);
    try {
      const reply = await nikolAI.ask(text, restaurant.id);
      if (!alive.current) return;
      setTyping(false);
      say("nikol", reply.text, reply.dishIds ? { dishIds: reply.dishIds } : undefined);
    } catch {
      if (!alive.current) return;
      setTyping(false);
      say("nikol", "משהו אצלי נתקע לרגע. אפשר לנסות שוב?");
    }
  }, [answerQuestion, draft, question, restaurant.id, say, typing]);

  // Nikol is already at the table when the diner arrives.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    say("nikol", OPENING);
    if (!startWith) return;
    const intent = INTENTS.find((i) => i.id === startWith);
    if (intent) void runIntent(intent);
  }, [runIntent, say, startWith]);

  /* ---------------------------------------------------------------- */

  const chips =
    mode === "idle"
      ? INTENTS
      : mode === "preferences"
        ? PREFERENCE_CHOICES.map((c) => ({ ...c, utility: false }))
        : (question?.choices ?? []).map((c) => ({
            id: c.id,
            label: c.label,
            icon: c.icon ?? "",
            utility: false,
          }));

  const multi = mode === "preferences" || question?.type === "multi";
  const showChips = !typing && (mode === "idle" || Boolean(question) || mode === "preferences");

  const header =
    mode === "recommend"
      ? { title: "תמליצי לי", sub: `שאלה ${Math.min(step + 1, TOTAL)} מתוך ${TOTAL}` }
      : mode === "preferences"
        ? { title: "העדפות ואלרגיות", sub: "מה שתגידו נשמר לשולחן" }
        : { title: "ניקול", sub: "המלצרית שלכם לערב" };

  const dishOf = (id: string) => restaurant.dishes.find((d) => d.id === id);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/*
        The room, softened. Built in CSS rather than a photograph so a venue
        without an interior shot still gets warmth behind the glass.
      */}
      <div
        aria-hidden="true"
        className="room-backdrop pointer-events-none absolute"
        style={{ inset: "-12%", filter: "blur(22px)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(252,248,242,0.40)_0%,rgba(251,245,237,0.34)_45%,rgba(244,233,217,0.46)_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[620px] flex-col px-4 pb-5 pt-4 lg:max-w-[760px] lg:pb-10 lg:pt-8">
        <header className="relative flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={callWaiter}
            className="glass-control tap flex h-[36px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-ink-soft"
          >
            <Bell className="size-[13px] text-gold" />
            <span className="hidden xs:inline">קריאה למלצר</span>
          </button>

          <div className="flex flex-col items-center text-center">
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
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {itemCount > 0 && (
              <Link
                href={`${base}/order`}
                className="glass-control tap flex h-[36px] items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-ink-soft"
              >
                <Basket className="size-[13px] text-gold" />
                <span key={itemCount} className="pop-once font-bold">
                  {itemCount}
                </span>
              </Link>
            )}
            <Link
              href={`${base}/menu`}
              className="glass-control tap flex h-[36px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-ink-soft"
            >
              <Book className="size-[13px] text-gold" />
              <span className="hidden xs:inline">תפריט</span>
            </Link>
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

        <div className="flex min-h-0 flex-1 flex-col lg:justify-center">
          <section
            aria-label="שיחה עם ניקול"
            className="glass-panel mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] lg:mt-6 lg:flex-none lg:max-h-[72vh]"
          >
            <header className="flex items-center justify-center gap-4 px-5 pt-7 pb-1 lg:px-6">
              <div>
                <p className="flex items-center gap-2 text-[24px] font-extrabold leading-none tracking-[-0.01em] text-ink lg:text-[31px]">
                  <Sparkle className="size-[17px] text-gold lg:size-[20px]" />
                  {header.title}
                </p>
                <p className="mt-[10px] text-[12.5px] leading-none text-muted">{header.sub}</p>
                {mode === "recommend" && (
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
                )}
              </div>
              <NikolAvatar size="md" className="lg:size-[92px]" />
            </header>

            <div
              ref={scrollRef}
              className="no-scrollbar flex min-h-[180px] flex-1 flex-col overflow-y-auto px-5 py-4 lg:px-6"
            >
              <div className="mt-auto space-y-2.5">
                {turns.map((turn) => (
                  <div key={turn.id} className="message-enter">
                    <div className="flex items-end gap-2">
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

                    {turn.dishIds && turn.dishIds.length > 0 && (
                      <div className="mt-2 max-w-[78%] space-y-2 ps-[36px]">
                        {turn.dishIds.map((id, i) => {
                          const dish = dishOf(id);
                          if (!dish) return null;
                          return (
                            <div
                              key={id}
                              style={{ "--rise-index": i } as React.CSSProperties}
                              className="chip-enter"
                            >
                              <ConversationDishCard
                                dish={dish}
                                href={`${base}/dish/${dish.id}`}
                                reason={turn.reasons?.[id]}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {typing && (
                  <div className="message-enter flex items-end gap-2">
                    <NikolAvatar size="xs" />
                    <span className="flex items-center gap-1 rounded-[16px] bg-[color-mix(in_srgb,#ffffff_86%,transparent)] px-3.5 py-3 shadow-row">
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

            {showChips && (
              <div className="flex flex-wrap gap-2 px-5 pb-1 lg:px-6">
                {chips.map((choice, i) => {
                  const on = picked.includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => onChip(choice.id)}
                      aria-pressed={multi ? on : undefined}
                      style={{ "--rise-index": i } as React.CSSProperties}
                      className={`chip-enter tap flex items-center gap-1.5 rounded-full font-semibold ${
                        "utility" in choice && choice.utility
                          ? "px-3.5 py-2 text-[12px] text-muted"
                          : "px-4 py-2.5 text-[13px]"
                      } ${on ? "glass-chip-on text-white" : "glass-chip text-ink-soft"}`}
                    >
                      {choice.icon && <span className="text-[13px] leading-none">{choice.icon}</span>}
                      {choice.label}
                    </button>
                  );
                })}

                {multi && picked.length > 0 && (
                  <button
                    type="button"
                    onClick={confirmMulti}
                    className="tap rounded-full bg-gold-gradient px-4 py-2.5 text-[13px] font-bold text-white shadow-gold"
                  >
                    אפשר להמשיך
                  </button>
                )}
              </div>
            )}

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
