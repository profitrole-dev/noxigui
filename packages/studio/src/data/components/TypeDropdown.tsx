import React from "react";
import DropDown from "../../ui/DropDown";
import type { DropDownOption } from "../../ui/DropDown";
import { useStudio } from "../../state/useStudio";

const baseOptions: DropDownOption[] = [
  { value: "Number", label: "Number" },
  { value: "String", label: "String" },
  { value: "List", label: "List" },
  { value: "Dictionary", label: "Dictionary" },
];

export default function TypeDropdown({
  value,
  onChange,
  allowSchemas = false,
}: {
  value: string;
  onChange: (value: string) => void;
  allowSchemas?: boolean;
}) {
  const { project } = useStudio();
  const schemaOptions: DropDownOption[] = Object.keys(
    project.data.schemas ?? {}
  ).map((n) => ({
    value: n,
    label: n,
  }));
  const options = allowSchemas
    ? [...baseOptions, ...schemaOptions]
    : baseOptions;

  const match = /^List<(.*)>$/.exec(value);
  const base = match ? "List" : value || options[0]?.value;
  const inner = match ? match[1] : schemaOptions[0]?.value || baseOptions[0].value;

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
      <DropDown value={base} options={options} onChange={handleBaseChange} />
      {base === "List" && (
        <TypeDropdown
          value={inner}
          onChange={handleInnerChange}
          allowSchemas={true}
        />
      )}
    </div>
  );
}
