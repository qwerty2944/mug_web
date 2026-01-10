import type { Skill, PassiveTrigger, PassiveEffect } from "../types";

/**
 * 패시브 스킬 발동 결과
 */
export interface PassiveSkillResult {
  triggered: boolean;
  skill: Skill;
  effect: PassiveEffect;
  message: string;
  // 효과별 추가 데이터
  damageReflected?: number;
  healAmount?: number;
  counterDamage?: number;
  statBoost?: {
    stat: string;
    value: number;
    duration: number;
  };
}

/**
 * 패시브 스킬 발동 체크
 */
export function checkPassiveSkill(
  skill: Skill,
  trigger: PassiveTrigger,
  context: {
    damageTaken?: number;
    currentHp?: number;
    maxHp?: number;
    attackerStats?: { str?: number; dex?: number; int?: number };
  }
): PassiveSkillResult | null {
  // 패시브 스킬이 아니거나 트리거가 맞지 않으면 null
  if (skill.type !== "passive" || skill.passiveTrigger !== trigger) {
    return null;
  }

  const effect = skill.passiveEffect;
  if (!effect) return null;

  // 발동 확률 체크 (기본 100%)
  const chance = effect.chance ?? 100;
  if (Math.random() * 100 >= chance) {
    return null;
  }

  // 효과 타입별 처리
  let message = "";
  let damageReflected: number | undefined;
  let healAmount: number | undefined;
  let counterDamage: number | undefined;
  let statBoost: PassiveSkillResult["statBoost"];

  switch (effect.type) {
    case "damage_reflect":
      // 피해 반사 (받은 피해의 X%)
      if (context.damageTaken) {
        damageReflected = Math.floor(context.damageTaken * (effect.value / 100));
        message = `${skill.icon} ${skill.nameKo} 발동! ${damageReflected} 피해 반사!`;
      }
      break;

    case "heal_on_hit":
      // 피격 시 회복 (최대 HP의 X%)
      if (context.maxHp) {
        healAmount = Math.floor(context.maxHp * (effect.value / 100));
        message = `${skill.icon} ${skill.nameKo} 발동! HP ${healAmount} 회복!`;
      }
      break;

    case "counter_attack":
      // 반격 (STR 기반 데미지)
      if (context.attackerStats?.str) {
        counterDamage = Math.floor(context.attackerStats.str * (effect.value / 100));
        message = `${skill.icon} ${skill.nameKo} 발동! 반격 ${counterDamage} 데미지!`;
      }
      break;

    case "thorns":
      // 가시 (고정 피해)
      damageReflected = effect.value;
      message = `${skill.icon} ${skill.nameKo} 발동! 가시로 ${damageReflected} 피해!`;
      break;

    case "damage_reduce":
      // 피해 감소 (별도 처리 필요 - 피해 받기 전에 적용)
      message = `${skill.icon} ${skill.nameKo} 발동! 피해 ${effect.value}% 감소!`;
      break;

    case "stat_boost":
      // 스탯 상승
      statBoost = {
        stat: "all", // 일반적으로 모든 스탯
        value: effect.value,
        duration: effect.duration ?? 1,
      };
      message = `${skill.icon} ${skill.nameKo} 발동! 능력치 ${effect.value}% 상승!`;
      break;
  }

  if (!message) return null;

  return {
    triggered: true,
    skill,
    effect,
    message,
    damageReflected,
    healAmount,
    counterDamage,
    statBoost,
  };
}

/**
 * 특정 트리거에 해당하는 패시브 스킬 필터링
 */
export function filterPassiveSkills(
  skills: Skill[],
  trigger: PassiveTrigger
): Skill[] {
  return skills.filter(
    (skill) => skill.type === "passive" && skill.passiveTrigger === trigger
  );
}

/**
 * 피격 시 발동하는 패시브 스킬들 처리
 */
export function processOnHitPassives(
  learnedPassiveSkills: Skill[],
  context: {
    damageTaken: number;
    currentHp: number;
    maxHp: number;
    attackerStats?: { str?: number; dex?: number; int?: number };
  }
): PassiveSkillResult[] {
  const results: PassiveSkillResult[] = [];

  const onHitSkills = filterPassiveSkills(learnedPassiveSkills, "on_hit");

  for (const skill of onHitSkills) {
    const result = checkPassiveSkill(skill, "on_hit", context);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * HP 낮을 때 발동하는 패시브 스킬들 처리
 */
export function processLowHpPassives(
  learnedPassiveSkills: Skill[],
  context: {
    currentHp: number;
    maxHp: number;
    attackerStats?: { str?: number; dex?: number; int?: number };
  }
): PassiveSkillResult[] {
  const results: PassiveSkillResult[] = [];

  // HP가 30% 이하일 때만 체크
  const hpPercent = (context.currentHp / context.maxHp) * 100;
  if (hpPercent > 30) return results;

  const lowHpSkills = filterPassiveSkills(learnedPassiveSkills, "on_low_hp");

  for (const skill of lowHpSkills) {
    const result = checkPassiveSkill(skill, "on_low_hp", context);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * 기본 패시브 스킬 데이터 (테스트/기본 제공용)
 */
export const DEFAULT_PASSIVE_SKILLS: Skill[] = [
  {
    id: "iron_skin",
    nameKo: "철갑 피부",
    nameEn: "Iron Skin",
    description: "피격 시 10% 확률로 받은 피해의 20%를 반사한다.",
    type: "passive",
    category: "defense",
    icon: "🛡️",
    apCost: 0,
    passiveTrigger: "on_hit",
    passiveEffect: {
      type: "damage_reflect",
      value: 20,
      chance: 10,
    },
    target: "self",
    requirements: {
      stats: { con: 15 },
    },
  },
  {
    id: "thorns_aura",
    nameKo: "가시 오라",
    nameEn: "Thorns Aura",
    description: "피격 시 공격자에게 5 고정 피해를 준다.",
    type: "passive",
    category: "defense",
    icon: "🌵",
    apCost: 0,
    passiveTrigger: "on_hit",
    passiveEffect: {
      type: "thorns",
      value: 5,
      chance: 100,
    },
    target: "self",
    requirements: {
      proficiency: 20,
    },
  },
  {
    id: "second_wind",
    nameKo: "재기",
    nameEn: "Second Wind",
    description: "HP가 30% 이하일 때 피격 시 25% 확률로 최대 HP의 10%를 회복한다.",
    type: "passive",
    category: "defense",
    icon: "💨",
    apCost: 0,
    passiveTrigger: "on_low_hp",
    passiveEffect: {
      type: "heal_on_hit",
      value: 10,
      chance: 25,
    },
    target: "self",
    requirements: {
      stats: { con: 12 },
    },
  },
  {
    id: "counter_instinct",
    nameKo: "반격 본능",
    nameEn: "Counter Instinct",
    description: "피격 시 15% 확률로 자동 반격한다.",
    type: "passive",
    category: "martial",
    icon: "⚡",
    apCost: 0,
    passiveTrigger: "on_hit",
    passiveEffect: {
      type: "counter_attack",
      value: 150, // STR의 150%
      chance: 15,
    },
    target: "self",
    requirements: {
      stats: { dex: 14 },
    },
  },
];
