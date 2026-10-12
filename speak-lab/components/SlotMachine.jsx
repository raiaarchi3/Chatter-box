'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Slot-machine style picker. Returns the visible index + a spin() trigger. */
export function useSlot(items) {
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    setSpinning(false);
    setIndex(Math.floor(Math.random() * items.length));
  }, [items]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const spin = useCallback(() => {
    if (spinning || items.length < 2) return;
    setSpinning(true);
    let steps = 12 + Math.floor(Math.random() * 8);
    let delay = 45;
    const tick = () => {
      setIndex((i) => (i + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length);
      steps -= 1;
      if (steps <= 0) return setSpinning(false);
      delay *= 1.14;
      timer.current = setTimeout(tick, delay);
    };
    tick();
  }, [items, spinning]);

  return { index, spinning, spin };
}

export default function SlotMachine({ items, index, spinning, onSpin, hint = 'pull lever' }) {
  const n = items.length;
  const at = (i) => items[(i + n) % n];
  return (
    <div className="slot-wrap">
      <div className={`slot ${spinning ? 'is-spinning' : ''}`}>
        <div className="slot-row ghost">{at(index - 1)}</div>
        <div className="slot-row main" key={`${index}-${spinning}`}>
          {at(index)}
        </div>
        <div className="slot-row ghost">{at(index + 1)}</div>
      </div>
      <button type="button" className={`lever ${spinning ? 'pulled' : ''}`} onClick={onSpin} aria-label="Spin">
        <span className="lever-note">{hint} ↓</span>
        <span className="stick" />
        <span className="knob" />
      </button>
    </div>
  );
}
