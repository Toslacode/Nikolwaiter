"use client";

import Link from "next/link";
import { RestaurantShell } from "@/components/AppShell";
import { ChevronLeft } from "@/components/Icons";
import { NikolAssistant, type QuickPrompt } from "@/features/ai-waiter/components/NikolAssistant";
import { RestaurantHeader } from "@/features/restaurants/components/RestaurantHeader";
import type { Restaurant } from "@/types";

const PROMPTS: QuickPrompt[] = [
  { id: "best", label: "מה הכי מומלץ?", icon: "⭐" },
  { id: "light", label: "בא לי משהו קל", icon: "🌱" },
];

/**
 * Stands in for a screen that has not been built yet, so links from the
 * finished screens never dead-end on a 404. Each of these is replaced by the
 * real screen as its phase lands.
 */
export function ComingNextScreen({
  restaurant,
  tableNumber,
  title,
  phase,
}: {
  restaurant: Restaurant;
  tableNumber: number;
  title: string;
  /** Which build phase this screen belongs to, so the wait is concrete. */
  phase: number;
}) {
  return (
    <RestaurantShell
      header={
        <RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} showBack />
      }
      assistant={<NikolAssistant prompts={PROMPTS} />}
    >
      <div className="px-5 lg:px-0">
        <section className="mt-[9px] rounded-card bg-cream px-[19px] py-10 text-center shadow-card lg:mt-0 lg:py-16">
          <p className="text-[19.5px] font-extrabold leading-none text-ink lg:text-[26px]">
            {title}
          </p>
          <p className="mt-3 text-[12.5px] leading-[1.5] text-muted lg:text-[14px]">
            המסך הזה נבנה בשלב {phase}.
            <br />
            כרגע מוכנים: בחירת מסעדה, בית המסעדה, תמליצי לי והצ׳אט.
          </p>
          <Link
            href={`/r/${restaurant.id}/table/${tableNumber}`}
            className="tap lift mt-6 inline-flex h-[35px] items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 text-[14px] font-bold text-white shadow-gold lg:h-[46px] lg:px-8 lg:text-[15px]"
          >
            חזרה לעמוד המסעדה
            <ChevronLeft className="size-[12px]" />
          </Link>
        </section>
      </div>
    </RestaurantShell>
  );
}
