"use client";

import { useState } from "react";
import { Mic, Send, Sparkle } from "@/components/Icons";

export interface QuickPrompt {
  id: string;
  label: string;
  icon: string;
}

/**
 * The always-available waitress chat. Collapsed it shows the title, helper
 * line, quick prompts and the composer, exactly as in the references; it can
 * be dragged or tapped up into a full conversation.
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
  const [expanded, setExpanded] = useState(false);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
  };

  return (
    <section
      className="rounded-t-[28px] bg-cream px-4 pb-4 pt-[9px] shadow-sheet"
      aria-label="צ׳אט עם המלצרית"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mx-auto block h-[4px] w-[38px] rounded-full bg-[#DCD6CE]"
        aria-label={expanded ? "סגירת השיחה" : "פתיחת שיחה מלאה"}
      />

      <h2 className="mt-[13px] flex items-center justify-center gap-1.5 text-[15px] font-extrabold leading-none text-ink">
        <Sparkle className="size-[13px] text-gold" />
        צ׳אט עם המלצרית
      </h2>
      {helper && (
        <p className="mt-[8px] text-center text-[11.5px] leading-none text-muted">{helper}</p>
      )}

      {expanded && (
        <div className="mt-3 max-h-[220px] overflow-y-auto rounded-[18px] bg-surface p-3 text-right text-[12px] leading-relaxed text-ink-soft shadow-row">
          <p className="font-bold">היי, אני ניקול 👋</p>
          <p className="mt-1 text-muted">
            ספרו לי מה בא לכם — משהו קל, ארוחה מלאה או מנות לחלוקה — ואמצא לכם התאמה.
          </p>
        </div>
      )}

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
