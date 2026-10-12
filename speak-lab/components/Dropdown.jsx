'use client';
import { useEffect, useRef, useState } from 'react';

export default function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="dd" ref={ref}>
      <button type="button" className="pill" onClick={() => setOpen((o) => !o)}>
        {current.icon && <span>{current.icon}</span>}
        <span>{current.label}</span>
        <small>{open ? '▴' : '▾'}</small>
      </button>
      {open && (
        <ul className="dd-menu">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className={o.value === value ? 'on' : ''}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.icon && <span>{o.icon}</span>}
                <span>{o.label}</span>
                {o.value === value && <b>✓</b>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
