import React from 'react';

type Props = {
  years?: (number | null)[];
  selected?: number | null;
  onSelect?: (y: number) => void;
  // Legacy prop names kept for any older callers.
  selectedYear?: number;
  onYearChange?: (y: number) => void;
};

/** Placeholder — the real year-picker UI lives in a later phase. */
export function FloatingYearPicker(_props: Props) {
  return null;
}
