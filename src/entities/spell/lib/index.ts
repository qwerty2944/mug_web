import type { MagicElement } from "@/entities/proficiency";
import type {
  Spell,
  SpellRequirements,
  SpellProficiency,
  SpellProficiencyRank,
  SpellProficiencyRankInfo,
} from "../types";
import { SPELL_PROFICIENCY_RANKS } from "../types";

// ============ 숙련도 등급 계산 ============

/**
 * 경험치로 숙련도 등급 조회
 */
export function getSpellProficiencyRank(experience: number): SpellProficiencyRankInfo {
  const clamped = Math.max(0, Math.min(100, experience));

  for (let i = SPELL_PROFICIENCY_RANKS.length - 1; i >= 0; i--) {
    if (clamped >= SPELL_PROFICIENCY_RANKS[i].minExp) {
      return SPELL_PROFICIENCY_RANKS[i];
    }
  }

  return SPELL_PROFICIENCY_RANKS[0];
}

/**
 * 다음 등급까지 필요한 경험치
 */
export function getExpToNextRank(experience: number): number | null {
  const currentRank = getSpellProficiencyRank(experience);
  const currentIndex = SPELL_PROFICIENCY_RANKS.findIndex(
    (r) => r.id === currentRank.id
  );

  if (currentIndex === SPELL_PROFICIENCY_RANKS.length - 1) {
    return null; // 대가는 더 이상 없음
  }

  const nextRank = SPELL_PROFICIENCY_RANKS[currentIndex + 1];
  return nextRank.minExp - experience;
}

/**
 * 숙련도에 따른 보너스 계산
 */
export function getSpellBonuses(experience: number): {
  damageBonus: number;
  mpReduction: number;
  cooldownReduction: number;
} {
  const rank = getSpellProficiencyRank(experience);
  return {
    damageBonus: rank.damageBonus,
    mpReduction: rank.mpReduction,
    cooldownReduction: rank.cooldownReduction,
  };
}

// ============ 주문 요구 조건 체크 ============

export interface RequirementCheckResult {
  canCast: boolean;
  failureReasons: string[];
}

/**
 * 주문 시전 가능 여부 체크
 */
export function checkSpellRequirements(
  spell: Spell,
  options: {
    elementProficiency?: number;  // 해당 속성 숙련도
    karma?: number;
    piety?: number;
    religion?: string;
  }
): RequirementCheckResult {
  const req = spell.requirements;
  const reasons: string[] = [];

  // 숙련도 체크
  if (req.proficiency !== undefined) {
    const proficiency = options.elementProficiency ?? 0;
    if (proficiency < req.proficiency) {
      reasons.push(
        `${spell.element} 숙련도 ${req.proficiency} 필요 (현재: ${proficiency})`
      );
    }
  }

  // 카르마 체크
  if (req.karma !== undefined && options.karma !== undefined) {
    if (req.karma >= 0 && options.karma < req.karma) {
      reasons.push(`카르마 ${req.karma} 이상 필요 (현재: ${options.karma})`);
    }
    if (req.karma < 0 && options.karma > req.karma) {
      reasons.push(`카르마 ${req.karma} 이하 필요 (현재: ${options.karma})`);
    }
  }

  // 신앙심 체크
  if (req.piety !== undefined) {
    const piety = options.piety ?? 0;
    if (piety < req.piety) {
      reasons.push(`신앙심 ${req.piety} 필요 (현재: ${piety})`);
    }
  }

  // 종교 체크
  if (req.religion && options.religion !== req.religion) {
    reasons.push(`${req.religion} 종교 필요`);
  }

  return {
    canCast: reasons.length === 0,
    failureReasons: reasons,
  };
}

/**
 * 네스로스(죽음의 신) 신도의 치유 금기 체크
 */
export function checkHealingRestriction(
  spell: Spell,
  religion: string | undefined
): { allowed: boolean; penalty?: string } {
  if (spell.type !== "heal") {
    return { allowed: true };
  }

  if (religion === "nethros") {
    return {
      allowed: true, // 시전은 가능하지만 페널티
      penalty: "신앙심 -15 (죽음의 신 금기)",
    };
  }

  return { allowed: true };
}

// ============ 치유 보너스 계산 ============

/**
 * 종교에 따른 치유 보너스 배율 계산
 * - 솔라라: Piety에 따라 +0% ~ +30%
 * - 베르단티스: Piety에 따라 +0% ~ +15%
 * - 기타: +0%
 */
export function getReligionHealingBonus(
  religion: string | undefined,
  piety: number
): number {
  if (!religion) return 1.0;

  switch (religion) {
    case "solara":
      // 솔라라: Piety 75 이상에서 +20%, 100에서 +30%
      if (piety >= 100) return 1.3;
      if (piety >= 75) return 1.2;
      if (piety >= 50) return 1.15;
      if (piety >= 25) return 1.1;
      return 1.05;

    case "verdantis":
      // 베르단티스: 자연의 신, 약간의 치유 보너스
      if (piety >= 75) return 1.15;
      if (piety >= 50) return 1.1;
      if (piety >= 25) return 1.05;
      return 1.0;

    case "nethros":
      // 네스로스: 죽음의 신, 치유 페널티 (별도 처리)
      return 1.0; // 페널티는 Piety 감소로 처리

    default:
      return 1.0;
  }
}

/**
 * 치유량 계산 (종교 보너스 + 숙련도 보너스)
 */
export function calculateHealAmount(
  spell: Spell,
  maxHp: number,
  spellExperience: number,
  religion?: string,
  piety?: number
): number {
  if (spell.type !== "heal") return 0;

  // 기본 치유량 (퍼센트 기반)
  let baseHeal = 0;
  if (spell.effect?.healPercent) {
    baseHeal = Math.floor(maxHp * (spell.effect.healPercent / 100));
  }

  // 고정 치유량 (baseDamage 사용)
  if (spell.baseDamage > 0) {
    baseHeal += spell.baseDamage;
  }

  // 숙련도 보너스
  const proficiencyRank = getSpellProficiencyRank(spellExperience);
  const proficiencyBonus = 1 + proficiencyRank.damageBonus;

  // 종교 보너스
  const religionBonus = getReligionHealingBonus(religion, piety ?? 0);

  return Math.floor(baseHeal * proficiencyBonus * religionBonus);
}

/**
 * 네스로스 신도의 치유 페널티 정보
 */
export interface NethrosHealPenalty {
  hasPenalty: boolean;
  pietyLoss: number;
  warningMessage: string;
}

/**
 * 네스로스 치유 페널티 체크
 */
export function getNethrosHealPenalty(
  spell: Spell,
  religion: string | undefined
): NethrosHealPenalty {
  if (spell.type !== "heal" || religion !== "nethros") {
    return { hasPenalty: false, pietyLoss: 0, warningMessage: "" };
  }

  return {
    hasPenalty: true,
    pietyLoss: 15,
    warningMessage: "죽음의 신 금기: 치유 사용 시 신앙심 -15",
  };
}

// ============ 주문 데미지/효과 계산 ============

/**
 * 숙련도 보너스가 적용된 최종 MP 비용
 */
export function calculateFinalMpCost(
  spell: Spell,
  spellExperience: number
): number {
  const bonuses = getSpellBonuses(spellExperience);
  const reducedCost = spell.mpCost * (1 - bonuses.mpReduction);
  return Math.max(1, Math.floor(reducedCost));
}

/**
 * 숙련도 보너스가 적용된 최종 쿨다운
 */
export function calculateFinalCooldown(
  spell: Spell,
  spellExperience: number
): number {
  const bonuses = getSpellBonuses(spellExperience);
  return Math.max(0, spell.cooldown - bonuses.cooldownReduction);
}

/**
 * 숙련도 보너스가 적용된 기본 데미지
 * (실제 데미지는 damage.ts의 calculateMagicDamage에서 계산)
 */
export function calculateBoostedBaseDamage(
  spell: Spell,
  spellExperience: number
): number {
  const bonuses = getSpellBonuses(spellExperience);
  return Math.floor(spell.baseDamage * (1 + bonuses.damageBonus));
}

// ============ 주문 분류 유틸 ============

/**
 * 공격 주문인지 확인
 */
export function isAttackSpell(spell: Spell): boolean {
  return spell.type === "attack" || spell.type === "dot";
}

/**
 * 치유 주문인지 확인
 */
export function isHealingSpell(spell: Spell): boolean {
  return spell.type === "heal";
}

/**
 * 버프/디버프 주문인지 확인
 */
export function isBuffDebuffSpell(spell: Spell): boolean {
  return spell.type === "buff" || spell.type === "debuff";
}

/**
 * 특수 효과 주문인지 확인 (즉사, 석화 등)
 */
export function isSpecialSpell(spell: Spell): boolean {
  return spell.type === "special";
}

// ============ 포맷 유틸 ============

/**
 * 주문 숙련도 포맷
 */
export function formatSpellProficiency(experience: number): string {
  const rank = getSpellProficiencyRank(experience);
  return `${rank.nameKo} (${experience}/100)`;
}

/**
 * 주문 요구사항 포맷
 */
export function formatSpellRequirements(req: SpellRequirements): string[] {
  const lines: string[] = [];

  if (req.proficiency !== undefined && req.proficiency > 0) {
    lines.push(`숙련도 ${req.proficiency}`);
  }

  if (req.karma !== undefined) {
    if (req.karma >= 0) {
      lines.push(`카르마 +${req.karma} 이상`);
    } else {
      lines.push(`카르마 ${req.karma} 이하`);
    }
  }

  if (req.piety !== undefined) {
    lines.push(`신앙심 ${req.piety}`);
  }

  if (req.religion) {
    lines.push(`${req.religion} 신도`);
  }

  return lines;
}

/**
 * MP 비용 포맷 (숙련도 보너스 포함)
 */
export function formatMpCost(spell: Spell, spellExperience?: number): string {
  const originalCost = spell.mpCost;

  if (spellExperience === undefined) {
    return `${originalCost} MP`;
  }

  const finalCost = calculateFinalMpCost(spell, spellExperience);

  if (finalCost < originalCost) {
    return `${finalCost} MP (${originalCost}에서 감소)`;
  }

  return `${originalCost} MP`;
}

/**
 * 쿨다운 포맷
 */
export function formatCooldown(spell: Spell, spellExperience?: number): string {
  if (spell.cooldown === 0) {
    return "즉시 사용";
  }

  const finalCooldown = spellExperience !== undefined
    ? calculateFinalCooldown(spell, spellExperience)
    : spell.cooldown;

  return `${finalCooldown}턴 대기`;
}

/**
 * 주문 효과 텍스트 생성
 */
export function formatSpellEffect(spell: Spell): string {
  const effect = spell.effect;
  if (!effect) {
    if (spell.baseDamage > 0) {
      return `${spell.baseDamage} 피해`;
    }
    return "";
  }

  const parts: string[] = [];

  // 기본 피해
  if (spell.baseDamage > 0) {
    parts.push(`${spell.baseDamage} 피해`);
  }

  // DoT
  if (effect.damagePerTurn && effect.duration) {
    parts.push(`${effect.duration}턴간 매턴 ${effect.damagePerTurn} 피해`);
  }

  // 힐
  if (effect.healPercent) {
    parts.push(`HP ${effect.healPercent}% 회복`);
  }

  // 지속 회복
  if (effect.hotDuration && effect.hotPercent) {
    parts.push(`${effect.hotDuration}턴간 매턴 HP ${effect.hotPercent}% 회복`);
  }

  // 흡혈
  if (effect.lifesteal) {
    parts.push(`피해량의 ${effect.lifesteal * 100}% 회복`);
  }

  // 스턴
  if (effect.stunChance && effect.stunDuration) {
    parts.push(`${effect.stunChance * 100}% 확률로 ${effect.stunDuration}턴 기절`);
  }

  // 동결
  if (effect.freezeChance) {
    parts.push(`${effect.freezeChance * 100}% 확률로 동결`);
  }

  // 슬로우
  if (effect.slowDuration && effect.speedReduction) {
    parts.push(`${effect.slowDuration}턴간 속도 -${effect.speedReduction}%`);
  }

  // 즉사
  if (effect.instantKillChance) {
    parts.push(`${effect.instantKillChance * 100}% 즉사`);
  }

  // 저항
  if (effect.iceResist) {
    parts.push(`냉기 피해 -${(1 - effect.iceResist) * 100}%`);
  }
  if (effect.fireResist) {
    parts.push(`화염 피해 -${(1 - effect.fireResist) * 100}%`);
  }
  if (effect.physicalResist) {
    parts.push(`물리 피해 -${(1 - effect.physicalResist) * 100}%`);
  }

  // 반사
  if (effect.reflectDamage) {
    parts.push(`접촉자에게 ${effect.reflectDamage} 반사 피해`);
  }

  // 캐스팅
  if (effect.castTime) {
    parts.push(`${effect.castTime}턴 캐스팅`);
  }

  // 자해
  if (effect.selfDamage) {
    parts.push(`자신도 ${effect.selfDamage} 피해`);
  }

  // 보너스
  if (effect.bonusVsType) {
    parts.push(`${effect.bonusVsType.type}에게 ${effect.bonusVsType.multiplier}배`);
  }

  return parts.join(", ");
}
