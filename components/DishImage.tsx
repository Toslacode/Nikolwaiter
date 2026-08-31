"use client";

import Image from "next/image";
import { useState } from "react";
import { Wheat } from "@/components/Icons";

/**
 * Dish photography, with a designed stand-in for dishes whose photo hasn't
 * been shot yet. A restaurant onboarding onto Nikol will always have some of
 * its menu un-photographed, so the gap is a real product state — it should
 * look deliberate rather than like a broken image.
 */
export function DishImage({
  src,
  alt = "",
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  // An empty src means "not photographed yet" — render the stand-in without
  // asking the network for a file we know is not there.
  if (!src || failed) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#f6efe4_0%,#efe3d1_55%,#e8d9c2_100%)] ${className}`}
        aria-hidden="true"
      >
        <Wheat className="size-[28%] max-h-[46px] text-gold/45" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
