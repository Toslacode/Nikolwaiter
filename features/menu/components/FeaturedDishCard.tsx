"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DishImage } from "@/components/DishImage";
import { Star } from "@/components/Icons";
import type { Dish } from "@/types";

/**
 * "המומלצים שלנו היום".
 *
 * Mobile is a scroll-snap carousel — the reference shows three dots, and a
 * carousel you can actually swipe is what those dots promise. Desktop drops
 * the paging and shows the same dishes as a grid with bigger photography,
 * because there is room to see all three at once.
 */
export function FeaturedDish({ dishes, base }: { dishes: Dish[]; base: string }) {
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = rail.current;
    if (!el) return;
    // Slides are full-width, so the nearest page is the active one.
    setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  return (
    <section className="mt-[7px] lg:mt-8">
      <h2 className="flex items-center justify-start gap-2 text-[13px] font-extrabold leading-none text-ink lg:text-[17px]">
        <Star className="size-[14px] text-gold lg:size-[17px]" />
        המומלצים שלנו היום
      </h2>

      {/* Mobile carousel */}
      <div
        ref={rail}
        onScroll={onScroll}
        className="no-scrollbar mt-[6px] flex snap-x snap-mandatory overflow-x-auto lg:hidden"
      >
        {dishes.map((dish, i) => (
          <div key={dish.id} className="w-full shrink-0 snap-center pe-0">
            <Link
              href={`${base}/dish/${dish.id}`}
              className="tap flex h-[97px] items-stretch overflow-hidden rounded-[20px] bg-surface shadow-card"
            >
              {/*
                Every line is shrink-0 on purpose. `truncate`/`line-clamp` set
                overflow, which under flexbox drops a child's automatic minimum
                size to zero — in a fixed-height column that lets the browser
                collapse the name to nothing to resolve a few pixels of
                overflow. Clamping the description keeps the card's height
                honest whatever the font metrics turn out to be.
              */}
              <div className="flex min-w-0 flex-1 flex-col pe-[36px] ps-[10px] pt-[7px] pb-[9px] text-right">
                <p className="shrink-0 truncate text-[16px] font-extrabold leading-none text-ink">
                  {dish.name}
                </p>
                <p className="mt-[6px] line-clamp-2 shrink-0 text-[11.5px] leading-[1.5] text-muted">
                  {dish.description}
                </p>
                <p className="mt-auto shrink-0 text-[17px] font-extrabold leading-none text-gold">
                  ₪{dish.price}
                </p>
              </div>
              <div className="relative w-[176px] shrink-0 overflow-hidden rounded-[16px]">
                <DishImage
                  src={dish.image}
                  sizes="176px"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {dishes.length > 1 && (
        <div className="mt-[10px] flex items-center justify-center gap-[7px] lg:hidden">
          {dishes.map((dish, i) => (
            <span
              key={dish.id}
              className={`size-[5px] rounded-full transition-colors duration-200 ${
                i === active ? "bg-gold" : "bg-[#E3DCD2]"
              }`}
            />
          ))}
        </div>
      )}

      {/* Desktop grid */}
      <div className="mt-4 hidden gap-4 lg:grid lg:grid-cols-3">
        {dishes.map((dish, i) => (
          <Link
            key={dish.id}
            href={`${base}/dish/${dish.id}`}
            style={{ "--rise-index": i } as React.CSSProperties}
            className="tap lift rise flex flex-col overflow-hidden rounded-[20px] bg-surface shadow-card"
          >
            <div className="relative h-[168px] w-full overflow-hidden">
              <DishImage
                src={dish.image}
                sizes="(min-width: 1024px) 300px, 100vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4 text-right">
              <p className="text-[16.5px] font-extrabold leading-none text-ink">{dish.name}</p>
              <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.5] text-muted">
                {dish.description}
              </p>
              <p className="mt-3 text-[17px] font-extrabold leading-none text-gold">
                ₪{dish.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
