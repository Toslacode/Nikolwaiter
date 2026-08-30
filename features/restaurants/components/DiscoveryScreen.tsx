"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapVignette, NikolMark } from "@/components/Brand";
import { ChevronLeft, Heart, Search, Sparkle, Wheat } from "@/components/Icons";
import { MobileShell } from "@/components/MobileShell";
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
    return nearby.filter((r) => r.name.includes(q) || r.cuisine.includes(q));
  }, [nearby, query]);

  const href = (id: string) => `/r/${id}/table/${DEMO_TABLE}`;

  return (
    <MobileShell>
      <main className="px-9 pb-7 pt-[10px]">
        {/* Brand */}
        <header className="flex flex-col items-center">
          <NikolMark className="h-[45px] w-[36px] text-gold" />
          <h1 className="mt-0 font-display text-[27px] leading-none font-normal text-ink">
            Nikol
          </h1>
          <p className="mt-0 flex items-center gap-2 text-[9.5px] font-semibold tracking-[0.05em] text-gold">
            <span className="size-[3px] rounded-full bg-gold" />
            המלצרית החכמה שלכם
            <span className="size-[3px] rounded-full bg-gold" />
          </p>
        </header>

        {/* Welcome */}
        <section className="mt-[13px] text-center">
          <p className="text-[21px] font-extrabold leading-none text-ink">
            היי <span>👋</span>
          </p>
          <h2 className="mt-[1px] text-[23px] font-extrabold leading-tight text-ink">
            ברוכים הבאים לניקול
          </h2>
          <p className="mt-[1px] text-[13px] leading-tight text-muted">בחרו מסעדה כדי שנתחיל</p>
        </section>

        {/* Detected restaurant */}
        <section className="mt-4 rounded-card bg-surface p-[9px] shadow-card">
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[13px] leading-none text-muted">נראה שאתם נמצאים ב</p>
              <p className="mt-[7px] flex items-center gap-1.5">
                <span className="text-[23px] font-extrabold leading-none text-ink">
                  {detected.name}
                </span>
                <Wheat className="size-[19px] shrink-0 text-gold" />
              </p>
              <p className="mt-[7px] text-[12px] leading-none text-muted">{detected.address}</p>
            </div>
            <MapVignette className="ml-[14px] h-[48px] w-[66px] shrink-0" />
          </div>

          <Link
            href={href(detected.id)}
            className="tap relative mt-[13px] flex h-[35px] items-center justify-center rounded-full bg-gold-gradient shadow-gold"
          >
            <span className="text-[14px] font-bold text-white">בחרו במסעדה הזו</span>
            <span className="absolute left-[4px] flex size-[27px] items-center justify-center rounded-full bg-white text-gold-deep">
              <ChevronLeft className="size-[12px]" />
            </span>
          </Link>

          <button
            type="button"
            onClick={() => document.getElementById("nikol-search")?.focus()}
            className="tap mt-1 w-full rounded-[18px] bg-surface py-2.5 text-center shadow-row"
          >
            <span className="block text-[11.5px] font-bold leading-none text-gold-deep">
              לא זאת המסעדה?
            </span>
            <span className="mt-[5px] block text-[9.5px] leading-none text-muted">
              בחרו מסעדה אחרת
            </span>
          </button>
        </section>

        {/* Search */}
        <div className="mt-3 flex h-[34px] items-center gap-2 rounded-full bg-surface px-4 shadow-row">
          <input
            id="nikol-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפשו מסעדה..."
            className="min-w-0 flex-1 bg-transparent text-right text-[12px] text-ink outline-none placeholder:text-muted"
          />
          <Search className="size-[14px] shrink-0 text-ink-soft" />
        </div>

        {/* Nearby */}
        <h3 className="mt-3 text-right text-[12px] font-extrabold leading-none text-ink">
          מסעדות קרובות אליכם
        </h3>

        <div className="mt-2.5 space-y-3">
          {results.map((restaurant, i) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              href={href(restaurant.id)}
              nearest={!query && i === 0}
            />
          ))}
          {results.length === 0 && (
            <p className="py-6 text-center text-[12px] text-muted">
              לא מצאתי מסעדה בשם הזה. נסו שוב?
            </p>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-4 flex items-center justify-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[11px] font-semibold text-ink-soft shadow-row">
          <Heart className="size-[12px] shrink-0 text-gold" />
          ניקול תלווה אתכם בחוויה אישית בכל מסעדה
          <Sparkle className="size-[11px] shrink-0 text-gold" />
        </p>
      </main>
    </MobileShell>
  );
}
