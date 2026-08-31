import type { SVGProps } from "react";

/**
 * Nikol herself.
 *
 * A single-weight line portrait — bob, collar, apron tie — held in a warm
 * champagne medallion. Drawn rather than illustrated: no facial shading, no
 * cartoon proportions, no sticker outline, so it reads as a brand mark at
 * 22px in a chat bubble and still holds up at 76px above the conversation.
 */
export function NikolFace({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 72 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* top knot */}
        <circle cx="36" cy="7.5" r="4.6" />
        {/* hair, swept back into the knot */}
        <path d="M22.5 25c0-8.6 6-14.6 13.5-14.6S49.5 16.4 49.5 25" />
        {/* face */}
        <path d="M24.5 24.5v6.2a11.5 11.5 0 0 0 23 0v-6.2" />
        {/* ears */}
        <path d="M24.5 28.5c-2.2-.6-3.6.6-3.2 2.5.4 1.8 1.8 2.7 3.4 2.4" />
        <path d="M47.5 28.5c2.2-.6 3.6.6 3.2 2.5-.4 1.8-1.8 2.7-3.4 2.4" />
        {/* neck and shoulders */}
        <path d="M30 41.5v3.4c0 1.6-1 2.5-3 3.2l-8 2.8C14 52.7 11 57 10.5 64L9 78" />
        <path d="M42 41.5v3.4c0 1.6 1 2.5 3 3.2l8 2.8C57.6 52.7 60.6 57 61 64L62.5 78" />
        {/* apron: bib, straps, and the wheat sprig that ties her to the mark */}
        <path d="M27 49.5c0 3.6 4 5.4 9 5.4s9-1.8 9-5.4" />
        <path d="M24 62c0-4.4 5-7 12-7s12 2.6 12 7v16H24V62Z" />
        <path d="M36 65v7" />
        <path d="M36 69.5c0-2.4 1.7-4.1 4.1-4.1 0 2.4-1.7 4.1-4.1 4.1Z" />
        <path d="M36 69.5c0-2.4-1.7-4.1-4.1-4.1 0 2.4 1.7 4.1 4.1 4.1Z" />
      </g>
      {/* eyes and smile stay marks, not features */}
      <circle cx="31.5" cy="29.5" r="1.6" fill="currentColor" />
      <circle cx="40.5" cy="29.5" r="1.6" fill="currentColor" />
      <path
        d="M33 34.2c1.7 1.5 4.3 1.5 6 0"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const SIZES = {
  xs: { box: "size-[28px]", face: "size-[21px]", ring: "0px" },
  sm: { box: "size-[34px]", face: "size-[26px]", ring: "1px" },
  md: { box: "size-[62px]", face: "size-[48px]", ring: "0px" },
  lg: { box: "size-[86px]", face: "size-[66px]", ring: "1px" },
} as const;

/**
 * The avatar as it appears throughout the product: in the panel header, next
 * to Nikol's messages, and anywhere she needs to be recognisably present.
 */
export function NikolAvatar({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={`relative flex ${s.box} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(120%_120%_at_35%_20%,#fffdfa_0%,#f8f1e6_60%,#f2e7d6_100%)] text-gold ${className}`}
      style={{ boxShadow: `0 0 0 ${s.ring} rgba(184,147,90,0.18)` }}
    >
      <NikolFace className={s.face} />
    </span>
  );
}
