import Image from "next/image";
import Link from "next/link";
import { Star } from "@/components/Icons";
import type { Dish } from "@/types";

/** "המומלצים שלנו היום" — the featured dish carousel on the restaurant home. */
export function FeaturedDish({
  dish,
  href,
  slides = 3,
  activeSlide = 0,
}: {
  dish: Dish;
  href: string;
  slides?: number;
  activeSlide?: number;
}) {
  return (
    <section className="mt-[7px]">
      <h2 className="flex items-center justify-start gap-2 text-[13px] font-extrabold leading-none text-ink">
        <Star className="size-[14px] text-gold" />
        המומלצים שלנו היום
      </h2>

      <Link
        href={href}
        className="tap mt-[6px] flex h-[97px] items-stretch overflow-hidden rounded-[20px] bg-surface shadow-card"
      >
        <div className="flex min-w-0 flex-1 flex-col pe-[36px] ps-[10px] pt-[7px] pb-[9px] text-right">
          <p className="truncate text-[16px] font-extrabold leading-none text-ink">{dish.name}</p>
          <p className="mt-[10px] text-[11.5px] leading-[1.5] text-muted">{dish.description}</p>
          <p className="mt-auto text-[17px] font-extrabold leading-none text-gold">
            ₪{dish.price}
          </p>
        </div>
        <div className="relative w-[176px] shrink-0 overflow-hidden rounded-[16px]">
          <Image src={dish.image} alt="" fill sizes="176px" className="object-cover" priority />
        </div>
      </Link>

      <div className="mt-[10px] flex items-center justify-center gap-[7px]">
        {Array.from({ length: slides }).map((_, i) => (
          <span
            key={i}
            className={`size-[5px] rounded-full ${i === activeSlide ? "bg-gold" : "bg-[#E3DCD2]"}`}
          />
        ))}
      </div>
    </section>
  );
}
