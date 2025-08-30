import React from "react";

export function ToolbarButton({
  children,
  label,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      data-active={active ? "true" : undefined}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-md text-base-content transition-colors hover:bg-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[active=true]:bg-base-300 data-[active=true]:text-primary"
    >
      {children}
    </button>
  );
}
