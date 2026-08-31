import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { RestaurantHeader } from "@/features/restaurants/components/RestaurantHeader";
import { getRestaurant } from "@/features/restaurants/data/restaurants";

/**
 * Screen 4 — personalised results.
 *
 * Placeholder so the questionnaire has somewhere to land. The approved design
 * for this screen has not been provided yet, so it is deliberately unstyled
 * beyond the shared shell; the real screen comes in the next stage.
 */
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
    <MobileShell>
      <main className="px-5 pt-[10px]">
        <RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} showBack />
        <section className="mt-[9px] rounded-card bg-cream px-[19px] py-8 text-center shadow-card">
          <p className="text-[19.5px] font-extrabold leading-none text-ink">
            מכינה לכם המלצות…
          </p>
          <p className="mt-3 text-[12.5px] leading-[1.4] text-muted">
            מסך ההמלצות האישיות ייבנה בשלב הבא.
          </p>
          <Link
            href={`/r/${restaurant.id}/table/${tableNumber}`}
            className="tap mt-6 inline-flex h-[35px] items-center justify-center rounded-full bg-gold-gradient px-6 text-[14px] font-bold text-white shadow-gold"
          >
            חזרה לעמוד המסעדה
          </Link>
        </section>
      </main>
    </MobileShell>
  );
}
