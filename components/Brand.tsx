import type { SVGProps } from "react";

/**
 * The Nikol mark: a gold arch enclosing a wheat sprig. Used on its own above
 * the wordmark on discovery, and above the restaurant name inside a venue.
 */
export function NikolMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 74V31a25 25 0 0 1 50 0v43"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 66V20" />
        <path d="M32 58.5c0-7 4.9-11.9 11.9-11.9 0 7-4.9 11.9-11.9 11.9Z" />
        <path d="M32 58.5c0-7-4.9-11.9-11.9-11.9 0 7 4.9 11.9 11.9 11.9Z" />
        <path d="M32 45c0-7 4.9-11.9 11.9-11.9 0 7-4.9 11.9-11.9 11.9Z" />
        <path d="M32 45c0-7-4.9-11.9-11.9-11.9 0 7 4.9 11.9 11.9 11.9Z" />
        <path d="M32 31.5c0-6.2 4.3-10.5 10.5-10.5 0 6.2-4.3 10.5-10.5 10.5Z" />
        <path d="M32 31.5c0-6.2-4.3-10.5-10.5-10.5 0 6.2 4.3 10.5 10.5 10.5Z" />
      </g>
      {/* ground line under the sprig, level with the foot of the arch */}
      <path d="M19 71h26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The folded-map vignette on the detected-restaurant card: a soft blob, a
 * light paper map and a solid gold pin.
 */
export function MapVignette({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 150 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <ellipse cx="72" cy="52" rx="46" ry="42" fill="#F1EAE1" opacity="0.55" />
      <g stroke="#D9C4A6" strokeWidth="2" strokeLinejoin="round" fill="#FDFBF8">
        <path d="M14 66 48 54v46L14 112V66Z" />
        <path d="m48 54 34 12v46L48 100V54Z" />
        <path d="M82 66l34-12v46l-34 12V66Z" />
      </g>
      <path
        d="M40 76c14-6 26-4 38 2s22 6 34 0"
        stroke="#E4D3BB"
        strokeWidth="2"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      <ellipse cx="70" cy="62" rx="17" ry="7" fill="#E9DCC9" opacity="0.75" />
      <path
        d="M70 8c-9.4 0-17 7.6-17 17 0 12.4 15.2 31.9 15.8 32.7a1.5 1.5 0 0 0 2.4 0C71.8 56.9 87 37.4 87 25c0-9.4-7.6-17-17-17Z"
        fill="#B8935A"
      />
      <circle cx="70" cy="24.5" r="6.6" fill="#FBF8F5" />
    </svg>
  );
}

/**
 * The line-art waitress that sits beside Nikol's free-text prompt on the
 * "תמליצי לי" screen.
 */
export function WaitressSketch({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="#C29A5E"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* hair back + ponytail */}
        <path d="M27 44c-5 8-7 20-6 32 .5 6 2 10 4 13" />
        <path d="M69 44c3 6 4 13 4 20" />
        {/* head */}
        <path d="M30 34a18 17 0 0 1 36 0v9a18 17 0 0 1-36 0v-9Z" />
        {/* fringe */}
        <path d="M29 33c3-11 10-16 19-16s16 5 19 16c-4-4-9-6-13-4-4 2-6 5-11 5s-9-2-14-1Z" />
        {/* ears */}
        <path d="M29 41c-2.6-.6-4 .8-3.6 2.9.4 2 2 3 3.9 2.7" />
        <path d="M67 41c2.6-.6 4 .8 3.6 2.9-.4 2-2 3-3.9 2.7" />
        {/* face */}
        <circle cx="40.5" cy="41" r="1.9" fill="#C29A5E" stroke="none" />
        <circle cx="55.5" cy="41" r="1.9" fill="#C29A5E" stroke="none" />
        <path d="M43.5 49.5c1.6 1.7 3 2.4 4.5 2.4s2.9-.7 4.5-2.4" />
        {/* neck + shoulders */}
        <path d="M42 59v5c0 2-1.2 3.2-4 4.2l-12 4.4C20 74.8 16 80 15 88l-2 32" />
        <path d="M54 59v5c0 2 1.2 3.2 4 4.2l12 4.4c6 2.2 10 7.4 11 15.4l2 29" />
        {/* apron */}
        <path d="M38 70c0 4 4.4 6.4 10 6.4S58 74 58 70" />
        <path d="M33 84c0-4.6 5.6-7.4 15-7.4S63 79.4 63 84v36H33V84Z" />
        <path d="M40 96h16" />
        {/* apron sprig */}
        <path d="M48 104v8" />
        <path d="M48 108c0-2.6 1.8-4.4 4.4-4.4 0 2.6-1.8 4.4-4.4 4.4Z" />
        <path d="M48 108c0-2.6-1.8-4.4-4.4-4.4 0 2.6 1.8 4.4 4.4 4.4Z" />
      </g>
    </svg>
  );
}
