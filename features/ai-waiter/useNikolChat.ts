"use client";

import { useCallback, useState } from "react";
import { useSession } from "@/features/session/SessionProvider";
import { nikolAI } from "@/services/ai";
import type { ChatMessage } from "@/types";

/** What Nikol can see from where the diner currently is. */
export interface ChatContext {
  /** Set on a dish screen, so "is this spicy?" resolves without naming the dish. */
  dishId?: string;
}

let messageCounter = 0;
function messageId(role: string): string {
  messageCounter += 1;
  return `${role}-${Date.now().toString(36)}-${messageCounter}`;
}

/**
 * The conversation, wired to the session so the mobile sheet and the desktop
 * panel are two views of one thread rather than two chats.
 */
export function useNikolChat(context: ChatContext = {}) {
  const { session, dispatch } = useSession();
  const [pending, setPending] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      const diner: ChatMessage = {
        id: messageId("diner"),
        role: "diner",
        text: trimmed,
        createdAt: Date.now(),
      };
      dispatch({ type: "addChatMessage", message: diner });
      setPending(true);

      try {
        const reply = await nikolAI.ask(trimmed, session.restaurantId, context.dishId);
        dispatch({ type: "addChatMessage", message: { ...reply, id: messageId("nikol") } });
      } catch {
        // Never surface a raw failure — Nikol stays in character and offers
        // the one thing that always works in a restaurant.
        dispatch({
          type: "addChatMessage",
          message: {
            id: messageId("nikol"),
            role: "nikol",
            text: "משהו אצלי נתקע לרגע 🙈 אפשר לנסות שוב, או שאקרא לאיש צוות?",
            createdAt: Date.now(),
          },
        });
      } finally {
        setPending(false);
      }
    },
    [context.dishId, dispatch, pending, session.restaurantId],
  );

  return { messages: session.chat, pending, send };
}
