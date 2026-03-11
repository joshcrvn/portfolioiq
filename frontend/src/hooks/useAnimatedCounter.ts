import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

/**
 * Animates a number from 0 to `target` over `duration` seconds.
 * Immediately snaps to `target` when the user prefers reduced motion.
 */
export function useAnimatedCounter(target: number, duration = 0.9): number {
  const [current, setCurrent] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setCurrent(target);
      return;
    }
    // Reset on each target change so re-fetch animations replay
    setCurrent(0);
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setCurrent(v),
    });
    return controls.stop;
  }, [target, duration, prefersReduced]);

  return current;
}
