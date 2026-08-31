import { notFound } from "next/navigation";
import { ComingNextScreen } from "@/features/restaurants/components/ComingNextScreen";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/** Placeholder until this screen is designed. */
export default async function Page({
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

  return <ComingNextScreen restaurant={restaurant} tableNumber={tableNumber} title="ההזמנה שלנו" />;
}
