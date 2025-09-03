import React, { useEffect, useRef, useState } from "react";
import { Triangle } from "lucide-react";

export interface DropDownOption {
  value: string;
  label: string;
}

export function DropDown({
  value,
  options,
  onChange,
  className = "",
}: {
  value: string;
  options: DropDownOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <Triangle
          size={10}
          className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-neutral-800 rounded shadow">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className="block w-full text-left px-2 py-1 hover:bg-neutral-700 rounded"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DropDown;
