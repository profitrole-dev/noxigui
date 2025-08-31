import React from "react";

type Props = {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  trailing?: React.ReactNode;
};

export function NavItem({ icon, label, active, onClick, trailing }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex items-center gap-2 w-full rounded-md text-left",
        "px-[10px] py-[6px] text-[14px] leading-[20px] transition-colors",
        active
          ? "bg-[#2C1A75] text-[#A89FFF]"
          : "text-neutral-400 hover:text-white hover:bg-[#2a2a2a]",
      ].join(" ")}
    >
      {icon && (
        <span
          className={[
            "shrink-0",
            active ? "text-[#A89FFF]" : "opacity-70 group-hover:opacity-100"
          ].join(" ")}
        >
          {icon}
        </span>
      )}
      <span className="font-medium">{label}</span>
      {trailing && <span className="opacity-70 ml-auto">{trailing}</span>}
    </button>
  );
}
