"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "@/components/Icons";
import { MobileShell } from "@/components/MobileShell";
import { ChatBottomSheet, type QuickPrompt } from "@/features/ai-waiter/components/ChatBottomSheet";
import { FeaturedDish } from "@/features/menu/components/FeaturedDishCard";
import { SharedOrderBar } from "@/features/ordering/components/SharedOrderBar";
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
  orderCount,
}: {
  restaurant: Restaurant;
  tableNumber: number;
  featured: Dish;
  orderCount: number;
}) {
  const router = useRouter();
  const base = `/r/${restaurant.id}/table/${tableNumber}`;

  const actions = [
    { id: "recommend", label: "תמליצי לי", icon: "✨", href: `${base}/recommend` },
    { id: "menu", label: "לראות את התפריט", icon: "📖", href: `${base}/menu` },
    { id: "popular", label: "מה הכי פופולרי?", icon: "🔥", href: `${base}/popular` },
    { id: "diet", label: "יש לי העדפות / אלרגיות", icon: "🌱", href: `${base}/preferences` },
  ];

  return (
    <MobileShell>
      <div className="flex min-h-dvh flex-col">
        <main className="flex-1 px-5 pt-[10px]">
          <RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} />

          {/* Greeting + primary actions */}
          <section className="mt-[9px] rounded-card bg-cream px-[11px] pb-[10px] pt-[8px] shadow-card">
            <p className="text-center text-[23px] font-extrabold leading-none text-ink">
              היי <span>👋</span>
            </p>
            <h2 className="mt-[4px] text-center text-[22.5px] font-extrabold leading-[1.12] text-ink">
              אני המלצרית האישית
              <br />
              שלכם לערב
            </h2>

            <div className="mt-0 flex items-center justify-center gap-2.5">
              <span className="h-px w-[62px] bg-hairline" />
              <Heart className="size-[11px] text-gold" />
              <span className="h-px w-[62px] bg-hairline" />
            </div>

            <p className="mt-[3px] text-center text-[12.5px] leading-[1.4] text-muted">
              אני יכולה לעזור לכם למצוא בדיוק
              <br />
              מה שמתאים לכם
            </p>

            <div className="mt-[4px] space-y-1 px-[33px]">
              {actions.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="tap flex h-[37px] items-center justify-start rounded-[14px] bg-surface shadow-row"
                >
                  <span className="ms-[10px] flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gold-tint text-[15px] leading-none">
                    {action.icon}
                  </span>
                  <span className="ms-[47px] text-[14.3px] font-bold text-ink">{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <FeaturedDish dish={featured} href={`${base}/dish/${featured.id}`} />

          <SharedOrderBar href={`${base}/order`} count={orderCount} />
        </main>

        <div>
          <ChatBottomSheet
            prompts={HOME_PROMPTS}
            onSend={(text) =>
              router.push(`${base}/recommend?q=${encodeURIComponent(text)}`)
            }
          />
        </div>
      </div>
    </MobileShell>
  );
}
