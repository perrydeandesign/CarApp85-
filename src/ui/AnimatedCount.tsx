import React, { useEffect, useRef, useState } from 'react';
import { Text, TextProps } from 'react-native';

type Props = TextProps & {
  value: number;
  /** Tween duration in ms (default 350). */
  duration?: number;
  /** Optional formatter (e.g. 1200 → "1.2k"). */
  format?: (n: number) => string;
};

/**
 * Text that smoothly counts from its previous value to the new one whenever
 * `value` changes — the small flourish on like / follower counts. Uses
 * requestAnimationFrame (no native dep) and only animates on change, so the
 * first render shows the value instantly.
 */
export function AnimatedCount({ value, duration = 350, format, style, ...rest }: Props) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    startRef.current = 0;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - t) * (1 - t);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
    };
  }, [value, duration]);

  return (
    <Text style={style} {...rest}>
      {format ? format(display) : display}
    </Text>
  );
}
