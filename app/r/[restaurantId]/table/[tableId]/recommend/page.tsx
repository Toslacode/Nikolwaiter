import { notFound } from "next/navigation";
import { RecommendScreen } from "@/features/ai-waiter/components/RecommendScreen";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/** Screen 3 — "תמליצי לי", the four-question recommendation flow. */
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

  return <RecommendScreen restaurant={restaurant} tableNumber={tableNumber} />;
}
