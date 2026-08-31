import Link from "next/link";
import { ChevronLeft } from "@/components/Icons";
import { MobileShell } from "@/components/MobileShell";
import { RestaurantHeader } from "@/features/restaurants/components/RestaurantHeader";
import type { Restaurant } from "@/types";

/**
 * Stands in for a screen that has not been designed yet, so links from the
 * finished screens never dead-end on a 404 during review. Each of these is
 * replaced by the real screen as it gets built.
 */
export function ComingNextScreen({
  restaurant,
  tableNumber,
  title,
}: {
  restaurant: Restaurant;
  tableNumber: number;
  title: string;
}) {
  return (
    <MobileShell>
      <main className="px-5 pt-[10px]">
        <RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} showBack />

        <section className="mt-[9px] rounded-card bg-cream px-[19px] py-10 text-center shadow-card">
          <p className="text-[19.5px] font-extrabold leading-none text-ink">{title}</p>
          <p className="mt-3 text-[12.5px] leading-[1.5] text-muted">
            המסך הזה עוד לא נבנה — הוא בתור.
            <br />
            כרגע מוכנים: בחירת מסעדה, בית המסעדה ותמליצי לי.
          </p>
          <Link
            href={`/r/${restaurant.id}/table/${tableNumber}`}
            className="tap mt-6 inline-flex h-[35px] items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 text-[14px] font-bold text-white shadow-gold"
          >
            חזרה לעמוד המסעדה
            <ChevronLeft className="size-[12px]" />
          </Link>
        </section>
      </main>
    </MobileShell>
  );
}
