"use client";

import type { Trait, TraitCategory } from "../types";
import { TRAIT_CATEGORIES, TRAIT_CATEGORY_ORDER } from "../types";
import { TraitBadge } from "./TraitBadge";

interface TraitListProps {
  traits: Trait[];
  groupByCategory?: boolean;
  size?: "sm" | "md" | "lg";
  showEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function TraitList({
  traits,
  groupByCategory = true,
  size = "md",
  showEmpty = true,
  emptyMessage = "보유한 특성이 없습니다",
  className = "",
}: TraitListProps) {
  if (traits.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className={`text-gray-500 text-sm italic ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  if (!groupByCategory) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {traits.map((trait) => (
          <TraitBadge key={trait.id} trait={trait} size={size} />
        ))}
      </div>
    );
  }

  // 카테고리별 그룹핑
  const grouped = TRAIT_CATEGORY_ORDER.reduce<{ category: TraitCategory; traits: Trait[] }[]>(
    (acc, category) => {
      const categoryTraits = traits.filter((t) => t.category === category);
      if (categoryTraits.length > 0) {
        acc.push({ category, traits: categoryTraits });
      }
      return acc;
    },
    []
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {grouped.map(({ category, traits: categoryTraits }) => {
        const categoryInfo = TRAIT_CATEGORIES[category];
        return (
          <div key={category}>
            {/* 카테고리 헤더 */}
            <div className="flex items-center gap-2 mb-2">
              <span>{categoryInfo.icon}</span>
              <span className="text-sm font-medium text-gray-400">
                {categoryInfo.nameKo}
              </span>
              <span className="text-xs text-gray-500">
                ({categoryTraits.length})
              </span>
            </div>

            {/* 트레이트 목록 */}
            <div className="flex flex-wrap gap-2">
              {categoryTraits.map((trait) => (
                <TraitBadge key={trait.id} trait={trait} size={size} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
