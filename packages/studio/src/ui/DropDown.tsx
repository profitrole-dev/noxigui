import React from "react";

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
  return (
    <select
      className={`bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded outline-none ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default DropDown;
