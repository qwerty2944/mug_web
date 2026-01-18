"use client";

import { useState, type ReactNode } from "react";
import { useThemeStore } from "@/application/stores";

interface StatTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function StatTooltip({
  children,
  content,
  position = "top",
}: StatTooltipProps) {
  const [show, setShow] = useState(false);
  const { theme } = useThemeStore();

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="cursor-help">{children}</div>
      {show && (
        <div
          className={`absolute z-50 ${positionStyles[position]} p-2 min-w-[160px] max-w-[240px] pointer-events-none`}
          style={{
            background: theme.colors.bgLight,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px ${theme.colors.primary}20`,
          }}
        >
          <div className="text-xs font-mono" style={{ color: theme.colors.text }}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
