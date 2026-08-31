"use client";

import { useRouter } from "next/navigation";
import { NikolMark } from "@/components/Brand";
import { ChevronRight } from "@/components/Icons";
import type { Restaurant } from "@/types";

/** Venue branding at the top of every in-restaurant screen. */
export function RestaurantHeader({
  restaurant,
  tableNumber,
  showBack = false,
}: {
  restaurant: Restaurant;
  tableNumber: number;
  /** Screens deeper than the restaurant home get a back affordance. */
  showBack?: boolean;
}) {
  const router = useRouter();

  return (
    <header className="relative flex flex-col items-center">
      {showBack && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="חזרה"
          className="tap absolute -top-[2px] start-[-4px] z-20 flex size-[32px] items-center justify-center rounded-full bg-surface/90 text-ink-soft shadow-row backdrop-blur-sm"
        >
          <ChevronRight className="size-[15px]" />
        </button>
      )}
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
