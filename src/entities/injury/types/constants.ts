import type { InjuryType, InjuryConfig, InjuryOccurrenceConfig } from "./index";

// ============ 부상 설정 ============

export const INJURY_CONFIG: Record<InjuryType, InjuryConfig> = {
  light: {
    type: "light",
    nameKo: "경상",
    nameEn: "Light Wound",
    maxHpReduction: 0.10,       // 최대 HP 10% 감소
    healMethod: "first_aid",
    naturalHealTime: 30,        // 30분 자연치유
    requiredProficiency: 0,     // 누구나 치료 가능
    icon: "🩹",
    color: "#FBBF24",           // yellow-400
    description: "가벼운 상처. 응급처치로 치료 가능.",
  },
  medium: {
    type: "medium",
    nameKo: "중상",
    nameEn: "Medium Wound",
    maxHpReduction: 0.25,       // 최대 HP 25% 감소
    healMethod: "herbalism",
    naturalHealTime: 120,       // 2시간 자연치유
    requiredProficiency: 20,    // 랭크 F 이상
    icon: "🩸",
    color: "#F97316",           // orange-500
    description: "심각한 상처. 약초 치료가 필요.",
  },
  critical: {
    type: "critical",
    nameKo: "치명상",
    nameEn: "Critical Wound",
    maxHpReduction: 0.50,       // 최대 HP 50% 감소
    healMethod: "surgery",
    naturalHealTime: null,      // 자연치유 불가
    requiredProficiency: 50,    // 랭크 C 이상
    icon: "💀",
    color: "#EF4444",           // red-500
    description: "생명이 위험한 상처. 수술이 필요.",
  },
};

// ============ 부상 발생 조건 설정 ============

export const INJURY_OCCURRENCE_CONFIG: InjuryOccurrenceConfig = {
  // HP가 30% 이하일 때 부상 발생 가능
  hpThreshold: 0.3,

  // 레벨 차이에 따른 부상 확률 배율 (몬스터레벨 - 플레이어레벨)
  levelDiffMultiplier: {
    [-5]: 0.2,   // 5레벨 이하 몬스터: 20%
    [-3]: 0.4,   // 3레벨 이하: 40%
    [-1]: 0.7,   // 1레벨 이하: 70%
    0: 1.0,      // 동레벨: 100%
    1: 1.2,      // 1레벨 이상: 120%
    3: 1.5,      // 3레벨 이상: 150%
    5: 2.0,      // 5레벨 이상: 200%
  },

  // 치명타 피격 시 확률 2배
  criticalHitMultiplier: 2.0,

  // 기본 부상 발생 확률 (HP 30% 이하일 때)
  baseChance: {
    light: 0.30,    // 30%
    medium: 0.15,   // 15%
    critical: 0.05, // 5%
  },
};

// ============ 부상 타입 목록 ============

export const INJURY_TYPES: InjuryType[] = ["light", "medium", "critical"];

// ============ 유틸리티 함수 ============

/**
 * 레벨 차이에 따른 부상 확률 배율 계산
 */
export function getInjuryLevelMultiplier(levelDiff: number): number {
  if (levelDiff >= 5) return INJURY_OCCURRENCE_CONFIG.levelDiffMultiplier[5];
  if (levelDiff >= 3) return INJURY_OCCURRENCE_CONFIG.levelDiffMultiplier[3];
  if (levelDiff >= 1) return INJURY_OCCURRENCE_CONFIG.levelDiffMultiplier[1];
  if (levelDiff >= 0) return INJURY_OCCURRENCE_CONFIG.levelDiffMultiplier[0];
  if (levelDiff >= -1) return INJURY_OCCURRENCE_CONFIG.levelDiffMultiplier[-1];
  if (levelDiff >= -3) return INJURY_OCCURRENCE_CONFIG.levelDiffMultiplier[-3];
  return INJURY_OCCURRENCE_CONFIG.levelDiffMultiplier[-5];
}

/**
 * 부상 정보 가져오기
 */
export function getInjuryConfig(type: InjuryType): InjuryConfig {
  return INJURY_CONFIG[type];
}

/**
 * 총 최대 HP 감소율 계산 (여러 부상 누적)
 */
export function calculateTotalHpReduction(injuries: { type: InjuryType }[]): number {
  let totalReduction = 0;

  for (const injury of injuries) {
    totalReduction += INJURY_CONFIG[injury.type].maxHpReduction;
  }

  // 최대 80%까지만 감소 (최소 HP 20% 보장)
  return Math.min(0.8, totalReduction);
}

/**
 * 자연 치유 예상 시간 계산
 */
export function calculateNaturalHealTime(type: InjuryType): Date | null {
  const config = INJURY_CONFIG[type];
  if (config.naturalHealTime === null) return null;

  const now = new Date();
  return new Date(now.getTime() + config.naturalHealTime * 60 * 1000);
}
