"use client";

import Link from "next/link";
import { useState } from "react";
import { DishImage, hasPhoto } from "@/components/DishImage";
import { Check, Plus } from "@/components/Icons";
import { useSession } from "@/features/session/SessionProvider";
import type { Dish } from "@/types";

/**
 * A dish as Nikol hands it over inside the conversation.
 *
 * With a photograph it leads with the food; without one it stays a compact
 * text-led glass card rather than reserving space for a picture that does not
 * exist. Either way it is small enough to sit in a message thread.
 */
export function ConversationDishCard({
  dish,
  href,
  reason,
}: {
  dish: Dish;
  href: string;
  /** Nikol's one line on why this dish, when she has one. */
  reason?: string;
}) {
  const { addDish } = useSession();
  const [added, setAdded] = useState(false);

  const photo = hasPhoto(dish.image);

  return (
    <article className="glass-chip overflow-hidden rounded-[18px] p-0">
      <div className="flex items-stretch">
        {photo && (
          <div className="relative w-[92px] shrink-0 overflow-hidden">
            <DishImage src={dish.image} sizes="92px" className="object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1 p-3 text-right">
          <div className="flex items-baseline gap-2">
            <p className="min-w-0 flex-1 truncate text-[14px] font-extrabold leading-none text-ink">
              {dish.name}
            </p>
            <p className="shrink-0 text-[14px] font-extrabold leading-none text-gold">
              ₪{dish.price}
            </p>
          </div>

          <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-[1.45] text-muted">
            {reason ?? dish.description}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (added) return;
                addDish(dish);
                setAdded(true);
              }}
              aria-label={added ? `${dish.name} נוסף להזמנה` : `להוסיף ${dish.name} להזמנה`}
              className={`tap flex h-[30px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold ${
                added
                  ? "bg-gold-tint text-gold-deep"
                  : "bg-gold-gradient text-white shadow-gold"
              }`}
            >
              {added ? <Check className="size-[12px]" /> : <Plus className="size-[12px]" />}
              {added ? "נוסף" : "להוסיף"}
            </button>

            <Link
              href={href}
              className="tap rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-white/50"
            >
              לפרטים
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
