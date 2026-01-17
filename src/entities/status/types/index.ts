import type { MedicalType } from "@/entities/ability";

// ============ 상태이상 카테고리 ============

export type StatusCategory = "buff" | "debuff" | "injury";

// ============ 효과 타입 ============

export type EffectType =
  | "stat_modifier"       // 능력치 변경
  | "dot"                 // 지속 피해 (poison, burn)
  | "hot"                 // 지속 회복 (regen)
  | "shield"              // 보호막
  | "incapacitate"        // 행동 불가 (freeze, stun)
  | "silence"             // 마법 불가
  | "counter"             // 반격
  | "recovery_reduction"  // HP 회복 감소 (부상)
  | "ap_modifier";        // AP 소모량 변경 (비전 마법)

// ============ 버프 종류 ============

export type BuffType =
  | "atk_up"       // 공격력 증가
  | "def_up"       // 방어력 증가
  | "spd_up"       // 속도 증가
  | "regen"        // 지속 회복
  | "shield"       // 보호막
  | "magic_boost"  // 마법 데미지 증가
  | "counter"      // 반격 자세 (피해 반사)
  | "ap_cost_down"; // AP 소모 감소 (비전 마법)

// ============ 디버프 종류 ============

export type DebuffType =
  | "poison"      // 독 (지속 피해)
  | "burn"        // 화상 (지속 피해)
  | "freeze"      // 빙결 (행동 불가)
  | "slow"        // 둔화 (속도 감소)
  | "blind"       // 실명 (명중 감소)
  | "silence"     // 침묵 (마법 불가)
  | "weaken"      // 약화 (공격력 감소)
  | "stun"        // 기절 (행동 불가)
  | "ap_cost_up"; // AP 소모 증가 (비전 마법)

// ============ 부상 종류 ============

export type InjuryType = "light" | "medium" | "critical";

// ============ 통합 상태 타입 ============

export type StatusType = BuffType | DebuffType;

// ============ 상태 정의 (JSON에서 로드) ============

export interface StatusDefinition {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string;
  description: { ko: string; en: string };
  category: StatusCategory;
  defaultDuration: number;    // -1 = 영구 (부상)
  stackable: boolean;
  maxStacks: number;
  effectType: EffectType;
  targetStat?: string;        // stat_modifier용

  // 부상 전용 필드
  value?: number;             // 회복 감소율
  healMethod?: MedicalType;   // 치료 방법
  naturalHealTime?: number | null;  // 자연 치유 시간 (분)
  requiredProficiency?: number;
  color?: string;
}

// ============ 런타임 상태 효과 (전투 중) ============

export interface StatusEffect {
  id: string;                 // 인스턴스 고유 ID
  type: StatusType;           // 상태 타입
  category: StatusCategory;   // 카테고리
  nameKo: string;
  nameEn: string;
  icon: string;
  duration: number;           // 남은 턴 (-1 = 영구)
  value: number;              // 효과 수치
  stackable: boolean;
  currentStacks: number;
  maxStacks: number;
  source?: string;            // 원인 (스킬 ID, 몬스터 이름 등)
}

// ============ 부상 데이터 (DB 저장용) ============

export interface CharacterInjury {
  type: InjuryType;
  occurredAt: string;         // ISO timestamp
  source?: string;            // 몬스터 이름
  naturalHealAt?: string;     // 자연 치유 시각
}

// ============ 부상 설정 인터페이스 ============

export interface InjuryConfig {
  type: InjuryType;
  nameKo: string;
  nameEn: string;
  /**
   * HP 회복 제한율 (0.1 = 10%)
   * 마비노기 스타일: 최대 HP는 그대로, 회복 가능한 HP 상한만 감소
   */
  hpRecoveryReduction: number;
  healMethod: MedicalType;
  naturalHealTime: number | null;
  requiredProficiency: number;
  icon: string;
  color: string;
  description: string;
}

// ============ 부상 발생 조건 ============

export interface InjuryOccurrenceConfig {
  hpThreshold: number;
  levelDiffMultiplier: Record<number, number>;
  criticalHitMultiplier: number;
  baseChance: Record<InjuryType, number>;
}

// ============ 부상 발생 결과 ============

export interface InjuryOccurrenceResult {
  occurred: boolean;
  type?: InjuryType;
  injury?: CharacterInjury;
}

// ============ 부상 치료 결과 ============

export interface HealInjuryResult {
  success: boolean;
  healed?: CharacterInjury;
  message: string;
  proficiencyGain?: number;
}

// ============ 하위 호환성을 위한 상수 ============
// (기존 STATUS_DEFINITIONS 유지 - lib에서 동적 생성하도록 변경 예정)

export const STATUS_DEFINITIONS: Record<StatusType, Omit<StatusDefinition, 'id' | 'description'> & { type: StatusType; description: string }> = {
  // 버프
  atk_up: {
    type: "atk_up",
    category: "buff",
    nameKo: "공격 강화",
    nameEn: "Attack Up",
    icon: "⚔️",
    description: "공격력이 증가합니다.",
    defaultDuration: 4,
    stackable: false,
    maxStacks: 1,
    effectType: "stat_modifier",
    targetStat: "atk",
  },
  def_up: {
    type: "def_up",
    category: "buff",
    nameKo: "방어 강화",
    nameEn: "Defense Up",
    icon: "🛡️",
    description: "방어력이 증가합니다.",
    defaultDuration: 4,
    stackable: false,
    maxStacks: 1,
    effectType: "stat_modifier",
    targetStat: "def",
  },
  spd_up: {
    type: "spd_up",
    category: "buff",
    nameKo: "속도 강화",
    nameEn: "Speed Up",
    icon: "💨",
    description: "속도가 증가합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
    effectType: "stat_modifier",
    targetStat: "spd",
  },
  regen: {
    type: "regen",
    category: "buff",
    nameKo: "재생",
    nameEn: "Regeneration",
    icon: "💚",
    description: "매 턴 HP가 회복됩니다.",
    defaultDuration: 3,
    stackable: true,
    maxStacks: 3,
    effectType: "hot",
  },
  shield: {
    type: "shield",
    category: "buff",
    nameKo: "보호막",
    nameEn: "Shield",
    icon: "🔰",
    description: "피해를 흡수하는 보호막입니다.",
    defaultDuration: 5,
    stackable: false,
    maxStacks: 1,
    effectType: "shield",
  },
  magic_boost: {
    type: "magic_boost",
    category: "buff",
    nameKo: "마력 증폭",
    nameEn: "Magic Boost",
    icon: "✨",
    description: "마법 데미지가 증가합니다.",
    defaultDuration: 4,
    stackable: false,
    maxStacks: 1,
    effectType: "stat_modifier",
    targetStat: "magic",
  },
  counter: {
    type: "counter",
    category: "buff",
    nameKo: "반격 자세",
    nameEn: "Counter Stance",
    icon: "🥋",
    description: "받는 피해의 일부를 반사합니다.",
    defaultDuration: 2,
    stackable: false,
    maxStacks: 1,
    effectType: "counter",
  },
  ap_cost_down: {
    type: "ap_cost_down",
    category: "buff",
    nameKo: "시간 가속",
    nameEn: "Haste",
    icon: "⏱️",
    description: "AP 소모량이 감소합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
    effectType: "ap_modifier",
    targetStat: "ap",
  },

  // 디버프
  poison: {
    type: "poison",
    category: "debuff",
    nameKo: "독",
    nameEn: "Poison",
    icon: "☠️",
    description: "매 턴 독 피해를 받습니다.",
    defaultDuration: 4,
    stackable: true,
    maxStacks: 3,
    effectType: "dot",
  },
  burn: {
    type: "burn",
    category: "debuff",
    nameKo: "화상",
    nameEn: "Burn",
    icon: "🔥",
    description: "매 턴 화상 피해를 받습니다.",
    defaultDuration: 3,
    stackable: true,
    maxStacks: 3,
    effectType: "dot",
  },
  freeze: {
    type: "freeze",
    category: "debuff",
    nameKo: "빙결",
    nameEn: "Freeze",
    icon: "🧊",
    description: "행동할 수 없습니다.",
    defaultDuration: 1,
    stackable: false,
    maxStacks: 1,
    effectType: "incapacitate",
  },
  slow: {
    type: "slow",
    category: "debuff",
    nameKo: "둔화",
    nameEn: "Slow",
    icon: "🐌",
    description: "속도가 감소합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
    effectType: "stat_modifier",
    targetStat: "spd",
  },
  blind: {
    type: "blind",
    category: "debuff",
    nameKo: "실명",
    nameEn: "Blind",
    icon: "🌑",
    description: "명중률이 크게 감소합니다.",
    defaultDuration: 2,
    stackable: false,
    maxStacks: 1,
    effectType: "stat_modifier",
    targetStat: "accuracy",
  },
  silence: {
    type: "silence",
    category: "debuff",
    nameKo: "침묵",
    nameEn: "Silence",
    icon: "🤐",
    description: "마법을 사용할 수 없습니다.",
    defaultDuration: 2,
    stackable: false,
    maxStacks: 1,
    effectType: "silence",
  },
  weaken: {
    type: "weaken",
    category: "debuff",
    nameKo: "약화",
    nameEn: "Weaken",
    icon: "📉",
    description: "공격력이 감소합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
    effectType: "stat_modifier",
    targetStat: "atk",
  },
  stun: {
    type: "stun",
    category: "debuff",
    nameKo: "기절",
    nameEn: "Stun",
    icon: "💫",
    description: "기절하여 행동할 수 없습니다.",
    defaultDuration: 1,
    stackable: false,
    maxStacks: 1,
    effectType: "incapacitate",
  },
  ap_cost_up: {
    type: "ap_cost_up",
    category: "debuff",
    nameKo: "시간 둔화",
    nameEn: "Slow Time",
    icon: "⌛",
    description: "AP 소모량이 증가합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
    effectType: "ap_modifier",
    targetStat: "ap",
  },
};

// ============ 부상 설정 상수 ============

export const INJURY_CONFIG: Record<InjuryType, InjuryConfig> = {
  light: {
    type: "light",
    nameKo: "경상",
    nameEn: "Light Wound",
    hpRecoveryReduction: 0.10,
    healMethod: "first_aid",
    naturalHealTime: 30,
    requiredProficiency: 0,
    icon: "🩹",
    color: "#FBBF24",
    description: "가벼운 상처. 응급처치로 치료 가능.",
  },
  medium: {
    type: "medium",
    nameKo: "중상",
    nameEn: "Medium Wound",
    hpRecoveryReduction: 0.25,
    healMethod: "herbalism",
    naturalHealTime: 120,
    requiredProficiency: 20,
    icon: "🩸",
    color: "#F97316",
    description: "심각한 상처. 약초 치료가 필요.",
  },
  critical: {
    type: "critical",
    nameKo: "치명상",
    nameEn: "Critical Wound",
    hpRecoveryReduction: 0.50,
    healMethod: "surgery",
    naturalHealTime: null,
    requiredProficiency: 50,
    icon: "💀",
    color: "#EF4444",
    description: "생명이 위험한 상처. 수술이 필요.",
  },
};

// ============ 부상 발생 조건 설정 ============

export const INJURY_OCCURRENCE_CONFIG: InjuryOccurrenceConfig = {
  hpThreshold: 0.3,
  levelDiffMultiplier: {
    [-5]: 0.2,
    [-3]: 0.4,
    [-1]: 0.7,
    0: 1.0,
    1: 1.2,
    3: 1.5,
    5: 2.0,
  },
  criticalHitMultiplier: 2.0,
  baseChance: {
    light: 0.30,
    medium: 0.15,
    critical: 0.05,
  },
};

// ============ 부상 타입 목록 ============

export const INJURY_TYPES: InjuryType[] = ["light", "medium", "critical"];
