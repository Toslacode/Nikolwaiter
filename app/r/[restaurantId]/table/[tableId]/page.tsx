import { notFound } from "next/navigation";
import { RestaurantHomeScreen } from "@/features/restaurants/components/RestaurantHomeScreen";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/**
 * Screen 2 — restaurant home, and the QR entry point.
 * `/r/loama/table/12` opens Loama at table 12 without going through discovery.
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

  const featuredId = restaurant.featuredDishIds[0];
  const featured =
    restaurant.dishes.find((d) => d.id === featuredId) ?? restaurant.dishes[0];

  return (
    <RestaurantHomeScreen
      restaurant={restaurant}
      tableNumber={tableNumber}
      featured={featured}
      orderCount={0}
    />
  );
}
