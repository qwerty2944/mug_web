import type { MedicalType } from "@/entities/proficiency";

// ============ 부상 타입 ============

export type InjuryType = "light" | "medium" | "critical";

// ============ 부상 상태 인터페이스 ============

export interface CharacterInjury {
  type: InjuryType;
  occurredAt: string;     // ISO timestamp
  source?: string;        // 원인 (몬스터명 등)
  naturalHealAt?: string; // 자연 치유 예상 시간 (ISO timestamp)
}

// ============ 부상 설정 인터페이스 ============

export interface InjuryConfig {
  type: InjuryType;
  nameKo: string;
  nameEn: string;
  /**
   * HP 회복 제한율 (0.1 = 10%)
   * 마비노기 스타일: 최대 HP는 그대로, 회복 가능한 HP 상한만 감소
   * 예: maxHp=100, hpRecoveryReduction=0.2 → 회복 가능 HP = 80
   */
  hpRecoveryReduction: number;
  healMethod: MedicalType;      // 치료 가능한 의료 스킬
  naturalHealTime: number | null;  // 자연 치유 시간 (분), null = 불가
  requiredProficiency: number;  // 치료에 필요한 최소 숙련도
  icon: string;
  color: string;                // UI 색상
  description: string;
}

// ============ 부상 발생 조건 ============

export interface InjuryOccurrenceConfig {
  // HP가 이 비율 이하일 때 부상 발생 가능
  hpThreshold: number;          // 0.3 = 30%

  // 레벨 차이에 따른 부상 확률 배율
  levelDiffMultiplier: Record<number, number>;

  // 치명타 피격 시 확률 배율
  criticalHitMultiplier: number;

  // 기본 부상 발생 확률
  baseChance: Record<InjuryType, number>;
}

// ============ 부상 치료 결과 ============

export interface HealInjuryResult {
  success: boolean;
  healed?: CharacterInjury;
  message: string;
  proficiencyGain?: number;     // 치료 성공 시 의료 숙련도 획득
}
