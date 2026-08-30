import type { ServiceRequestType } from "@/types";

export interface ServiceRequestOption {
  id: ServiceRequestType;
  label: string;
}

/** The quick asks a diner can send to the floor staff. */
export const serviceRequestOptions: ServiceRequestOption[] = [
  { id: "water", label: "אפשר מים?" },
  { id: "napkins", label: "אפשר עוד מפיות?" },
  { id: "bread", label: "אפשר עוד לחם?" },
  { id: "waiter", label: "אפשר מלצר?" },
  { id: "drinks", label: "אפשר עוד שתייה?" },
];

export const SERVICE_REQUEST_SENT = "שלחתי לצוות ✓";

/**
 * Stands in for notifying the floor. A real build posts to the POS or the
 * staff app; the UI only needs to know the request was accepted.
 */
export async function sendServiceRequest(
  _type: ServiceRequestType,
  _tableNumber: number,
): Promise<{ ok: true; message: string }> {
  return { ok: true, message: SERVICE_REQUEST_SENT };
}

/** Options offered when Nikol asks "תרצו משהו נוסף?" mid-meal. */
export const anythingElseOptions = [
  { id: "drinks", label: "שתייה" },
  { id: "wine", label: "יין" },
  { id: "side", label: "תוספת" },
  { id: "dessert", label: "קינוח" },
  { id: "waiter", label: "מלצר" },
];

/** The satisfaction check shown shortly after the food is served. */
export const satisfactionOptions = [
  { id: "great", label: "מעולה ❤️" },
  { id: "good", label: "טעים 👍" },
  { id: "issue", label: "משהו לא בדיוק" },
  { id: "waiter", label: "רוצה לדבר עם מלצר" },
];

export const ISSUE_ACKNOWLEDGEMENT = "אנחנו על זה. איש צוות יקבל את הבקשה שלכם.";
