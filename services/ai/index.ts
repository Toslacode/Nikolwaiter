import type { NikolAIService } from "@/types";
import { mockNikolAI } from "./mock-nikol-ai";

/**
 * The single place the app resolves its AI implementation.
 * Point this at a real API client when one exists; nothing else changes.
 */
export const nikolAI: NikolAIService = mockNikolAI;

export { parseFreeText } from "./mock-nikol-ai";
