"use client";

import { useEffect, useRef } from "react";
import { Sparkle } from "@/components/Icons";
import type { ChatMessage } from "@/types";

/** The three dots Nikol shows while she is "thinking". */
function Typing() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-[16px] rounded-ss-[4px] bg-surface px-3 py-2.5 shadow-row">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-[5px] animate-bounce rounded-full bg-gold/70"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}

/**
 * The message list. Empty until the diner says something — an unprompted wall
 * of text would bury the quick prompts that actually start a conversation.
 */
export function ChatThread({
  messages,
  pending,
  greeting,
}: {
  messages: ChatMessage[];
  pending: boolean;
  greeting: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length, pending]);

  return (
    <div className="space-y-2.5">
      <div className="flex w-fit max-w-[85%] items-start gap-2 rounded-[16px] rounded-ss-[4px] bg-surface px-3 py-2.5 shadow-row">
        <Sparkle className="mt-[3px] size-[12px] shrink-0 text-gold" />
        <p className="text-[12.5px] leading-[1.55] text-ink-soft">{greeting}</p>
      </div>

      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.role === "diner"
              ? "ms-auto w-fit max-w-[85%] rounded-[16px] rounded-se-[4px] bg-gold-gradient px-3 py-2.5 text-[12.5px] leading-[1.55] text-white shadow-gold"
              : "w-fit max-w-[85%] rounded-[16px] rounded-ss-[4px] bg-surface px-3 py-2.5 text-[12.5px] leading-[1.55] text-ink-soft shadow-row"
          }
        >
          {message.text}
        </div>
      ))}

      {pending && <Typing />}
      <div ref={endRef} />
    </div>
  );
}
