import { notFound } from "next/navigation";
import { NikolConversation } from "@/features/ai-waiter/components/NikolConversation";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/**
 * The main restaurant experience, and the QR entry point.
 *
 * `/r/loama/table/12` opens straight into the conversation — Nikol is already
 * at the table. There is no dashboard in front of her; talking to her is how
 * you reach the menu, the recommendations, preferences and everything else.
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

  return <NikolConversation restaurant={restaurant} tableNumber={tableNumber} />;
}
