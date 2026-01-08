import type {
  ProficiencyRank,
  RankInfo,
  MagicElement,
  ProficiencyType,
  ProficiencyInfo,
} from "../types";
import {
  PROFICIENCY_RANKS,
  MAGIC_EFFECTIVENESS,
  EFFECTIVENESS_MULTIPLIER,
  ALL_PROFICIENCIES,
  WEAPON_PROFICIENCIES,
  MAGIC_PROFICIENCIES,
  DAY_ELEMENT_BOOST,
  DAY_BOOST_MULTIPLIER,
  DAY_NAMES_KO,
} from "../types/constants";

// ============ 등급 관련 ============

/**
 * 숙련도 레벨로 등급 ID 가져오기
 */
export function getRank(level: number): ProficiencyRank {
  const rankInfo = getRankInfo(level);
  return rankInfo.id;
}

/**
 * 숙련도 레벨로 등급 정보 가져오기
 */
export function getRankInfo(level: number): RankInfo {
  const clampedLevel = Math.max(0, Math.min(100, level));
  const rank = PROFICIENCY_RANKS.find(
    (r) => clampedLevel >= r.min && clampedLevel <= r.max
  );
  return rank || PROFICIENCY_RANKS[0];
}

/**
 * 다음 등급까지 필요한 포인트
 */
export function getPointsToNextRank(level: number): number {
  const currentRank = getRankInfo(level);
  if (currentRank.id === "grandmaster") return 0;

  const nextRankIndex = PROFICIENCY_RANKS.findIndex((r) => r.id === currentRank.id) + 1;
  if (nextRankIndex >= PROFICIENCY_RANKS.length) return 0;

  return PROFICIENCY_RANKS[nextRankIndex].min - level;
}

/**
 * 현재 등급 내 진행률 (0-100%)
 */
export function getRankProgress(level: number): number {
  const rank = getRankInfo(level);
  if (rank.id === "grandmaster") return 100;

  const rangeSize = rank.max - rank.min + 1;
  const progress = level - rank.min;
  return Math.round((progress / rangeSize) * 100);
}

// ============ 보너스 관련 ============

/**
 * 데미지 보너스 계산 (%)
 */
export function getDamageBonus(level: number): number {
  const rank = getRankInfo(level);
  return rank.damageBonus;
}

/**
 * 속도 보너스 계산 (%)
 */
export function getSpeedBonus(level: number): number {
  const rank = getRankInfo(level);
  return rank.speedBonus;
}

/**
 * 숙련도 기반 데미지 배율 계산
 */
export function getDamageMultiplier(level: number): number {
  const bonus = getDamageBonus(level);
  return 1 + bonus / 100;
}

// ============ 마법 상성 ============

/**
 * 마법 상성 데미지 배율 계산
 * @returns 1.5 (강함), 1.0 (보통), 0.5 (약함)
 */
export function getMagicEffectiveness(
  attackerElement: MagicElement,
  defenderElement: MagicElement
): number {
  if (attackerElement === defenderElement) {
    return EFFECTIVENESS_MULTIPLIER.NORMAL;
  }

  const effectiveness = MAGIC_EFFECTIVENESS[attackerElement];
  if (effectiveness.strong === defenderElement) {
    return EFFECTIVENESS_MULTIPLIER.STRONG;
  }
  if (effectiveness.weak === defenderElement) {
    return EFFECTIVENESS_MULTIPLIER.WEAK;
  }

  return EFFECTIVENESS_MULTIPLIER.NORMAL;
}

/**
 * 마법 상성 텍스트 가져오기
 */
export function getMagicEffectivenessText(
  attackerElement: MagicElement,
  defenderElement: MagicElement
): { text: string; color: string } {
  const multiplier = getMagicEffectiveness(attackerElement, defenderElement);

  if (multiplier === EFFECTIVENESS_MULTIPLIER.STRONG) {
    return { text: "효과적!", color: "#22c55e" }; // green
  }
  if (multiplier === EFFECTIVENESS_MULTIPLIER.WEAK) {
    return { text: "효과 없음", color: "#ef4444" }; // red
  }
  return { text: "", color: "" };
}

// ============ 숙련도 정보 조회 ============

/**
 * 숙련도 타입으로 정보 가져오기
 */
export function getProficiencyInfo(type: ProficiencyType): ProficiencyInfo | undefined {
  return ALL_PROFICIENCIES.find((p) => p.id === type);
}

/**
 * 무기 숙련인지 확인
 */
export function isWeaponProficiency(type: ProficiencyType): boolean {
  return WEAPON_PROFICIENCIES.some((p) => p.id === type);
}

/**
 * 마법 숙련인지 확인
 */
export function isMagicProficiency(type: ProficiencyType): boolean {
  return MAGIC_PROFICIENCIES.some((p) => p.id === type);
}

// ============ 표시용 ============

/**
 * 숙련도 레벨 텍스트 포맷
 */
export function formatProficiencyLevel(level: number): string {
  const rank = getRankInfo(level);
  return `${level} (${rank.nameKo})`;
}

/**
 * 숙련도 요약 텍스트
 */
export function formatProficiencySummary(type: ProficiencyType, level: number): string {
  const info = getProficiencyInfo(type);
  const rank = getRankInfo(level);
  if (!info) return `${type}: ${level}`;
  return `${info.icon} ${info.nameKo} ${level} (${rank.nameKo})`;
}

// ============ 요일별 속성 강화 ============

/**
 * 오늘 강화되는 속성 가져오기
 */
export function getTodayBoostedElement(): MagicElement | null {
  const day = new Date().getDay();
  return DAY_ELEMENT_BOOST[day];
}

/**
 * 특정 날짜의 강화 속성 가져오기
 */
export function getDayBoostedElement(date: Date): MagicElement | null {
  return DAY_ELEMENT_BOOST[date.getDay()];
}

/**
 * 요일 강화 배율 계산
 * @param element 확인할 속성
 * @param date 날짜 (기본값: 오늘)
 * @returns 강화 중이면 1.2, 아니면 1.0
 */
export function getDayBoostMultiplier(element: MagicElement, date?: Date): number {
  const targetDate = date ?? new Date();
  const boostedElement = getDayBoostedElement(targetDate);

  if (boostedElement === element) {
    return DAY_BOOST_MULTIPLIER;
  }
  return 1.0;
}

/**
 * 오늘의 강화 정보 가져오기
 */
export function getTodayBoostInfo(): {
  element: MagicElement | null;
  dayNameKo: string;
  multiplier: number;
} {
  const day = new Date().getDay();
  const element = DAY_ELEMENT_BOOST[day];
  return {
    element,
    dayNameKo: DAY_NAMES_KO[day],
    multiplier: element ? DAY_BOOST_MULTIPLIER : 1.0,
  };
}

// ============ 레벨 기반 숙련도 획득 ============

export {
  calculateProficiencyGain,
  calculateKnowledgeGain,
  canGainProficiency,
  getProficiencyGainMessage,
  getKnowledgeGainMessage,
  type ProficiencyGainResult,
  type ProficiencyGainParams,
  type KnowledgeGainResult,
  type KnowledgeGainParams,
} from "./gain";
