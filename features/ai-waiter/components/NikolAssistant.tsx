"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, Send, Sparkle } from "@/components/Icons";
import { ChatThread } from "@/features/ai-waiter/components/ChatThread";
import { type ChatContext, useNikolChat } from "@/features/ai-waiter/useNikolChat";
import { projectMomentum, rubberband, useSpring } from "@/lib/useSpring";

export interface QuickPrompt {
  id: string;
  label: string;
  icon: string;
}

const GREETING = "היי, אני ניקול 👋 ספרו לי מה בא לכם ואמצא לכם התאמה.";

/** Collapsed, half, full — the sheet's resting heights for the thread area. */
const DETENTS = [0, 250, 460];

interface AssistantProps {
  prompts: QuickPrompt[];
  placeholder?: string;
  helper?: string | null;
  context?: ChatContext;
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function QuickPrompts({
  prompts,
  onPick,
  disabled,
}: {
  prompts: QuickPrompt[];
  onPick: (label: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(prompt.label)}
          className="tap lift flex h-[27px] shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-surface px-3.5 text-[12px] font-medium text-ink-soft disabled:opacity-50"
        >
          <span className="text-[10px] leading-none">{prompt.icon}</span>
          {prompt.label}
        </button>
      ))}
    </div>
  );
}

function Composer({
  onSend,
  placeholder,
  disabled,
}: {
  onSend: (text: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
      }}
      className="flex h-[40px] items-center gap-2 rounded-full bg-surface px-[5px] shadow-row"
    >
      <button
        type="submit"
        aria-label="שליחה"
        disabled={disabled || !text.trim()}
        className="tap flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-40"
      >
        <Send className="size-[14px]" />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-right text-[12px] text-ink outline-none placeholder:text-muted"
      />
      <button
        type="button"
        aria-label="הקלטה קולית"
        title="הקלטה קולית — לא פעיל בהדגמה"
        className="tap flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gold text-white"
      >
        <Mic className="size-[14px]" />
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile — a real bottom sheet                                        */
/* ------------------------------------------------------------------ */

function ChatSheet({ prompts, placeholder, helper, context }: Required<AssistantProps>) {
  const { messages, pending, send } = useNikolChat(context);
  const height = useSpring(0, { response: 0.35, damping: 0.82 });
  const [dragging, setDragging] = useState(false);

  const drag = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    lastY: number;
    lastT: number;
    velocity: number;
  } | null>(null);

  const maxDetent = DETENTS[DETENTS.length - 1];

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    // Grab from wherever it is right now, mid-animation included.
    height.stop();
    drag.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: height.value,
      lastY: e.clientY,
      lastT: performance.now(),
      velocity: 0,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;

    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) {
      // px/s, upward positive — the direction that opens the sheet.
      d.velocity = ((d.lastY - e.clientY) / dt) * 1000;
      d.lastY = e.clientY;
      d.lastT = now;
    }

    const raw = d.startHeight + (d.startY - e.clientY);
    // Resist rather than stop dead at either end.
    const next =
      raw > maxDetent
        ? maxDetent + rubberband(raw - maxDetent, maxDetent)
        : raw < 0
          ? -rubberband(-raw, maxDetent)
          : raw;
    height.set(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragging(false);

    // Land where the throw was going, not where the finger left off.
    const projected = height.value + projectMomentum(d.velocity);
    const target = DETENTS.reduce((best, detent) =>
      Math.abs(detent - projected) < Math.abs(best - projected) ? detent : best,
    );
    height.to(target, d.velocity);
  };

  const cycle = useCallback(() => {
    const current = DETENTS.findIndex((d) => Math.abs(d - height.value) < 20);
    const next = current === -1 || current === DETENTS.length - 1 ? 0 : current + 1;
    height.to(DETENTS[next]);
  }, [height]);

  const open = height.value > 8;

  return (
    <section
      aria-label="צ׳אט עם המלצרית"
      className="glass sticky bottom-0 z-30 rounded-t-[28px] px-4 pt-[9px] pb-safe shadow-sheet lg:hidden"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={open ? "סגירת השיחה" : "פתיחת שיחה מלאה"}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            cycle();
          }
        }}
        className="-mt-1 mb-1 flex cursor-grab touch-none justify-center p-3 active:cursor-grabbing"
      >
        <div
          className="h-[4px] w-[38px] rounded-full bg-[#DCD6CE]"
          style={{
            transform: `scaleX(${1 + Math.min(height.value / maxDetent, 1) * 0.15})`,
            transition: dragging ? "none" : "transform 200ms var(--ease-settle)",
          }}
        />
      </div>

      <h2 className="flex items-center justify-center gap-1.5 text-[15px] font-extrabold leading-none text-ink">
        <Sparkle className="size-[13px] text-gold" />
        צ׳אט עם המלצרית
      </h2>
      {helper && !open && (
        <p className="mt-[8px] text-center text-[11.5px] leading-none text-muted">{helper}</p>
      )}

      <div
        className="overflow-y-auto overscroll-contain"
        style={{
          height: Math.max(0, height.value),
          opacity: Math.min(1, height.value / 60),
          marginTop: height.value > 0 ? 10 : 0,
        }}
      >
        <ChatThread messages={messages} pending={pending} greeting={GREETING} />
      </div>

      <div className="mt-[15px]">
        <QuickPrompts
          prompts={prompts}
          disabled={pending}
          onPick={(label) => {
            if (height.value < DETENTS[1]) height.to(DETENTS[1]);
            void send(label);
          }}
        />
      </div>

      <div className="mt-[13px]">
        <Composer
          placeholder={placeholder}
          disabled={pending}
          onSend={(text) => {
            if (height.value < DETENTS[1]) height.to(DETENTS[1]);
            void send(text);
          }}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop — a persistent panel                                        */
/* ------------------------------------------------------------------ */

function ChatPanel({ prompts, placeholder, context }: Required<AssistantProps>) {
  const { messages, pending, send } = useNikolChat(context);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      aria-label="צ׳אט עם המלצרית"
      className="hidden rounded-card bg-cream p-4 shadow-card lg:block"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold leading-none text-ink">
          <Sparkle className="size-[13px] text-gold" />
          צ׳אט עם המלצרית
        </h2>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="tap rounded-full px-2 py-1 text-[11px] font-semibold text-gold-deep hover:bg-gold-tint"
        >
          {collapsed ? "פתיחה" : "כיווץ"}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="mt-3 max-h-[52vh] min-h-[300px] overflow-y-auto pe-1">
            <ChatThread messages={messages} pending={pending} greeting={GREETING} />
          </div>

          <div className="mt-3">
            <QuickPrompts prompts={prompts} disabled={pending} onPick={(l) => void send(l)} />
          </div>

          <div className="mt-3">
            <Composer
              placeholder={placeholder}
              disabled={pending}
              onSend={(t) => void send(t)}
            />
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Nikol, always reachable. The sheet and the panel render the same session
 * thread, so the conversation survives a resize or an orientation change.
 */
export function NikolAssistant({
  prompts,
  placeholder = "אפשר לשאול אותי משהו...",
  helper = "אני כאן בשבילכם. אפשר לגרור למעלה לשיחה מלאה",
  context = {},
}: AssistantProps) {
  const resolved = { prompts, placeholder, helper, context };
  return (
    <>
      <ChatSheet {...resolved} />
      <ChatPanel {...resolved} />
    </>
  );
}
