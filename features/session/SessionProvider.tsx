"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { demoDiners } from "@/features/table/data/table-session";
import { createOrderItem } from "@/services/ordering/order-service";
import { localSessionStore, sessionKey } from "@/services/storage/session-store";
import type {
  ChatMessage,
  Dish,
  MealStage,
  NikolSession,
  OrderItem,
  OrderStatus,
  ServiceRequest,
  SplitMode,
} from "@/types";
import { SHARED_DINER_ID } from "@/types";

function emptySession(restaurantId: string, tableNumber: number): NikolSession {
  return {
    restaurantId,
    branchId: `${restaurantId}-tlv`,
    tableNumber,
    diners: demoDiners,
    activeDinerId: demoDiners[0].id,
    profile: { restrictions: [], allergies: [] },
    recommendationAnswers: {},
    items: [],
    status: "draft",
    serviceRequests: [],
    chat: [],
    stage: "browsing",
    bill: { mode: "together", paidDinerIds: [], paid: false },
    seenNudgeIds: [],
  };
}

type Action =
  | { type: "replace"; session: NikolSession }
  | { type: "addItem"; item: OrderItem }
  | { type: "removeItem"; itemId: string }
  | { type: "setQuantity"; itemId: string; quantity: number; unitPrice: number }
  | { type: "setNote"; itemId: string; note: string }
  | { type: "setActiveDiner"; dinerId: string }
  | { type: "patchProfile"; profile: Partial<NikolSession["profile"]> }
  | { type: "setRecommendationAnswer"; questionId: string; values: string[] }
  | { type: "setStatus"; status: OrderStatus; estimatedMinutes?: number }
  | { type: "setStage"; stage: MealStage }
  | { type: "addServiceRequest"; request: ServiceRequest }
  | { type: "setServiceRequestStatus"; id: string; status: ServiceRequest["status"] }
  | { type: "addChatMessage"; message: ChatMessage }
  | { type: "setBillMode"; mode: SplitMode }
  | { type: "markDinerPaid"; dinerId: string }
  | { type: "setBillPaid" }
  | { type: "markNudgeSeen"; nudgeId: string }
  | { type: "reset" };

function reducer(state: NikolSession, action: Action): NikolSession {
  switch (action.type) {
    case "replace":
      return action.session;

    case "addItem":
      return { ...state, items: [...state.items, action.item] };

    case "removeItem":
      return { ...state, items: state.items.filter((i) => i.id !== action.itemId) };

    case "setQuantity": {
      if (action.quantity < 1) {
        return { ...state, items: state.items.filter((i) => i.id !== action.itemId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId
            ? { ...i, quantity: action.quantity, lineTotal: action.unitPrice * action.quantity }
            : i,
        ),
      };
    }

    case "setNote":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId ? { ...i, noteToKitchen: action.note || undefined } : i,
        ),
      };

    case "setActiveDiner":
      return { ...state, activeDinerId: action.dinerId };

    case "patchProfile":
      return { ...state, profile: { ...state.profile, ...action.profile } };

    case "setRecommendationAnswer":
      return {
        ...state,
        recommendationAnswers: {
          ...state.recommendationAnswers,
          [action.questionId]: action.values,
        },
      };

    case "setStatus":
      return {
        ...state,
        status: action.status,
        estimatedMinutes: action.estimatedMinutes ?? state.estimatedMinutes,
        submittedAt:
          action.status === "received" && !state.submittedAt ? Date.now() : state.submittedAt,
      };

    case "setStage":
      return { ...state, stage: action.stage };

    case "addServiceRequest":
      return { ...state, serviceRequests: [...state.serviceRequests, action.request] };

    case "setServiceRequestStatus":
      return {
        ...state,
        serviceRequests: state.serviceRequests.map((r) =>
          r.id === action.id ? { ...r, status: action.status } : r,
        ),
      };

    case "addChatMessage":
      return { ...state, chat: [...state.chat, action.message] };

    case "setBillMode":
      return { ...state, bill: { ...state.bill, mode: action.mode } };

    case "markDinerPaid":
      return {
        ...state,
        bill: {
          ...state.bill,
          paidDinerIds: state.bill.paidDinerIds.includes(action.dinerId)
            ? state.bill.paidDinerIds
            : [...state.bill.paidDinerIds, action.dinerId],
        },
      };

    case "setBillPaid":
      return { ...state, bill: { ...state.bill, paid: true }, status: "paid", stage: "done" };

    case "markNudgeSeen":
      return state.seenNudgeIds.includes(action.nudgeId)
        ? state
        : { ...state, seenNudgeIds: [...state.seenNudgeIds, action.nudgeId] };

    case "reset":
      return emptySession(state.restaurantId, state.tableNumber);
  }
}

interface SessionContextValue {
  session: NikolSession;
  dispatch: React.Dispatch<Action>;
  /** False until the stored session has been read, so SSR and first paint match. */
  hydrated: boolean;
  itemCount: number;
  /** Adds a dish and returns the created item, so callers can show feedback. */
  addDish: (
    dish: Dish,
    options?: {
      dinerId?: string;
      quantity?: number;
      selectedModifiers?: Record<string, string[]>;
      noteToKitchen?: string;
    },
  ) => OrderItem;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  restaurantId,
  tableNumber,
  children,
}: {
  restaurantId: string;
  tableNumber: number;
  children: React.ReactNode;
}) {
  const [session, dispatch] = useReducer(reducer, undefined, () =>
    emptySession(restaurantId, tableNumber),
  );
  const [hydrated, setHydrated] = useState(false);
  const key = sessionKey(restaurantId, tableNumber);

  // Read the stored session after mount. Doing it during render would make
  // the server and client markup disagree.
  useEffect(() => {
    const stored = localSessionStore.load(key);
    if (stored) dispatch({ type: "replace", session: stored });
    setHydrated(true);
  }, [key]);

  // Don't write back the empty starting session before the stored one has
  // been read, or a refresh would wipe the table's order.
  const canPersist = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    if (!canPersist.current) {
      canPersist.current = true;
      return;
    }
    localSessionStore.save(key, session);
  }, [hydrated, key, session]);

  const addDish = useCallback<SessionContextValue["addDish"]>((dish, options) => {
    const item = createOrderItem(dish, options);
    dispatch({ type: "addItem", item });
    return item;
  }, []);

  const itemCount = useMemo(
    () => session.items.reduce((sum, item) => sum + item.quantity, 0),
    [session.items],
  );

  const value = useMemo(
    () => ({ session, dispatch, hydrated, itemCount, addDish }),
    [session, hydrated, itemCount, addDish],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside a SessionProvider");
  return ctx;
}

/** Convenience for the very common "how many of this dish are in the order". */
export function useDishQuantity(dishId: string): number {
  const { session } = useSession();
  return session.items
    .filter((i) => i.dishId === dishId)
    .reduce((sum, i) => sum + i.quantity, 0);
}

export { SHARED_DINER_ID };
