"use client";

import { useAppearancePart, type PartType } from "@/application/stores";

interface PartSelectorProps {
  type: PartType;
}

export function PartSelector({ type }: PartSelectorProps) {
  const { label, current, total, next, prev } = useAppearancePart(type);

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="w-12 text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={prev} className="btn-icon">&lt;</button>
        <span className="w-14 text-center text-xs">
          {current >= 0 ? current + 1 : "-"}/{total}
        </span>
        <button onClick={next} className="btn-icon">&gt;</button>
      </div>
    </div>
  );
}
