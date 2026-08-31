import { notFound } from "next/navigation";
import { NikolConversation } from "@/features/ai-waiter/components/NikolConversation";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/**
 * Kept so existing links and QR codes still land somewhere sensible: it is
 * the same conversation, opened with the recommendation branch already
 * running rather than as a separate questionnaire screen.
 */
export default async function RecommendPage({
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
    <NikolConversation
      restaurant={restaurant}
      tableNumber={tableNumber}
      startWith="recommend"
    />
  );
}
