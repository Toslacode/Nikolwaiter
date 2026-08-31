"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SpringOptions {
  /** Seconds to reach the target. Apple's "response", not a fixed duration. */
  response?: number;
  /** 1 = critically damped (no overshoot). ~0.8 gives a little bounce. */
  damping?: number;
}

/**
 * A spring driven by rAF rather than a CSS transition.
 *
 * The point is interruptibility: `to()` re-targets from wherever the value
 * currently is and keeps the velocity it already had, so a gesture can be
 * grabbed and reversed mid-flight without the jump a `transition` would give.
 * `set()` is the 1:1 path — use it while a finger is down.
 */
export function useSpring(initial: number, { response = 0.4, damping = 1 }: SpringOptions = {}) {
  const [value, setValue] = useState(initial);

  const state = useRef({ value: initial, velocity: 0, target: initial });
  const frame = useRef<number | null>(null);
  const lastTime = useRef(0);

  const stop = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  const tick = useCallback(
    (now: number) => {
      const s = state.current;
      // Clamp dt so a backgrounded tab doesn't integrate one enormous step.
      const dt = Math.min((now - lastTime.current) / 1000, 1 / 30);
      lastTime.current = now;

      const omega = (2 * Math.PI) / response;
      const k = omega * omega;
      const c = 2 * damping * omega;

      const accel = -k * (s.value - s.target) - c * s.velocity;
      s.velocity += accel * dt;
      s.value += s.velocity * dt;

      if (Math.abs(s.value - s.target) < 0.1 && Math.abs(s.velocity) < 0.5) {
        s.value = s.target;
        s.velocity = 0;
        setValue(s.target);
        frame.current = null;
        return;
      }

      setValue(s.value);
      frame.current = requestAnimationFrame(tick);
    },
    [damping, response],
  );

  const start = useCallback(() => {
    if (frame.current !== null) return;
    lastTime.current = performance.now();
    frame.current = requestAnimationFrame(tick);
  }, [tick]);

  /** Animate to `target`, optionally handing off the gesture's release velocity. */
  const to = useCallback(
    (target: number, velocity?: number) => {
      state.current.target = target;
      if (velocity !== undefined) state.current.velocity = velocity;
      start();
    },
    [start],
  );

  /** Jump straight to a value — what a finger dragging 1:1 should do. */
  const set = useCallback(
    (next: number) => {
      stop();
      state.current.value = next;
      state.current.target = next;
      state.current.velocity = 0;
      setValue(next);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { value, to, set, stop };
}

/**
 * Where a flick would come to rest, using the same exponential decay as
 * native scrolling. Snapping from the release point ignores how hard the
 * user threw it; snapping from the projection is what makes a flick feel
 * like a throw.
 */
export function projectMomentum(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary, instead of a dead stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
