import { notFound } from "next/navigation";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/**
 * QR entry point (Screen 2 — restaurant home).
 *
 * `/r/loama/table/12` opens Loama at table 12 without going through discovery.
 * The ids are read straight from the URL so they can later map to real
 * restaurant and table records.
 *
 * Placeholder only — awaiting the approved reference screenshot.
 */
export default async function RestaurantTablePage({
  params,
}: {
  params: Promise<{ restaurantId: string; tableId: string }>;
}) {
  const { restaurantId, tableId } = await params;
  const restaurant = getRestaurant(restaurantId);
  const tableNumber = Number(tableId);

  if (!restaurant || !Number.isInteger(tableNumber) || tableNumber <= 0) {
    notFound();
  }

  return (
    <main>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.subtitle}</p>
      <p>שולחן {tableNumber}</p>
      <p>מסך בית המסעדה — ממתין לעיצוב לפי תמונות הייחוס.</p>
    </main>
  );
}
