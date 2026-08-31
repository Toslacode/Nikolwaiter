import type { ReactNode } from "react";

/**
 * The page canvas. Mobile is full-bleed — the app *is* the screen. Desktop
 * keeps the same warm ground and centres a readable column in it, rather
 * than parking a 390px phone in the middle of an empty page.
 */
export function AppShell({
  children,
  /** Width of the content column on desktop. Discovery is narrower than a menu grid. */
  width = "narrow",
}: {
  children: ReactNode;
  width?: "narrow" | "wide";
}) {
  const max = width === "narrow" ? "lg:max-w-[560px]" : "lg:max-w-[1120px]";

  return (
    <div className="min-h-dvh bg-ivory">
      <div className={`mx-auto w-full max-w-[430px] ${max} lg:px-8 lg:py-12`}>{children}</div>
    </div>
  );
}

/**
 * The in-restaurant layout. On mobile it is a single scrolling column with
 * the chat docked to the bottom; from `lg` up the assistant moves out into a
 * column of its own and stays visible while the main content scrolls.
 */
export function RestaurantShell({
  children,
  assistant,
  /** Rendered above both columns on desktop, inside the column on mobile. */
  header,
}: {
  children: ReactNode;
  assistant: ReactNode;
  header?: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-ivory">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col lg:max-w-[1160px] lg:px-8 lg:pb-10 lg:pt-8">
        {header}

        <div className="flex flex-1 flex-col lg:mt-6 lg:flex-row lg:items-start lg:gap-8">
          <main className="flex-1 lg:min-w-0">{children}</main>

          {/*
            Two renderings of one conversation: the mobile sheet and the
            desktop panel both read the session's chat, so switching sizes
            never loses the thread.
          */}
          <aside className="lg:sticky lg:top-8 lg:w-[366px] lg:shrink-0">{assistant}</aside>
        </div>
      </div>
    </div>
  );
}
