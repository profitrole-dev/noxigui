import React from "react";
import DropDown from "../../ui/DropDown";
import type { DropDownOption } from "../../ui/DropDown";

const baseOptions: DropDownOption[] = [
  { value: "Number", label: "Number" },
  { value: "String", label: "String" },
  { value: "List", label: "List" },
  { value: "Dictionary", label: "Dictionary" },
];

export default function TypeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const match = /^List<(.*)>$/.exec(value);
  const base = match ? "List" : value || "Number";
  const inner = match ? match[1] : "Number";

  const handleBaseChange = (next: string) => {
    if (next === "List") {
      onChange(`List<${inner}>`);
    } else {
      onChange(next);
    }
  };

  const handleInnerChange = (next: string) => {
    onChange(`List<${next}>`);
  };

  return (
    <div className="flex items-center gap-1">
      <DropDown value={base} options={baseOptions} onChange={handleBaseChange} />
      {base === "List" && (
        <TypeDropdown value={inner} onChange={handleInnerChange} />
      )}
    </div>
  );
}
