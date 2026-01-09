"use client";

import type { Trait } from "../types";
import { TRAIT_RARITIES, TRAIT_CATEGORIES } from "../types";
import { formatTraitEffects } from "../lib/effects";
import { STAT_ICONS, NPC_TYPE_NAMES_KO } from "../types/constants";

interface TraitTooltipProps {
  trait: Trait;
  className?: string;
}

export function TraitTooltip({ trait, className = "" }: TraitTooltipProps) {
  const rarityInfo = TRAIT_RARITIES[trait.rarity];
  const categoryInfo = TRAIT_CATEGORIES[trait.category];
  const effects = formatTraitEffects(trait.effects);

  return (
    <div
      className={`w-72 p-4 rounded-lg shadow-xl border bg-gray-800 ${className}`}
      style={{ borderColor: rarityInfo.color }}
    >
      {/* 헤더 */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{trait.icon}</span>
        <div className="flex-1">
          <div className="font-bold text-lg" style={{ color: rarityInfo.color }}>
            {trait.nameKo}
          </div>
          <div className="text-xs text-gray-400">
            {trait.nameEn}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                backgroundColor: `${rarityInfo.color}20`,
                color: rarityInfo.color,
              }}
            >
              {rarityInfo.nameKo}
            </span>
            <span className="text-xs text-gray-500">
              {categoryInfo.icon} {categoryInfo.nameKo}
            </span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
        {trait.description}
      </p>

      {/* 효과 */}
      {effects.length > 0 && (
        <div className="border-t border-gray-600 pt-3 mb-3">
          <div className="text-xs text-gray-400 mb-2 font-medium">효과</div>
          <div className="space-y-1">
            {effects.map((line, i) => {
              const isNegative = line.includes("-");
              return (
                <div
                  key={i}
                  className="text-sm flex items-center gap-1"
                  style={{ color: isNegative ? "#F87171" : "#34D399" }}
                >
                  <span>{isNegative ? "▼" : "▲"}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NPC 반응 */}
      {trait.effects.npcReactions && trait.effects.npcReactions.length > 0 && (
        <div className="border-t border-gray-600 pt-3 mb-3">
          <div className="text-xs text-gray-400 mb-2 font-medium">NPC 반응</div>
          <div className="space-y-1">
            {trait.effects.npcReactions.map((reaction, i) => {
              const isNegative = reaction.modifier < 0;
              return (
                <div
                  key={i}
                  className="text-sm flex items-center justify-between"
                >
                  <span className="text-gray-300">
                    {NPC_TYPE_NAMES_KO[reaction.type] || reaction.type}
                  </span>
                  <span style={{ color: isNegative ? "#F87171" : "#34D399" }}>
                    {isNegative ? "" : "+"}{reaction.modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 해금 스킬 */}
      {trait.effects.unlockedSkills && trait.effects.unlockedSkills.length > 0 && (
        <div className="border-t border-gray-600 pt-3 mb-3">
          <div className="text-xs text-gray-400 mb-2 font-medium">해금 스킬</div>
          <div className="flex flex-wrap gap-1">
            {trait.effects.unlockedSkills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 충돌 트레이트 */}
      {trait.conflicts && trait.conflicts.length > 0 && (
        <div className="border-t border-gray-600 pt-3">
          <div className="text-xs text-gray-400 mb-2 font-medium">충돌</div>
          <div className="space-y-1">
            {trait.conflicts.map((conflict, i) => (
              <div key={i} className="text-xs text-red-400">
                ⚠ {conflict.traitId}: {conflict.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 요구 조건 */}
      {trait.requirements && trait.requirements.length > 0 && (
        <div className="border-t border-gray-600 pt-3 mt-3">
          <div className="text-xs text-gray-400 mb-2 font-medium">획득 조건</div>
          <div className="space-y-1">
            {trait.requirements.map((req, i) => (
              <div key={i} className="text-xs text-gray-500">
                • {req.description || req.type}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
