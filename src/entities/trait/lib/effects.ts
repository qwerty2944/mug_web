/**
 * Trait Effects Calculation
 * 트레이트 효과 계산 및 적용
 */

import type {
  Trait,
  TraitEffects,
  StatType,
  SpecialEffectType,
  NPCReactionType,
  AggregatedTraitEffects,
} from "../types";

// ============ 효과 집계 ============

/**
 * 여러 트레이트의 효과를 합산
 */
export function calculateAggregatedEffects(traits: Trait[]): AggregatedTraitEffects {
  const result: AggregatedTraitEffects = {
    statModifiers: {},
    specialEffects: new Map(),
    npcReactions: new Map(),
    unlockedSkills: [],
  };

  for (const trait of traits) {
    const effects = trait.effects;
    if (!effects) continue;

    // 스탯 수정자 합산
    if (effects.statModifiers) {
      for (const [stat, value] of Object.entries(effects.statModifiers)) {
        const key = stat as StatType;
        result.statModifiers[key] = (result.statModifiers[key] ?? 0) + (value ?? 0);
      }
    }

    // 특수 효과 합산
    if (effects.specialEffects) {
      for (const effect of effects.specialEffects) {
        const current = result.specialEffects.get(effect.type) ?? 0;
        result.specialEffects.set(effect.type, current + effect.value);
      }
    }

    // NPC 반응 합산
    if (effects.npcReactions) {
      for (const reaction of effects.npcReactions) {
        const current = result.npcReactions.get(reaction.type) ?? 0;
        result.npcReactions.set(reaction.type, current + reaction.modifier);
      }
    }

    // 해금 스킬 추가 (중복 제거)
    if (effects.unlockedSkills) {
      for (const skill of effects.unlockedSkills) {
        if (!result.unlockedSkills.includes(skill)) {
          result.unlockedSkills.push(skill);
        }
      }
    }
  }

  return result;
}

// ============ 스탯 적용 ============

/**
 * 기본 스탯에 트레이트 보너스 적용
 */
export function applyStatModifiers(
  baseStats: Record<StatType, number>,
  aggregatedEffects: AggregatedTraitEffects
): Record<StatType, number> {
  const result = { ...baseStats };

  for (const [stat, modifier] of Object.entries(aggregatedEffects.statModifiers)) {
    const key = stat as StatType;
    if (result[key] !== undefined) {
      result[key] += modifier ?? 0;
    }
  }

  return result;
}

// ============ 특수 효과 조회 ============

/**
 * 특정 특수 효과 값 조회
 */
export function getSpecialEffectValue(
  aggregatedEffects: AggregatedTraitEffects,
  effectType: SpecialEffectType
): number {
  return aggregatedEffects.specialEffects.get(effectType) ?? 0;
}

/**
 * 특수 효과를 배율로 변환 (1.0 기준)
 * 예: +10% = 1.1, -20% = 0.8
 */
export function getSpecialEffectMultiplier(
  aggregatedEffects: AggregatedTraitEffects,
  effectType: SpecialEffectType
): number {
  const value = getSpecialEffectValue(aggregatedEffects, effectType);
  return 1 + value / 100;
}

// ============ NPC 반응 ============

/**
 * NPC 타입별 호감도 수정치 조회
 */
export function getNPCDispositionModifier(
  aggregatedEffects: AggregatedTraitEffects,
  npcType: NPCReactionType
): number {
  return aggregatedEffects.npcReactions.get(npcType) ?? 0;
}

// ============ 전투 관련 효과 ============

/**
 * 물리 데미지 배율 계산
 */
export function getPhysicalDamageMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "physical_damage");
}

/**
 * 마법 데미지 배율 계산
 */
export function getMagicDamageMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "magic_damage");
}

/**
 * 치명타 확률 보너스 (절대값)
 */
export function getCriticalChanceBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "critical_chance");
}

/**
 * 회피 확률 보너스 (절대값)
 */
export function getDodgeChanceBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "dodge_chance");
}

/**
 * 막기 확률 보너스 (절대값)
 */
export function getBlockChanceBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "block_chance");
}

/**
 * 명중률 보너스 (절대값)
 */
export function getAccuracyBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "accuracy");
}

/**
 * 도주 확률 보너스 (절대값)
 */
export function getFleeChanceBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "flee_chance");
}

// ============ 저항 관련 ============

/**
 * 공포 저항률 (%)
 */
export function getFearResistance(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "fear_resistance");
}

/**
 * 질병 저항률 (%)
 */
export function getDiseaseResistance(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "disease_resistance");
}

/**
 * 독 저항률 (%)
 */
export function getPoisonResistance(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "poison_resistance");
}

/**
 * 속성 저항률 (%)
 */
export function getElementalResistance(
  aggregatedEffects: AggregatedTraitEffects,
  element: "fire" | "ice" | "lightning" | "holy" | "dark"
): number {
  const effectTypeMap: Record<string, SpecialEffectType> = {
    fire: "fire_resistance",
    ice: "ice_resistance",
    lightning: "lightning_resistance",
    holy: "holy_resistance",
    dark: "dark_resistance",
  };
  return getSpecialEffectValue(aggregatedEffects, effectTypeMap[element]);
}

// ============ 경제/성장 관련 ============

/**
 * 골드 획득 배율
 */
export function getGoldGainMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "gold_gain");
}

/**
 * 경험치 획득 배율
 */
export function getExpGainMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "exp_gain");
}

/**
 * 희귀 드롭률 보너스 (%)
 */
export function getRareDropBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "rare_drop");
}

/**
 * 숙련도 획득 배율
 */
export function getProficiencyGainMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "proficiency_gain");
}

/**
 * 구매 비용 배율 (양수면 비싸짐, 음수면 할인)
 */
export function getPurchaseCostMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "purchase_cost");
}

// ============ 특수 효과 ============

/**
 * 이도류 보너스 (%)
 */
export function getDualWieldBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "dual_wield");
}

/**
 * 치유량 배율
 */
export function getHealingPowerMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "healing_power");
}

/**
 * 위협 보너스 (%)
 */
export function getIntimidationBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "intimidation");
}

/**
 * 설득 보너스 (%)
 */
export function getPersuasionBonus(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectValue(aggregatedEffects, "persuasion");
}

/**
 * 밤 보너스 배율
 */
export function getNightBonusMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "night_bonus");
}

/**
 * 낮 보너스 배율
 */
export function getDayBonusMultiplier(aggregatedEffects: AggregatedTraitEffects): number {
  return getSpecialEffectMultiplier(aggregatedEffects, "day_bonus");
}

// ============ 효과 요약 텍스트 ============

/**
 * 트레이트 효과를 사람이 읽기 좋은 형태로 변환
 */
export function formatTraitEffects(effects: TraitEffects): string[] {
  const lines: string[] = [];

  // 스탯 수정자
  if (effects.statModifiers) {
    const statNames: Record<StatType, string> = {
      str: "힘",
      dex: "민첩",
      con: "체력",
      int: "지능",
      wis: "지혜",
      cha: "매력",
      lck: "행운",
    };

    for (const [stat, value] of Object.entries(effects.statModifiers)) {
      if (value) {
        const sign = value > 0 ? "+" : "";
        lines.push(`${statNames[stat as StatType]} ${sign}${value}`);
      }
    }
  }

  // 특수 효과
  if (effects.specialEffects) {
    const effectNames: Partial<Record<SpecialEffectType, string>> = {
      fear_resistance: "공포 저항",
      disease_resistance: "질병 저항",
      poison_resistance: "독 저항",
      fire_resistance: "화염 저항",
      ice_resistance: "냉기 저항",
      lightning_resistance: "번개 저항",
      holy_resistance: "신성 저항",
      dark_resistance: "암흑 저항",
      physical_damage: "물리 데미지",
      magic_damage: "마법 데미지",
      critical_chance: "치명타 확률",
      dodge_chance: "회피 확률",
      block_chance: "막기 확률",
      accuracy: "명중률",
      flee_chance: "도주 확률",
      gold_gain: "골드 획득",
      exp_gain: "경험치 획득",
      rare_drop: "희귀 드롭률",
      proficiency_gain: "숙련도 획득",
      dual_wield: "이도류",
      healing_power: "치유량",
      purchase_cost: "구매 비용",
      intimidation: "위협",
      persuasion: "설득",
      night_bonus: "밤 행동",
      day_bonus: "낮 행동",
    };

    for (const effect of effects.specialEffects) {
      const name = effectNames[effect.type] ?? effect.type;
      const sign = effect.value > 0 ? "+" : "";
      const suffix = effect.isPercentage ? "%" : "";
      lines.push(`${name} ${sign}${effect.value}${suffix}`);
    }
  }

  return lines;
}
