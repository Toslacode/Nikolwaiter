import { getDish } from "@/features/restaurants/data/restaurants";
import { createOrderItem } from "@/services/ordering/order-service";
import type { Diner, TableSession } from "@/types";
import { SHARED_DINER_ID } from "@/types";

export const demoDiners: Diner[] = [
  { id: "eilon", name: "אילון" },
  { id: "nikol", name: "ניקול" },
];

export const SHARED_LABEL = "לחלוקה";

/**
 * Seeds the demo table so the shared-order screen has something to show.
 * Totals ₪268, matching the walkthrough in the brief.
 */
export function createDemoSession(restaurantId: string, tableNumber: number): TableSession {
  const dish = (id: string) => {
    const found = getDish(restaurantId, id);
    if (!found) throw new Error(`Unknown dish in demo session: ${id}`);
    return found;
  };

  const items = [
    createOrderItem(dish("hamburger"), {
      dinerId: "eilon",
      selectedModifiers: {
        doneness: ["medium"],
        "hamburger-extras": ["cheese", "caramelized-onion"],
      },
    }),
    createOrderItem(dish("cola"), { dinerId: "eilon" }),
    createOrderItem(dish("lemon-pasta"), { dinerId: "nikol" }),
    createOrderItem(dish("carpaccio"), { dinerId: SHARED_DINER_ID }),
    createOrderItem(dish("spiced-fries"), { dinerId: SHARED_DINER_ID }),
  ];

  return {
    restaurantId,
    branchId: "loama-tlv",
    tableNumber,
    diners: demoDiners,
    items,
    status: "draft",
    profile: { restrictions: [], allergies: [] },
  };
}

/** An empty session, used when a diner arrives without the demo seed. */
export function createEmptySession(restaurantId: string, tableNumber: number): TableSession {
  return {
    restaurantId,
    branchId: "loama-tlv",
    tableNumber,
    diners: demoDiners,
    items: [],
    status: "draft",
    profile: { restrictions: [], allergies: [] },
  };
}
