import { notFound } from "next/navigation";
import { SessionProvider } from "@/features/session/SessionProvider";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/**
 * Everything under a table URL shares one session. Validating here means the
 * screens below can assume a real restaurant and a real table number.
 */
export default async function TableLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ restaurantId: string; tableId: string }>;
}) {
  const { restaurantId, tableId } = await params;
  const tableNumber = Number(tableId);

  if (!getRestaurant(restaurantId) || !Number.isInteger(tableNumber) || tableNumber <= 0) {
    notFound();
  }

  return (
    <SessionProvider restaurantId={restaurantId} tableNumber={tableNumber}>
      {children}
    </SessionProvider>
  );
}
