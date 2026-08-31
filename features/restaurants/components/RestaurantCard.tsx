import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Pin, Wheat } from "@/components/Icons";
import type { RestaurantSummary } from "@/types";

/** Small emblem beside each restaurant name, per the reference list. */
const EMBLEM: Record<string, string> = {
  loama: "",
  taizu: "🌸",
  "cafe-noor": "☕",
  ola: "🥑",
};

export function RestaurantCard({
  restaurant,
  href,
  nearest = false,
}: {
  restaurant: RestaurantSummary;
  href: string;
  nearest?: boolean;
}) {
  const emblem = EMBLEM[restaurant.id];

  return (
    <Link
      href={href}
      className="tap lift flex h-[62px] items-center overflow-hidden rounded-[20px] bg-surface shadow-row lg:h-[92px] lg:rounded-[22px]"
    >
      <span className="me-[14px] ms-[11px] flex size-[21px] shrink-0 items-center justify-center rounded-full border border-gold/55 text-gold lg:me-5 lg:ms-4 lg:size-[28px]">
        <ChevronRight className="size-[10px]" />
      </span>

      <span className="min-w-0 flex-1 py-[6px] text-right leading-none">
        <span className="flex items-center justify-start gap-1">
          <span className="truncate text-[15px] font-extrabold text-ink lg:text-[18px]">{restaurant.name}</span>
          {emblem ? (
            <span className="text-[11px] leading-none">{emblem}</span>
          ) : (
            <Wheat className="size-[13px] shrink-0 text-gold" />
          )}
        </span>
        <span className="mt-[6px] block truncate text-[10.5px] text-muted lg:mt-2 lg:text-[13px]">
          {restaurant.cuisine}
        </span>
        <span className="mt-[5px] block truncate text-[10.5px] text-muted lg:mt-1.5 lg:text-[12.5px]">
          {restaurant.address}
        </span>
        <span className="mt-[6px] flex items-center justify-start gap-1 text-[10.5px] text-muted lg:mt-2 lg:text-[12.5px]">
          <span className="size-[3px] rounded-full bg-gold" />
          {restaurant.distanceKm} ק״מ
        </span>
      </span>

      <span className="relative h-full w-[113px] shrink-0 overflow-hidden lg:w-[168px]">
        <Image
          src={restaurant.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 168px, 113px"
          className="object-cover"
          priority={nearest}
        />
        {nearest && (
          <span className="absolute bottom-[5px] left-[5px] flex items-center gap-1 rounded-full bg-surface/95 py-[3px] pe-2 ps-[6px] text-[9px] font-bold text-ink shadow-[0_1px_4px_rgba(60,46,28,0.18)]">
            <Pin className="size-[9px] text-gold" />
            קרוב אליכם
          </span>
        )}
      </span>
    </Link>
  );
}
