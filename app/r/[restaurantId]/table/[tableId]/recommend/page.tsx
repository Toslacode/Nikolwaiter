import { notFound } from "next/navigation";
import { RecommendConversation } from "@/features/ai-waiter/components/RecommendConversation";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/** Screen 3 — "תמליצי לי", a guided conversation with Nikol. */
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

  return <RecommendConversation restaurant={restaurant} tableNumber={tableNumber} />;
}
