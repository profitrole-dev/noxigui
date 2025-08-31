import React, { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

export function TopbarTitle({
                              name,
                              onRename,
                            }: {
  name: string;
  onRename: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setValue(name), [name]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const next = value.trim();
    if (next && next !== name) onRename(next);
    setEditing(false);
  };

  const cancel = () => {
    setValue(name);
    setEditing(false);
  };

  return (
    <div className="group relative flex items-center gap-2">
      {!editing ? (
        <>
          <div className="text-sm font-medium text-neutral-200 truncate max-w-[360px]">
            {name}
          </div>
          <button
            type="button"
            aria-label="Rename project"
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity
                       rounded-md p-1 hover:bg-[rgb(var(--cu-grey200))] text-neutral-300 hover:text-white"
          >
            <Pencil size={14} />
          </button>
        </>
      ) : (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className="
            bg-transparent
            border-b border-[rgb(var(--cu-border))]
            focus:border-neutral-400
            outline-none
            text-sm font-medium text-neutral-100
            w-auto min-w-[40px]
          "
          style={{ width: `${Math.max(value.length, 4)}ch` }}
        />
      )}
    </div>
  );
}
