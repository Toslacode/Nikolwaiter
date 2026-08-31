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
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* hair: one continuous bob, tucked behind the shoulders */}
        <path d="M18 30c0-9 6.3-15 14-15s14 6 14 15v6c0 2.2-1.3 3.6-3 4" />
        <path d="M21 40c-1.7-.4-3-1.8-3-4v-6" />
        {/* fringe */}
        <path d="M19.5 28c2.2-6.4 6.6-9.5 12.5-9.5S42.3 21.6 44.5 28c-2.6-2.4-5.6-3.5-8.2-2.3-2.4 1.1-3.7 2.9-6.3 2.9-2.9 0-5.6-1.1-8.4-.6" />
        {/* face */}
        <path d="M22.5 29.5v5.5a9.5 9.5 0 0 0 19 0v-5.5" />
        {/* shoulders and collar */}
        <path d="M25.5 42.5 20 45c-3.4 1.6-5.5 4.6-6 9" />
        <path d="M38.5 42.5 44 45c3.4 1.6 5.5 4.6 6 9" />
        <path d="M27 43.5 32 49l5-5.5" />
        {/* apron neckline, the one waitress cue */}
        <path d="M26 47.5c0 6 12 6 12 0" />
      </g>
      {/* eyes and smile carry the warmth; kept as marks, not features */}
      <circle cx="28" cy="34" r="1.5" fill="currentColor" />
      <circle cx="36" cy="34" r="1.5" fill="currentColor" />
      <path
        d="M29.5 38.2c1.5 1.3 3.5 1.3 5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const SIZES = {
  xs: { box: "size-[26px]", face: "size-[20px]", ring: "1px" },
  sm: { box: "size-[32px]", face: "size-[25px]", ring: "1px" },
  md: { box: "size-[44px]", face: "size-[34px]", ring: "1.5px" },
  lg: { box: "size-[76px]", face: "size-[58px]", ring: "1.5px" },
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
      className={`relative flex ${s.box} shrink-0 items-center justify-center rounded-full bg-[radial-gradient(120%_120%_at_30%_15%,#fffdfa_0%,#f7ecdb_55%,#f0e0c8_100%)] text-gold-deep ${className}`}
      style={{ boxShadow: `0 0 0 ${s.ring} rgba(184,147,90,0.22), 0 4px 14px rgba(60,46,28,0.10)` }}
    >
      <NikolFace className={s.face} />
    </span>
  );
}
