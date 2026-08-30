import Link from "next/link";
import { Basket } from "@/components/Icons";

/** The shared table order entry point, shown under the featured dish. */
export function SharedOrderBar({ href, count }: { href: string; count: number }) {
  return (
    <Link
      href={href}
      className="tap mt-[11px] flex h-[41px] items-center justify-center gap-3 rounded-full bg-surface shadow-row"
    >
      <span className="relative flex size-[31px] shrink-0 items-center justify-center rounded-full bg-gold-tint text-ink">
        <Basket className="size-[17px]" />
        <span className="absolute -top-[4px] right-[16px] flex size-[17px] items-center justify-center rounded-full bg-gold text-[9.5px] font-bold text-white">
          {count}
        </span>
      </span>
      <span className="text-right leading-none">
        <span className="block text-[13px] font-extrabold text-ink">ההזמנה שלי</span>
        <span className="mt-[6px] block text-[9.7px] text-muted">סל ההזמנה משותף לשולחן</span>
      </span>
    </Link>
  );
}
