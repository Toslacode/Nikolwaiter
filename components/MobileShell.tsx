import type { ReactNode } from "react";

/**
 * The references are iPhone-sized. On phones the app fills the screen; on
 * larger viewports the same layout is centred in a 390px column rather than
 * being restyled into a desktop layout.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F3EEE8] md:py-8">
      <div className="relative mx-auto min-h-dvh w-full max-w-[390px] bg-ivory md:min-h-[820px] md:rounded-[42px] md:shadow-[0_24px_70px_rgba(60,46,28,0.16)]">
        {children}
      </div>
    </div>
  );
}
