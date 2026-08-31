"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Dish photography.
 *
 * Renders nothing when there is no photograph. A restaurant onboarding onto
 * Nikol always has part of its menu un-shot, and a decorative block standing
 * in for the missing picture reads as a broken image — the layout should
 * simply close up around it instead. Callers use `hasPhoto` to decide.
 */
export function hasPhoto(src: string): boolean {
  return Boolean(src);
}

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

  if (!src || failed) return null;

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
