"use client";

import { useAppearanceColor } from "../model";

const COLOR_TARGETS = [
  { key: "hair", label: "머리" },
  { key: "cloth", label: "옷" },
  { key: "body", label: "피부" },
  { key: "armor", label: "갑옷" },
] as const;

export function ColorPicker() {
  const { color, setColor, applyTo } = useAppearanceColor();

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-10 h-8 rounded cursor-pointer"
      />
      <div className="flex-1 grid grid-cols-4 gap-1">
        {COLOR_TARGETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => applyTo(key)}
            className="btn-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
