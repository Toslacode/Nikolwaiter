"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NikolMark } from "@/components/Brand";
import { Basket, ChevronRight } from "@/components/Icons";
import { useSession } from "@/features/session/SessionProvider";
import type { Restaurant } from "@/types";

/**
 * Venue branding at the top of every in-restaurant screen.
 *
 * Mobile keeps the centred stack from the references. Desktop reflows it into
 * a real top bar — brand at the inline start, table and order at the end —
 * because a centred 45px mark stranded above a 1160px page reads as a phone
 * screenshot rather than an application.
 */
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
  const { itemCount, hydrated } = useSession();
  const base = `/r/${restaurant.id}/table/${tableNumber}`;

  return (
    <header className="relative flex flex-col items-center px-5 pt-[10px] lg:flex-row lg:justify-between lg:px-0 lg:pt-0">
      {showBack && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="חזרה"
          className="tap absolute top-[8px] start-[16px] z-20 flex size-[32px] items-center justify-center rounded-full bg-surface/90 text-ink-soft shadow-row backdrop-blur-sm lg:static lg:order-first lg:me-3"
        >
          <ChevronRight className="size-[15px]" />
        </button>
      )}

      <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-3">
        <NikolMark className="h-[45px] w-[36px] text-gold lg:h-[38px] lg:w-[30px]" />
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="font-display text-[22px] leading-none font-normal text-ink lg:text-[24px]">
            {restaurant.name}
          </h1>
          <p className="text-[7px] font-semibold tracking-[0.04em] text-gold lg:mt-[3px] lg:text-[10px]">
            {restaurant.subtitle}
          </p>
        </div>
      </div>

      <p className="mt-[5px] flex items-center gap-2.5 text-[13.5px] text-muted lg:hidden">
        <span className="size-[3px] rounded-full bg-gold" />
        שולחן {tableNumber}
        <span className="size-[3px] rounded-full bg-gold" />
      </p>

      {/* Desktop-only: table identity and the order live in the bar itself. */}
      <div className="hidden items-center gap-3 lg:flex">
        <span className="rounded-full bg-gold-tint px-3.5 py-1.5 text-[12.5px] font-semibold text-gold-deep">
          שולחן {tableNumber}
        </span>
        <Link
          href={`${base}/order`}
          className="tap lift flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink shadow-row"
        >
          <Basket className="size-[15px] text-gold" />
          ההזמנה שלנו
          <span
            key={itemCount}
            className={`flex size-[19px] items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white ${
              hydrated && itemCount > 0 ? "pop-once" : ""
            }`}
          >
            {itemCount}
          </span>
        </Link>
      </div>
    </header>
  );
}
