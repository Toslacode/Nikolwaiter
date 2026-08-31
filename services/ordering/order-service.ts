import { getDish } from "@/features/restaurants/data/restaurants";
import type { Dish, OrderItem, SplitMode, TableSession } from "@/types";
import { SHARED_DINER_ID } from "@/types";

export function priceWithModifiers(
  dish: Dish,
  selectedModifiers: Record<string, string[]>,
): number {
  const extras = Object.entries(selectedModifiers).reduce((sum, [groupId, optionIds]) => {
    const group = dish.modifierGroups.find((g) => g.id === groupId);
    if (!group) return sum;
    return (
      sum +
      optionIds.reduce((groupSum, optionId) => {
        const option = group.options.find((o) => o.id === optionId);
        return groupSum + (option?.extraPrice ?? 0);
      }, 0)
    );
  }, 0);

  return dish.price + extras;
}

/**
 * Unique across reloads, because order items are persisted — a counter that
 * restarts at 1 would collide with items already in the stored session.
 */
function itemId(): string {
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createOrderItem(
  dish: Dish,
  options: {
    dinerId?: string;
    quantity?: number;
    selectedModifiers?: Record<string, string[]>;
    noteToKitchen?: string;
  } = {},
): OrderItem {
  const {
    dinerId = SHARED_DINER_ID,
    quantity = 1,
    selectedModifiers = {},
    noteToKitchen,
  } = options;

  return {
    id: itemId(),
    dishId: dish.id,
    dinerId,
    quantity,
    selectedModifiers,
    noteToKitchen,
    lineTotal: priceWithModifiers(dish, selectedModifiers) * quantity,
  };
}

export function orderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

export function itemsByDiner(session: TableSession): Map<string, OrderItem[]> {
  const grouped = new Map<string, OrderItem[]>();
  for (const item of session.items) {
    const existing = grouped.get(item.dinerId) ?? [];
    existing.push(item);
    grouped.set(item.dinerId, existing);
  }
  return grouped;
}

const HEBREW_NUMBERS = ["", "אחד", "שניים", "שלושה", "ארבעה", "חמישה", "שישה", "שבעה", "שמונה"];

function hebrewCount(n: number): string {
  return HEBREW_NUMBERS[n] ?? String(n);
}

/**
 * Nikol's sanity check before the order goes to the kitchen — e.g. four diners
 * but only three mains. Returns null when nothing looks off.
 */
export function preOrderCheck(session: TableSession, restaurantId: string): string | null {
  const realDiners = session.diners.filter((d) => d.id !== SHARED_DINER_ID);
  const dinerCount = realDiners.length;
  if (dinerCount === 0 || session.items.length === 0) return null;

  const mainCategories = new Set(["mains", "pasta", "fish", "meat", "vegetarian"]);
  const mainCount = session.items.reduce((count, item) => {
    const dish = getDish(restaurantId, item.dishId);
    return dish && mainCategories.has(dish.categoryId) ? count + item.quantity : count;
  }, 0);

  if (mainCount < dinerCount) {
    return `שמתי לב שיש ${hebrewCount(dinerCount)} סועדים ורק ${hebrewCount(mainCount)} מנות עיקריות. הכל נכון?`;
  }

  return null;
}

export interface BillShare {
  dinerId: string;
  label: string;
  amount: number;
}

/** Splits the table's total according to the chosen mode. */
export function splitBill(session: TableSession, mode: SplitMode): BillShare[] {
  const total = orderTotal(session.items);
  const realDiners = session.diners.filter((d) => d.id !== SHARED_DINER_ID);

  if (mode === "together" || realDiners.length === 0) {
    return [{ dinerId: "table", label: "חשבון לכל השולחן", amount: total }];
  }

  if (mode === "equal") {
    const each = Math.round((total / realDiners.length) * 100) / 100;
    return realDiners.map((diner) => ({
      dinerId: diner.id,
      label: diner.name,
      amount: each,
    }));
  }

  if (mode === "per-person") {
    const grouped = itemsByDiner(session);
    const sharedTotal = orderTotal(grouped.get(SHARED_DINER_ID) ?? []);
    const sharedEach = realDiners.length ? sharedTotal / realDiners.length : 0;

    return realDiners.map((diner) => ({
      dinerId: diner.id,
      label: diner.name,
      amount: Math.round((orderTotal(grouped.get(diner.id) ?? []) + sharedEach) * 100) / 100,
    }));
  }

  // Manual: the UI assigns amounts, so start everyone at zero.
  return realDiners.map((diner) => ({
    dinerId: diner.id,
    label: diner.name,
    amount: 0,
  }));
}
