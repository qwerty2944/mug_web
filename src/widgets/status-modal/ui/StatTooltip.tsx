"use client";

import { useState, type ReactNode } from "react";
import { useThemeStore } from "@/application/stores";

interface StatTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom";
}

export function StatTooltip({
  children,
  content,
  position = "top",
}: StatTooltipProps) {
  const [show, setShow] = useState(false);
  const { theme } = useThemeStore();

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="cursor-help">{children}</div>
      {show && (
        <div
          className={`absolute z-[200] p-2 min-w-[160px] max-w-[240px] pointer-events-none ${
            position === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
              : "top-full left-1/2 -translate-x-1/2 mt-2"
          }`}
          style={{
            backgroundColor: theme.colors.bg,
            border: `2px solid ${theme.colors.border}`,
            boxShadow: `0 4px 16px rgba(0,0,0,0.8)`,
          }}
        >
          <div
            className="text-xs font-mono"
            style={{ color: theme.colors.text }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
