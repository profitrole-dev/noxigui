import React from "react";

export function Brand({
                        name = "Noxi",
                        initial = "N",
                        onClick,
                      }: {
  name?: string;
  initial?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer select-none font-sans"
    >
      {/* Иконка-инициал */}
      <span className="w-7 h-7 rounded-md grid place-items-center bg-emerald-600 text-white text-[13px] font-bold">
        {initial}
      </span>

      {/* Текстовое лого */}
      <span className="text-[16px] leading-[20px] font-bold text-[#EEEEEE]">
        {name}
      </span>
    </button>
  );
}
