/**
 * 레벨 기반 마법 유틸리티 (파이널 판타지 스타일)
 * 대상의 레벨이 특정 숫자의 배수일 때 특수 효과 발동
 */

// ============ 레벨 조건 체크 ============

/**
 * 레벨 조건 충족 여부 확인
 * @param targetLevel 대상의 레벨
 * @param divisor 나눌 숫자 (예: 5면 레벨이 5의 배수일 때)
 * @returns 조건 충족 여부
 */
export function checkLevelCondition(
  targetLevel: number,
  divisor: number
): boolean {
  if (divisor <= 0) return false;
  return targetLevel % divisor === 0;
}

// ============ 레벨 마법 타입 ============

export type LevelMagicType = "death" | "graviga" | "flare" | "old";

export interface LevelMagicResult {
  success: boolean;           // 레벨 조건 충족 여부
  damage: number;             // 데미지 (0 = 데미지 없음)
  instantKill: boolean;       // 즉사 여부
  debuff?: string;            // 부여할 디버프
  debuffValue?: number;       // 디버프 수치
  debuffDuration?: number;    // 디버프 지속 시간
}

// ============ 레벨 마법 데미지 계산 ============

/**
 * 레벨 기반 마법 효과 계산
 * @param type 레벨 마법 타입
 * @param targetLevel 대상 레벨
 * @param targetCurrentHp 대상 현재 HP
 * @param targetMaxHp 대상 최대 HP
 * @param baseDamage 기본 데미지 (flare용)
 * @param effects 추가 효과 옵션
 * @returns 마법 효과 결과
 */
export function calculateLevelMagicEffect(
  type: LevelMagicType,
  targetLevel: number,
  targetCurrentHp: number,
  targetMaxHp: number,
  baseDamage: number = 0,
  effects?: {
    levelCondition?: number;
    fallbackDamage?: number;
    debuffValue?: number;
    debuffDuration?: number;
  }
): LevelMagicResult {
  const divisor = effects?.levelCondition ?? getLevelDivisor(type);
  const conditionMet = checkLevelCondition(targetLevel, divisor);

  // 조건 불충족 시 기본 결과 (fallback damage 있으면 적용)
  if (!conditionMet) {
    return {
      success: false,
      damage: effects?.fallbackDamage ?? 0,
      instantKill: false,
    };
  }

  // 레벨 마법 타입별 효과
  switch (type) {
    case "death":
      // 즉사
      return {
        success: true,
        damage: targetCurrentHp,
        instantKill: true,
      };

    case "graviga":
      // 현재 HP의 75% 피해
      return {
        success: true,
        damage: Math.floor(targetCurrentHp * 0.75),
        instantKill: false,
      };

    case "flare":
      // 최대 HP 50% + 기본 데미지
      return {
        success: true,
        damage: Math.floor(targetMaxHp * 0.5) + baseDamage,
        instantKill: false,
      };

    case "old":
      // 약화 디버프
      return {
        success: true,
        damage: 0,
        instantKill: false,
        debuff: "weaken",
        debuffValue: effects?.debuffValue ?? 25,
        debuffDuration: effects?.debuffDuration ?? 5,
      };

    default:
      return {
        success: false,
        damage: 0,
        instantKill: false,
      };
  }
}

/**
 * 레벨 마법 타입별 기본 나눗수 반환
 */
function getLevelDivisor(type: LevelMagicType): number {
  switch (type) {
    case "death":
      return 5;
    case "graviga":
      return 4;
    case "flare":
      return 3;
    case "old":
      return 2;
    default:
      return 1;
  }
}

// ============ 레벨 마법 메시지 ============

/**
 * 레벨 마법 발동 메시지 생성
 */
export function getLevelMagicMessage(
  type: LevelMagicType,
  targetName: string,
  result: LevelMagicResult
): string {
  if (!result.success) {
    return `${targetName}의 레벨이 조건을 충족하지 않습니다!`;
  }

  switch (type) {
    case "death":
      return `☠️ ${targetName}이(가) 레벨 5 데스에 당했다! 즉사!`;
    case "graviga":
      return `🕳️ ${targetName}에게 중력이 작용한다! ${result.damage} 피해!`;
    case "flare":
      return `🌟 ${targetName}을(를) 플레어가 강타한다! ${result.damage} 피해!`;
    case "old":
      return `👴 ${targetName}이(가) 노화되었다! 약화 상태!`;
    default:
      return "";
  }
}

// ============ AP 비용 조정 계산 ============

import type { StatusEffect } from "@/entities/status";

/**
 * AP 비용 수정 배율 계산
 * @param statusEffects 현재 적용된 상태이상 목록
 * @returns AP 비용 배율 (1.0 = 기본, 0.8 = 20% 감소, 1.5 = 50% 증가)
 */
export function calculateApCostModifier(
  statusEffects: StatusEffect[]
): number {
  let modifier = 1.0;

  for (const effect of statusEffects) {
    if (effect.type === "ap_cost_down") {
      // AP 감소: value가 20이면 20% 감소 → 0.8배
      modifier *= 1 - effect.value / 100;
    }
    if (effect.type === "ap_cost_up") {
      // AP 증가: value가 50이면 50% 증가 → 1.5배
      modifier *= 1 + effect.value / 100;
    }
  }

  // 최소 0.5배, 최대 3.0배로 제한
  return Math.max(0.5, Math.min(3.0, modifier));
}

/**
 * 최종 AP 비용 계산
 * @param baseApCost 기본 AP 비용
 * @param statusEffects 현재 적용된 상태이상 목록
 * @returns 수정된 AP 비용 (올림)
 */
export function calculateFinalApCost(
  baseApCost: number,
  statusEffects: StatusEffect[]
): number {
  const modifier = calculateApCostModifier(statusEffects);
  return Math.ceil(baseApCost * modifier);
}
