"use client";

import Link from "next/link";
import { RestaurantShell } from "@/components/AppShell";
import { Heart } from "@/components/Icons";
import { NikolAssistant, type QuickPrompt } from "@/features/ai-waiter/components/NikolAssistant";
import { FeaturedDish } from "@/features/menu/components/FeaturedDishCard";
import { SharedOrderBar } from "@/features/ordering/components/SharedOrderBar";
import { useSession } from "@/features/session/SessionProvider";
import type { Dish, Restaurant } from "@/types";
import { RestaurantHeader } from "./RestaurantHeader";

const HOME_PROMPTS: QuickPrompt[] = [
  { id: "today", label: "מה מומלץ היום?", icon: "✨" },
  { id: "gluten", label: "יש בלי גלוטן?", icon: "🌱" },
  { id: "light", label: "אני רוצה משהו קל", icon: "🤎" },
];

export function RestaurantHomeScreen({
  restaurant,
  tableNumber,
  featured,
}: {
  restaurant: Restaurant;
  tableNumber: number;
  featured: Dish[];
}) {
  const { itemCount } = useSession();
  const base = `/r/${restaurant.id}/table/${tableNumber}`;

  const actions = [
    { id: "recommend", label: "תמליצי לי", icon: "✨", href: `${base}/recommend` },
    { id: "menu", label: "לראות את התפריט", icon: "📖", href: `${base}/menu` },
    { id: "popular", label: "מה הכי פופולרי?", icon: "🔥", href: `${base}/popular` },
    { id: "diet", label: "יש לי העדפות / אלרגיות", icon: "🌱", href: `${base}/preferences` },
  ];

  return (
    <RestaurantShell
      header={<RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} />}
      assistant={<NikolAssistant prompts={HOME_PROMPTS} />}
    >
      <div className="px-5 lg:px-0">
        {/* Greeting + primary actions */}
        <section className="mt-[9px] rounded-card bg-cream px-[11px] pb-[10px] pt-[8px] shadow-card lg:mt-0 lg:px-8 lg:py-9">
          <p className="text-center text-[23px] font-extrabold leading-none text-ink lg:text-[26px]">
            היי <span>👋</span>
          </p>
          <h2 className="mt-[4px] text-center text-[22.5px] font-extrabold leading-[1.12] tracking-[-0.01em] text-ink lg:mt-2 lg:text-[30px]">
            אני המלצרית האישית
            <br />
            שלכם לערב
          </h2>

          <div className="mt-0 flex items-center justify-center gap-2.5 lg:mt-4">
            <span className="h-px w-[62px] bg-hairline" />
            <Heart className="size-[11px] text-gold" />
            <span className="h-px w-[62px] bg-hairline" />
          </div>

          <p className="mt-[3px] text-center text-[12.5px] leading-[1.4] text-muted lg:mt-3 lg:text-[14px]">
            אני יכולה לעזור לכם למצוא בדיוק
            <br />
            מה שמתאים לכם
          </p>

          {/*
            One column on a phone, exactly as in the references; two on
            desktop, where four full-width rows in a 700px column would leave
            the page looking half-empty.
          */}
          <div className="mt-[4px] space-y-1 px-[33px] lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:px-0">
            {actions.map((action, i) => (
              <Link
                key={action.id}
                href={action.href}
                style={{ "--rise-index": i } as React.CSSProperties}
                className="tap lift rise flex h-[37px] items-center justify-start rounded-[14px] bg-surface shadow-row lg:h-[58px] lg:rounded-[18px]"
              >
                <span className="ms-[10px] flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gold-tint text-[15px] leading-none lg:ms-4 lg:size-[38px] lg:text-[18px]">
                  {action.icon}
                </span>
                <span className="ms-[47px] text-[14.3px] font-bold text-ink lg:ms-3 lg:text-[15.5px]">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <FeaturedDish dishes={featured} base={base} />

        {/* The order bar is the mobile entry point; desktop has it in the top bar. */}
        <div className="lg:hidden">
          <SharedOrderBar href={`${base}/order`} count={itemCount} />
        </div>
      </div>
    </RestaurantShell>
  );
}
