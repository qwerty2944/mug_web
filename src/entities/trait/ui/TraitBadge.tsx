"use client";

import { useState } from "react";
import type { Trait } from "../types";
import { TRAIT_RARITIES, TRAIT_CATEGORIES } from "../types";
import { formatTraitEffects } from "../lib/effects";

interface TraitBadgeProps {
  trait: Trait;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TraitBadge({
  trait,
  size = "md",
  showTooltip = true,
  onClick,
  className = "",
}: TraitBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rarityInfo = TRAIT_RARITIES[trait.rarity];
  const categoryInfo = TRAIT_CATEGORIES[trait.category];

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={`relative inline-flex items-center gap-1 rounded-md border cursor-default transition-all ${sizeClasses[size]} ${className}`}
      style={{
        borderColor: rarityInfo.color,
        backgroundColor: `${rarityInfo.color}15`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 아이콘 */}
      <span className={iconSizes[size]}>{trait.icon}</span>

      {/* 이름 */}
      <span style={{ color: rarityInfo.color }}>{trait.nameKo}</span>

      {/* 툴팁 */}
      {showTooltip && isHovered && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-xl border"
          style={{
            backgroundColor: "#1f2937",
            borderColor: rarityInfo.color,
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{trait.icon}</span>
            <div>
              <div className="font-bold" style={{ color: rarityInfo.color }}>
                {trait.nameKo}
              </div>
              <div className="text-xs text-gray-400">
                {categoryInfo.icon} {categoryInfo.nameKo} • {rarityInfo.nameKo}
              </div>
            </div>
          </div>

          {/* 설명 */}
          <p className="text-xs text-gray-300 mb-2">{trait.description}</p>

          {/* 효과 */}
          <div className="border-t border-gray-600 pt-2">
            <div className="text-xs text-gray-400 mb-1">효과</div>
            <div className="space-y-0.5">
              {formatTraitEffects(trait.effects).map((line, i) => (
                <div
                  key={i}
                  className="text-xs"
                  style={{
                    color: line.startsWith("-") || line.includes("-") ? "#F87171" : "#34D399",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* 화살표 */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent"
            style={{ borderTopColor: "#1f2937" }}
          />
        </div>
      )}
    </div>
  );
}
