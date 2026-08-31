import type { SVGProps } from "react";

type Icon = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

const base = (props: SVGProps<SVGSVGElement>) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/** The wheat/branch mark that sits beside the restaurant name. */
export const Wheat: Icon = (props) => (
  <svg {...base(props)} strokeWidth={1.6}>
    <path d="M12 22V8.5" />
    <path d="M12 18.4c0-3 2.1-5.1 5.1-5.1 0 3-2.1 5.1-5.1 5.1Z" />
    <path d="M12 18.4c0-3-2.1-5.1-5.1-5.1 0 3 2.1 5.1 5.1 5.1Z" />
    <path d="M12 12.9c0-3 2.1-5.1 5.1-5.1 0 3-2.1 5.1-5.1 5.1Z" />
    <path d="M12 12.9c0-3-2.1-5.1-5.1-5.1 0 3 2.1 5.1 5.1 5.1Z" />
    <path d="M12 7.6c0-2.7 1.7-4.5 4.4-4.5 0 2.7-1.7 4.5-4.4 4.5Z" />
    <path d="M12 7.6c0-2.7-1.7-4.5-4.4-4.5 0 2.7 1.7 4.5 4.4 4.5Z" />
  </svg>
);

/** Four-point sparkle used for Nikol's own voice. */
export const Sparkle: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 2.5 13.7 9c.2.8.9 1.4 1.7 1.6L22 12l-6.6 1.4c-.8.2-1.5.8-1.7 1.6L12 21.5l-1.7-6.5c-.2-.8-.9-1.4-1.7-1.6L2 12l6.6-1.4c.8-.2 1.5-.8 1.7-1.6L12 2.5Z" />
  </svg>
);

/** Sparkle pair, as used on the "תפתיעי אותי" choice. */
export const Sparkles: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M14 4l1.2 4.3c.15.5.55.9 1.05 1.05L20.5 10.5l-4.25 1.15c-.5.15-.9.55-1.05 1.05L14 17l-1.2-4.3c-.15-.5-.55-.9-1.05-1.05L7.5 10.5l4.25-1.15c.5-.15.9-.55 1.05-1.05L14 4Z" />
    <path d="M6.5 14l.6 2.1c.08.25.28.45.53.53L9.7 17.2l-2.07.57c-.25.08-.45.28-.53.53L6.5 20.4l-.6-2.1a.9.9 0 0 0-.53-.53L3.3 17.2l2.07-.57c.25-.08.45-.28.53-.53L6.5 14Z" />
  </svg>
);

/** Serving cloche for "ארוחה מלאה". */
export const Cloche: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 5.1c-.6 0-1-.5-1-1.05 0-.58.4-1.05 1-1.05s1 .47 1 1.05c0 .58-.4 1.05-1 1.05Z" />
    <path d="M3.2 16.4a8.8 8.8 0 0 1 17.6 0Z" />
    <rect x="2" y="17.6" width="20" height="2.2" rx="1.1" />
  </svg>
);

/** Two figures for "מנות לחלוקה". */
export const People: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <circle cx="9" cy="8" r="3.1" />
    <path d="M2.8 18.4c0-3 2.8-4.9 6.2-4.9s6.2 1.9 6.2 4.9c0 .6-.5 1.1-1.1 1.1H3.9c-.6 0-1.1-.5-1.1-1.1Z" />
    <circle cx="17" cy="8.6" r="2.6" />
    <path d="M16.2 13.6c3 .1 5 1.9 5 4.6 0 .7-.5 1.3-1.2 1.3h-2.7c.3-.5.4-1 .4-1.6 0-1.8-.6-3.3-1.5-4.3Z" />
  </svg>
);

export const ChevronLeft: Icon = (props) => (
  <svg {...base(props)} strokeWidth={2.2}>
    <path d="M14.5 5 8 12l6.5 7" />
  </svg>
);

export const ChevronRight: Icon = (props) => (
  <svg {...base(props)} strokeWidth={2.2}>
    <path d="M9.5 5 16 12l-6.5 7" />
  </svg>
);

export const Search: Icon = (props) => (
  <svg {...base(props)} strokeWidth={2}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const Pin: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 2.2c-3.7 0-6.7 3-6.7 6.7 0 4.9 6 12.6 6.2 12.9.1.2.3.2.5.2s.4 0 .5-.2c.3-.3 6.2-8 6.2-12.9 0-3.7-3-6.7-6.7-6.7Zm0 9.4a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
  </svg>
);

export const Mic: Icon = (props) => (
  <svg {...base(props)} strokeWidth={1.9}>
    <rect x="9.2" y="2.6" width="5.6" height="11" rx="2.8" fill="currentColor" stroke="none" />
    <path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0" />
    <path d="M12 17.8v3.6" />
  </svg>
);

/** Paper plane, pointing up-right exactly as in the reference composer. */
export const Send: Icon = (props) => (
  <svg {...base(props)} strokeWidth={1.8}>
    <path d="M20.6 3.4 3.9 9.6c-.7.3-.7 1.3.1 1.5l6.6 1.9 2 6.7c.2.8 1.2.8 1.5.1l6.5-16.4Z" />
    <path d="m10.6 13-.1-.1 10.1-9.5" />
  </svg>
);

export const Basket: Icon = (props) => (
  <svg {...base(props)} strokeWidth={1.7}>
    <path d="M5.2 9.4h13.6l-1.2 9a2 2 0 0 1-2 1.7H8.4a2 2 0 0 1-2-1.7l-1.2-9Z" />
    <path d="M9 9.4 11 4.2M15 9.4 13 4.2" />
    <path d="M10 13v3.4M14 13v3.4" />
  </svg>
);

export const Star: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 3.2l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.2l-5.1 2.6 1-5.6-4.1-4 5.7-.8L12 3.2Z" />
  </svg>
);

export const Heart: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 20.4s-8-4.9-8-10.1A4.6 4.6 0 0 1 12 7.5a4.6 4.6 0 0 1 8 2.8c0 5.2-8 10.1-8 10.1Z" />
  </svg>
);

export const Book: Icon = (props) => (
  <svg {...base(props)} strokeWidth={1.6}>
    <path d="M12 6.4C10.4 5.2 8.3 4.6 5.4 4.6c-.7 0-1.2.5-1.2 1.2v11c0 .7.5 1.2 1.2 1.2 2.9 0 5 .6 6.6 1.8 1.6-1.2 3.7-1.8 6.6-1.8.7 0 1.2-.5 1.2-1.2v-11c0-.7-.5-1.2-1.2-1.2-2.9 0-5 .6-6.6 1.8Z" />
    <path d="M12 6.4v13.4" />
  </svg>
);

export const Fire: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12.6 2.2c.3 2.6-1 3.9-2.3 5.2-1.4 1.4-2.8 2.8-2.5 5.6-1-.6-1.7-1.6-2-2.8-1.2 1.5-1.9 3.3-1.9 5.1 0 4 3.2 6.7 8.1 6.7s8.1-2.9 8.1-7c0-5-3.5-9.2-7.5-12.8Z" />
    <path
      d="M12.2 20c-2 0-3.4-1.2-3.4-3 0-2.1 1.7-3 2.8-4.6.9 1.5 3.9 2.7 3.9 4.8 0 1.7-1.3 2.8-3.3 2.8Z"
      fill="#F6C177"
    />
  </svg>
);

export const Leaf: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12.3 21v-6.1" />
    <path d="M12.3 14.9c0-3.2 2.2-5.5 5.5-5.5 0 3.3-2.3 5.5-5.5 5.5Z" />
    <path d="M12.3 13.4c0-3.2-2.2-5.5-5.5-5.5 0 3.2 2.3 5.5 5.5 5.5Z" />
  </svg>
);

export const Fish: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M3 12c2.4-3.4 5.6-5.1 9.6-5.1 3 0 5.6 1 7.7 2.9-.7.8-1.1 1.5-1.1 2.2s.4 1.4 1.1 2.2c-2.1 1.9-4.7 2.9-7.7 2.9-4 0-7.2-1.7-9.6-5.1Z" />
    <circle cx="8.4" cy="10.9" r="0.95" fill="#FBF8F5" />
  </svg>
);

export const Meat: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M4.6 12.3c0-3.5 3.4-5.9 7.9-5.9s7.2 2 7.2 4.7c0 2.4-2.2 3.7-5 3.7-1.8 0-2.7.6-2.7 1.6 0 .8-.8 1.4-2.1 1.4-3 0-5.3-2.2-5.3-5.5Z" />
    <path
      d="M6.6 15.5c1 1.4 2.7 2.3 4.6 2.3-1.4 0-2.2.6-2.2 1.4-1.2-.5-2.1-1.9-2.4-3.7Z"
      fill="#E7C9A6"
    />
  </svg>
);

/** Service bell — calling a waiter. */
export const Bell: Icon = (props) => (
  <svg {...base(props)} strokeWidth={1.7}>
    <path d="M4.2 17.4h15.6a7.8 7.8 0 0 0-15.6 0Z" fill="currentColor" stroke="none" />
    <path d="M3 19.6h18" />
    <path d="M12 9.6V7.4" />
    <circle cx="12" cy="5.6" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/** The diner, beside their own messages. */
export const Person: Icon = (props) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <circle cx="12" cy="8.2" r="3.6" />
    <path d="M4.8 19.4c0-3.6 3.4-5.9 7.2-5.9s7.2 2.3 7.2 5.9c0 .7-.6 1.2-1.3 1.2H6.1c-.7 0-1.3-.5-1.3-1.2Z" />
  </svg>
);

/** Padlock for the privacy note under the conversation. */
export const Lock: Icon = (props) => (
  <svg {...base(props)} strokeWidth={1.8}>
    <rect x="5.2" y="10.4" width="13.6" height="9.4" rx="2.4" fill="currentColor" stroke="none" />
    <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
  </svg>
);

/** Add to order. */
export const Plus: Icon = (props) => (
  <svg {...base(props)} strokeWidth={2.4}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

/** Confirmation that something landed in the order. */
export const Check: Icon = (props) => (
  <svg {...base(props)} strokeWidth={2.6}>
    <path d="m5 12.5 4.6 4.5L19 7.5" />
  </svg>
);
