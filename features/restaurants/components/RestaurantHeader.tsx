import { NikolMark } from "@/components/Brand";
import type { Restaurant } from "@/types";

/** Venue branding at the top of every in-restaurant screen. */
export function RestaurantHeader({
  restaurant,
  tableNumber,
}: {
  restaurant: Restaurant;
  tableNumber: number;
}) {
  return (
    <header className="flex flex-col items-center">
      <NikolMark className="h-[45px] w-[36px] text-gold" />
      <h1 className="mt-0 font-display text-[22px] leading-none font-normal text-ink">
        {restaurant.name}
      </h1>
      <p className="mt-0 text-[7px] font-semibold tracking-[0.04em] text-gold">
        {restaurant.subtitle}
      </p>
      <p className="mt-[5px] flex items-center gap-2.5 text-[13.5px] text-muted">
        <span className="size-[3px] rounded-full bg-gold" />
        שולחן {tableNumber}
        <span className="size-[3px] rounded-full bg-gold" />
      </p>
    </header>
  );
}
