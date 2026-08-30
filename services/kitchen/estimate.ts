import { getDish } from "@/features/restaurants/data/restaurants";
import type { OrderItem, OrderStatus } from "@/types";

/**
 * Mock waiting-time estimate.
 *
 * The real version will factor in kitchen load, active orders, historical
 * preparation times and the POS. For now the slowest dish plus a small
 * per-item allowance is close enough to feel honest.
 */
export function estimateMinutes(items: OrderItem[], restaurantId: string): number {
  if (items.length === 0) return 0;

  const prepTimes = items.map((item) => getDish(restaurantId, item.dishId)?.prepMinutes ?? 10);
  const slowest = Math.max(...prepTimes);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return slowest + Math.ceil(totalQuantity / 2);
}

/** e.g. "כ-18 דקות" */
export function formatEstimate(minutes: number): string {
  return `כ-${minutes} דקות`;
}

/** The status pipeline shown on the tracking screen, in order. */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "almost-ready",
  "on-the-way",
  "served",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "בהכנה אצלכם",
  received: "התקבלה",
  preparing: "בהכנה",
  "almost-ready": "כמעט מוכנה",
  "on-the-way": "בדרך לשולחן",
  served: "הוגש",
  paid: "שולם",
};

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(current);
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[index + 1];
}
