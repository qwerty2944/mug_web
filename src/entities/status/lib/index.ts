import type {
  StatusEffect,
  StatusType,
  StatusCategory,
  CharacterInjury,
  InjuryType,
  HealInjuryResult,
} from "../types";
import {
  STATUS_DEFINITIONS,
  INJURY_CONFIG,
  INJURY_OCCURRENCE_CONFIG,
  INJURY_TYPES,
} from "../types";

// =====================================
// 상태이상 효과 유틸리티
// =====================================

/**
 * 새 상태이상 효과 생성
 */
export function createStatusEffect(
  type: StatusType,
  value: number,
  duration?: number,
  source?: string
): StatusEffect {
  const def = STATUS_DEFINITIONS[type];
  return {
    id: `${type}_${Date.now()}`,
    type,
    category: def.category,
    nameKo: def.nameKo,
    nameEn: def.nameEn,
    icon: def.icon,
    duration: duration ?? def.defaultDuration,
    value,
    stackable: def.stackable,
    currentStacks: 1,
    maxStacks: def.maxStacks,
    source,
  };
}

/**
 * 상태이상 배열에 새 효과 추가 (중첩 처리 포함)
 */
export function addStatusEffect(
  effects: StatusEffect[],
  newEffect: StatusEffect
): StatusEffect[] {
  const existing = effects.find((e) => e.type === newEffect.type);

  if (existing) {
    if (existing.stackable && existing.currentStacks < existing.maxStacks) {
      // 중첩 가능하면 스택 증가
      return effects.map((e) =>
        e.type === newEffect.type
          ? {
              ...e,
              currentStacks: e.currentStacks + 1,
              duration: Math.max(e.duration, newEffect.duration),
            }
          : e
      );
    } else {
      // 중첩 불가면 지속시간만 갱신
      return effects.map((e) =>
        e.type === newEffect.type
          ? { ...e, duration: Math.max(e.duration, newEffect.duration) }
          : e
      );
    }
  }

  // 새 효과 추가
  return [...effects, newEffect];
}

/**
 * 상태이상 제거
 */
export function removeStatusEffect(
  effects: StatusEffect[],
  effectId: string
): StatusEffect[] {
  return effects.filter((e) => e.id !== effectId);
}

/**
 * 특정 타입의 상태이상 제거
 */
export function removeStatusByType(
  effects: StatusEffect[],
  type: StatusType
): StatusEffect[] {
  return effects.filter((e) => e.type !== type);
}

/**
 * 지속시간 감소 (턴 종료 시)
 */
export function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((e) => ({ ...e, duration: e.duration - 1 }))
    .filter((e) => e.duration > 0);
}

/**
 * DoT(Damage over Time) 피해 계산
 */
export function calculateDotDamage(effects: StatusEffect[]): number {
  let damage = 0;
  for (const effect of effects) {
    if (effect.type === "poison" || effect.type === "burn") {
      damage += effect.value * effect.currentStacks;
    }
  }
  return damage;
}

/**
 * 리젠(HoT) 회복량 계산
 */
export function calculateRegenHeal(effects: StatusEffect[]): number {
  let heal = 0;
  for (const effect of effects) {
    if (effect.type === "regen") {
      heal += effect.value * effect.currentStacks;
    }
  }
  return heal;
}

/**
 * 스탯 수정치 계산
 */
export function calculateStatModifier(
  effects: StatusEffect[],
  statType: "atk" | "def" | "spd" | "magic"
): number {
  let modifier = 0;

  for (const effect of effects) {
    switch (effect.type) {
      case "atk_up":
        if (statType === "atk") modifier += effect.value;
        break;
      case "def_up":
        if (statType === "def") modifier += effect.value;
        break;
      case "spd_up":
        if (statType === "spd") modifier += effect.value;
        break;
      case "magic_boost":
        if (statType === "magic") modifier += effect.value;
        break;
      case "weaken":
        if (statType === "atk") modifier -= effect.value;
        break;
      case "slow":
        if (statType === "spd") modifier -= effect.value;
        break;
    }
  }

  return modifier;
}

/**
 * 특정 상태이상 보유 여부 확인
 */
export function hasStatus(effects: StatusEffect[], type: StatusType): boolean {
  return effects.some((e) => e.type === type);
}

/**
 * 행동 불가 상태 확인 (빙결, 기절 등)
 */
export function isIncapacitated(effects: StatusEffect[]): boolean {
  return hasStatus(effects, "freeze") || hasStatus(effects, "stun");
}

/**
 * 마법 사용 불가 상태 확인 (침묵)
 */
export function isSilenced(effects: StatusEffect[]): boolean {
  return hasStatus(effects, "silence");
}

/**
 * 버프만 필터
 */
export function getBuffs(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter((e) => e.category === "buff");
}

/**
 * 디버프만 필터
 */
export function getDebuffs(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter((e) => e.category === "debuff");
}

/**
 * 보호막 남은 양 반환
 */
export function getShieldAmount(effects: StatusEffect[]): number {
  const shield = effects.find((e) => e.type === "shield");
  return shield?.value ?? 0;
}

/**
 * 보호막 피해 적용
 */
export function applyDamageToShield(
  effects: StatusEffect[],
  damage: number
): { effects: StatusEffect[]; remainingDamage: number } {
  const shieldIdx = effects.findIndex((e) => e.type === "shield");

  if (shieldIdx === -1) {
    return { effects, remainingDamage: damage };
  }

  const shield = effects[shieldIdx];
  const newShieldValue = shield.value - damage;

  if (newShieldValue <= 0) {
    // 보호막 파괴
    return {
      effects: effects.filter((_, i) => i !== shieldIdx),
      remainingDamage: Math.abs(newShieldValue),
    };
  }

  // 보호막 감소
  return {
    effects: effects.map((e, i) =>
      i === shieldIdx ? { ...e, value: newShieldValue } : e
    ),
    remainingDamage: 0,
  };
}

// =====================================
// 부상 시스템 유틸리티
// =====================================

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
export function getInjuryConfig(type: InjuryType) {
  return INJURY_CONFIG[type];
}

/**
 * 총 HP 회복 제한율 계산 (여러 부상 누적)
 * 마비노기 스타일: 최대 HP는 불변, 회복 가능한 HP 상한만 감소
 */
export function calculateTotalRecoveryReduction(
  injuries: { type: InjuryType }[]
): number {
  let totalReduction = 0;

  for (const injury of injuries) {
    totalReduction += INJURY_CONFIG[injury.type].hpRecoveryReduction;
  }

  // 최대 80%까지만 감소 (최소 20% HP까지는 회복 가능)
  return Math.min(0.8, totalReduction);
}

// 하위 호환성을 위한 alias
export const calculateTotalHpReduction = calculateTotalRecoveryReduction;

/**
 * 자연 치유 예상 시간 계산
 */
export function calculateNaturalHealTime(type: InjuryType): Date | null {
  const config = INJURY_CONFIG[type];
  if (config.naturalHealTime === null) return null;

  const now = new Date();
  return new Date(now.getTime() + config.naturalHealTime * 60 * 1000);
}

// =====================================
// 부상 발생 판정
// =====================================

interface InjuryCheckParams {
  currentHp: number;
  maxHp: number;
  playerLevel: number;
  monsterLevel: number;
  monsterNameKo?: string;
  isCriticalHit?: boolean;
}

interface InjuryCheckResult {
  occurred: boolean;
  injury?: CharacterInjury;
  type?: InjuryType;
}

/**
 * 부상 발생 여부 판정
 * - HP가 30% 이하일 때만 발생
 * - 몬스터 레벨이 높을수록 확률 증가
 * - 치명타 피격 시 확률 2배
 */
export function checkInjuryOccurrence(
  params: InjuryCheckParams
): InjuryCheckResult {
  const {
    currentHp,
    maxHp,
    playerLevel,
    monsterLevel,
    monsterNameKo,
    isCriticalHit = false,
  } = params;

  // HP가 threshold 이하가 아니면 부상 발생 안함
  const hpRatio = currentHp / maxHp;
  if (hpRatio > INJURY_OCCURRENCE_CONFIG.hpThreshold) {
    return { occurred: false };
  }

  // 레벨 차이에 따른 배율
  const levelDiff = monsterLevel - playerLevel;
  const levelMultiplier = getInjuryLevelMultiplier(levelDiff);

  // 치명타 배율
  const critMultiplier = isCriticalHit
    ? INJURY_OCCURRENCE_CONFIG.criticalHitMultiplier
    : 1.0;

  // 부상 등급 결정 (높은 등급부터 체크)
  const roll = Math.random();

  // 치명상 체크
  const criticalChance =
    INJURY_OCCURRENCE_CONFIG.baseChance.critical *
    levelMultiplier *
    critMultiplier;
  if (roll < criticalChance) {
    return createInjuryResult("critical", monsterNameKo);
  }

  // 중상 체크
  const mediumChance =
    INJURY_OCCURRENCE_CONFIG.baseChance.medium *
    levelMultiplier *
    critMultiplier;
  if (roll < criticalChance + mediumChance) {
    return createInjuryResult("medium", monsterNameKo);
  }

  // 경상 체크
  const lightChance =
    INJURY_OCCURRENCE_CONFIG.baseChance.light *
    levelMultiplier *
    critMultiplier;
  if (roll < criticalChance + mediumChance + lightChance) {
    return createInjuryResult("light", monsterNameKo);
  }

  return { occurred: false };
}

function createInjuryResult(
  type: InjuryType,
  source?: string
): InjuryCheckResult {
  const now = new Date().toISOString();
  const naturalHealAt = calculateNaturalHealTime(type);

  return {
    occurred: true,
    type,
    injury: {
      type,
      occurredAt: now,
      source,
      naturalHealAt: naturalHealAt?.toISOString(),
    },
  };
}

// =====================================
// 부상 치료
// =====================================

interface HealParams {
  injury: CharacterInjury;
  healerProficiency: number;
  healerMedicalType: "first_aid" | "herbalism" | "surgery";
}

function getMedicalRank(type: "first_aid" | "herbalism" | "surgery"): number {
  switch (type) {
    case "first_aid":
      return 1;
    case "herbalism":
      return 2;
    case "surgery":
      return 3;
    default:
      return 0;
  }
}

function getMedicalNameKo(type: "first_aid" | "herbalism" | "surgery"): string {
  switch (type) {
    case "first_aid":
      return "응급처치";
    case "herbalism":
      return "약초학";
    case "surgery":
      return "수술";
    default:
      return "의료";
  }
}

/**
 * 부상 치료 시도
 */
export function attemptHealInjury(params: HealParams): HealInjuryResult {
  const { injury, healerProficiency, healerMedicalType } = params;
  const config = INJURY_CONFIG[injury.type];

  // 치료 가능한 의료 스킬 체크
  if (config.healMethod !== healerMedicalType) {
    // 상위 의료 스킬로 하위 부상 치료 가능
    const healMethodRank = getMedicalRank(config.healMethod);
    const healerMethodRank = getMedicalRank(healerMedicalType);

    if (healerMethodRank < healMethodRank) {
      return {
        success: false,
        message: `${config.nameKo}은(는) ${getMedicalNameKo(config.healMethod)} 스킬로 치료해야 합니다.`,
      };
    }
  }

  // 숙련도 체크
  if (healerProficiency < config.requiredProficiency) {
    return {
      success: false,
      message: `${config.nameKo} 치료에는 ${getMedicalNameKo(config.healMethod)} 숙련도 ${config.requiredProficiency} 이상이 필요합니다.`,
    };
  }

  // 치료 성공
  return {
    success: true,
    healed: injury,
    message: `${config.nameKo}을(를) 성공적으로 치료했습니다.`,
    proficiencyGain: 1,
  };
}

// =====================================
// 자연 치유 체크
// =====================================

/**
 * 자연 치유된 부상 필터링
 */
export function filterNaturallyHealedInjuries(injuries: CharacterInjury[]): {
  remaining: CharacterInjury[];
  healed: CharacterInjury[];
} {
  const now = new Date();
  const remaining: CharacterInjury[] = [];
  const healed: CharacterInjury[] = [];

  for (const injury of injuries) {
    // 자연 치유 불가능한 부상 (치명상)
    if (!injury.naturalHealAt) {
      remaining.push(injury);
      continue;
    }

    const healTime = new Date(injury.naturalHealAt);
    if (now >= healTime) {
      healed.push(injury);
    } else {
      remaining.push(injury);
    }
  }

  return { remaining, healed };
}

// =====================================
// 부상 메시지
// =====================================

/**
 * 부상 발생 메시지 생성
 */
export function getInjuryOccurredMessage(
  type: InjuryType,
  source?: string
): string {
  const config = INJURY_CONFIG[type];
  const sourceText = source ? `${source}에게 ` : "";
  return `${sourceText}${config.icon} ${config.nameKo}을(를) 입었습니다! (HP 회복 상한 -${config.hpRecoveryReduction * 100}%)`;
}

/**
 * 부상 상태 요약 메시지
 */
export function getInjurySummaryMessage(injuries: CharacterInjury[]): string {
  if (injuries.length === 0) return "부상 없음";

  const summary = injuries.map((injury) => {
    const config = INJURY_CONFIG[injury.type];
    return `${config.icon} ${config.nameKo}`;
  });

  const totalReduction = calculateTotalRecoveryReduction(injuries);
  return `${summary.join(", ")} (HP 회복 상한 -${Math.floor(totalReduction * 100)}%)`;
}

// Re-export types for convenience
export { INJURY_TYPES };
