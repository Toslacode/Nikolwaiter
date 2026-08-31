import { notFound } from "next/navigation";
import { ComingNextScreen } from "@/features/restaurants/components/ComingNextScreen";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/** Screen 4 — personalised results. Built in phase 2. */
export default async function ResultsPage({
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
    <ComingNextScreen
      restaurant={restaurant}
      tableNumber={tableNumber}
      title="ההמלצות שלי בשבילכם"
      phase={2}
    />
  );
}
