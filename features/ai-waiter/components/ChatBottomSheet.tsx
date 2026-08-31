"use client";

import { useRef, useState } from "react";
import { Mic, Send, Sparkle } from "@/components/Icons";

export interface QuickPrompt {
  id: string;
  label: string;
  icon: string;
}

/** How far the handle travels between collapsed and fully open. */
const DRAG_RANGE = 200;
/** Past this much of the travel, the release commits to open. */
const COMMIT_AT = 0.35;

/**
 * The always-available waitress chat. Collapsed it shows the title, helper
 * line, quick prompts and the composer, exactly as in the references. The
 * handle is a real drag: the panel tracks the finger 1:1 the whole way and
 * settles with a spring on release, rather than snapping on a tap.
 */
export function ChatBottomSheet({
  prompts,
  placeholder = "אפשר לשאול אותי משהו...",
  helper = "אני כאן בשבילכם. אפשר לגרור למעלה לשיחה מלאה",
  onSend,
}: {
  prompts: QuickPrompt[];
  placeholder?: string;
  /** Null on screens where the reference shows the title alone. */
  helper?: string | null;
  onSend?: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const drag = useRef<{ pointerId: number; startY: number; startProgress: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { pointerId: e.pointerId, startY: e.clientY, startProgress: open ? 1 : 0 };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    // Dragging up opens; track the finger the whole way rather than waiting
    // for the release.
    const delta = d.startY - e.clientY;
    setProgress(Math.min(1, Math.max(0, d.startProgress + delta / DRAG_RANGE)));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    setProgress((current) => {
      const commit = current > COMMIT_AT;
      setOpen(commit);
      return commit ? 1 : 0;
    });
  };

  const toggle = () => {
    setOpen((v) => {
      setProgress(v ? 0 : 1);
      return !v;
    });
  };

  const shown = dragging ? progress : open ? 1 : 0;

  return (
    <section
      aria-label="צ׳אט עם המלצרית"
      className="relative z-10 rounded-t-[28px] bg-cream px-4 pb-4 pt-[9px] shadow-sheet"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={open ? "סגירת השיחה" : "פתיחת שיחה מלאה"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="-mt-1 mb-1 flex cursor-grab touch-none justify-center p-3 active:cursor-grabbing"
      >
        <div
          className="h-[4px] w-[38px] rounded-full bg-[#DCD6CE]"
          style={{
            transform: dragging ? `scaleX(${1 + shown * 0.15})` : undefined,
            transition: dragging ? "none" : "transform 200ms ease",
          }}
        />
      </div>

      <h2 className="flex items-center justify-center gap-1.5 text-[15px] font-extrabold leading-none text-ink">
        <Sparkle className="size-[13px] text-gold" />
        צ׳אט עם המלצרית
      </h2>
      {helper && (
        <p className="mt-[8px] text-center text-[11.5px] leading-none text-muted">{helper}</p>
      )}

      <div
        className="overflow-hidden"
        style={{
          maxHeight: shown * 150,
          opacity: shown,
          transition: dragging
            ? "none"
            : "max-height 420ms cubic-bezier(.34,1.42,.64,1), opacity 300ms ease",
        }}
      >
        <div className="mt-[10px] rounded-[16px] bg-surface p-3 text-right text-[12px] leading-relaxed text-ink-soft shadow-row">
          <p className="font-extrabold">היי, אני ניקול 👋</p>
          <p className="mt-1 text-muted">
            ספרו לי מה בא לכם — משהו קל, ארוחה מלאה או מנות לחלוקה — ואמצא לכם התאמה.
          </p>
        </div>
      </div>

      <div className="no-scrollbar mt-[15px] flex gap-2 overflow-x-auto">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => submit(prompt.label)}
            className="tap flex h-[27px] shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-surface px-3.5 text-[12px] font-medium text-ink-soft"
          >
            <span className="text-[10px] leading-none">{prompt.icon}</span>
            {prompt.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="mt-[13px] flex h-[40px] items-center gap-2 rounded-full bg-surface px-[5px] shadow-row"
      >
        <button
          type="submit"
          aria-label="שליחה"
          className="tap flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gold text-white"
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
          className="tap flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gold text-white"
        >
          <Mic className="size-[14px]" />
        </button>
      </form>
    </section>
  );
}
