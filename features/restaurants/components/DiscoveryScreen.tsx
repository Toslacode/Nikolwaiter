"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MapVignette, NikolMark } from "@/components/Brand";
import { ChevronLeft, Heart, Search, Sparkle, Wheat } from "@/components/Icons";
import type { RestaurantSummary } from "@/types";
import { RestaurantCard } from "./RestaurantCard";

const DEMO_TABLE = 12;

export function DiscoveryScreen({
  detected,
  nearby,
}: {
  detected: RestaurantSummary;
  nearby: RestaurantSummary[];
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return nearby;
    return nearby.filter(
      (r) => r.name.includes(q) || r.cuisine.includes(q) || r.address.includes(q),
    );
  }, [nearby, query]);

  const href = (id: string) => `/r/${id}/table/${DEMO_TABLE}`;

  return (
    <AppShell width="wide">
      <main className="px-9 pb-7 pt-[10px] lg:px-0 lg:pb-14 lg:pt-0">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
        <div className="lg:sticky lg:top-12">
        {/* Brand */}
        <header className="flex flex-col items-center lg:items-start">
          <NikolMark className="h-[45px] w-[36px] text-gold lg:h-[62px] lg:w-[50px]" />
          <h1 className="mt-0 font-display text-[27px] leading-none font-normal tracking-[-0.01em] text-ink lg:mt-2 lg:text-[40px]">
            Nikol
          </h1>
          <p className="mt-0 flex items-center gap-2 text-[9.5px] font-semibold tracking-[0.05em] text-gold lg:mt-2 lg:text-[12px]">
            <span className="size-[3px] rounded-full bg-gold" />
            המלצרית החכמה שלכם
            <span className="size-[3px] rounded-full bg-gold" />
          </p>
        </header>

        {/* Welcome */}
        <section className="mt-[13px] text-center lg:mt-8 lg:text-right">
          <p className="text-[21px] font-extrabold leading-none text-ink lg:text-[24px]">
            היי <span>👋</span>
          </p>
          <h2 className="mt-[1px] text-[23px] font-extrabold leading-tight tracking-[-0.01em] text-ink lg:mt-2 lg:text-[32px]">
            ברוכים הבאים לניקול
          </h2>
          <p className="mt-[1px] text-[13px] leading-tight text-muted lg:mt-2 lg:text-[15px]">
            בחרו מסעדה כדי שנתחיל
          </p>
        </section>

        {/* Detected restaurant */}
        <section className="mt-4 rounded-card bg-surface p-[9px] shadow-card lg:mt-8 lg:p-5">
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[13px] leading-none text-muted lg:text-[14px]">
                נראה שאתם נמצאים ב
              </p>
              <p className="mt-[7px] flex items-center gap-1.5 lg:mt-2.5">
                <span className="text-[23px] font-extrabold leading-none text-ink lg:text-[28px]">
                  {detected.name}
                </span>
                <Wheat className="size-[19px] shrink-0 text-gold lg:size-[22px]" />
              </p>
              <p className="mt-[7px] text-[12px] leading-none text-muted lg:mt-2.5 lg:text-[13px]">
                {detected.address}
              </p>
            </div>
            <MapVignette className="ml-[14px] h-[48px] w-[66px] shrink-0 lg:h-[66px] lg:w-[92px]" />
          </div>

          <Link
            href={href(detected.id)}
            className="tap lift relative mt-[13px] flex h-[35px] items-center justify-center rounded-full bg-gold-gradient shadow-gold lg:mt-5 lg:h-[48px]"
          >
            <span className="text-[14px] font-bold text-white lg:text-[16px]">
              בחרו במסעדה הזו
            </span>
            <span className="absolute left-[4px] flex size-[27px] items-center justify-center rounded-full bg-white text-gold-deep lg:left-[6px] lg:size-[36px]">
              <ChevronLeft className="size-[12px] lg:size-[15px]" />
            </span>
          </Link>

          <button
            type="button"
            onClick={() => document.getElementById("nikol-search")?.focus()}
            className="tap mt-1 w-full rounded-[18px] bg-surface py-2.5 text-center shadow-row lg:mt-2.5 lg:py-3.5"
          >
            <span className="block text-[11.5px] font-bold leading-none text-gold-deep lg:text-[13px]">
              לא זאת המסעדה?
            </span>
            <span className="mt-[5px] block text-[9.5px] leading-none text-muted lg:text-[11.5px]">
              בחרו מסעדה אחרת
            </span>
          </button>
        </section>

        {/* Search */}
        <div className="mt-3 flex h-[34px] items-center gap-2 rounded-full bg-surface px-4 shadow-row lg:mt-6 lg:h-[48px] lg:px-5">
          <input
            id="nikol-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפשו מסעדה..."
            aria-label="חיפוש מסעדה"
            className="min-w-0 flex-1 bg-transparent text-right text-[12px] text-ink outline-none placeholder:text-muted lg:text-[14px]"
          />
          <Search className="size-[14px] shrink-0 text-ink-soft lg:size-[17px]" />
        </div>

        </div>

        <div>
        {/* Nearby */}
        <h3 className="mt-3 text-right text-[12px] font-extrabold leading-none text-ink lg:mt-0 lg:text-[16px]">
          מסעדות קרובות אליכם
        </h3>

        <div className="mt-2.5 space-y-3 lg:mt-4">
          {results.map((restaurant, i) => (
            <div key={restaurant.id} style={{ "--rise-index": i } as React.CSSProperties} className="rise">
              <RestaurantCard
                restaurant={restaurant}
                href={href(restaurant.id)}
                nearest={!query && i === 0}
              />
            </div>
          ))}

          {results.length === 0 && (
            <div className="rounded-card bg-surface px-6 py-10 text-center shadow-row">
              <Search className="mx-auto size-[22px] text-gold/60" />
              <p className="mt-3 text-[13.5px] font-bold text-ink">
                לא מצאתי מסעדה בשם ״{query.trim()}״
              </p>
              <p className="mt-1.5 text-[12px] leading-[1.5] text-muted">
                אולי נסו שם אחר, או בחרו מהמסעדות שקרובות אליכם.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="tap mt-4 rounded-full bg-gold-tint px-5 py-2 text-[12.5px] font-bold text-gold-deep"
              >
                נקו את החיפוש
              </button>
            </div>
          )}
        </div>

        </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 flex items-center justify-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[11px] font-semibold text-ink-soft shadow-row lg:mt-8 lg:py-3.5 lg:text-[13px]">
          <Heart className="size-[12px] shrink-0 text-gold" />
          ניקול תלווה אתכם בחוויה אישית בכל מסעדה
          <Sparkle className="size-[11px] shrink-0 text-gold" />
        </p>
      </main>
    </AppShell>
  );
}
