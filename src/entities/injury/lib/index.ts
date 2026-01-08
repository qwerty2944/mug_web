import type { CharacterInjury, InjuryType, HealInjuryResult } from "../types";
import {
  INJURY_CONFIG,
  INJURY_OCCURRENCE_CONFIG,
  getInjuryLevelMultiplier,
  calculateNaturalHealTime,
  calculateTotalHpReduction,
} from "../types/constants";

// ============ 부상 발생 판정 ============

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
export function checkInjuryOccurrence(params: InjuryCheckParams): InjuryCheckResult {
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

// ============ 부상 치료 ============

interface HealParams {
  injury: CharacterInjury;
  healerProficiency: number;
  healerMedicalType: "first_aid" | "herbalism" | "surgery";
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

// ============ 자연 치유 체크 ============

/**
 * 자연 치유된 부상 필터링
 */
export function filterNaturallyHealedInjuries(
  injuries: CharacterInjury[]
): {
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

// ============ 부상 메시지 ============

/**
 * 부상 발생 메시지 생성
 */
export function getInjuryOccurredMessage(type: InjuryType, source?: string): string {
  const config = INJURY_CONFIG[type];
  const sourceText = source ? `${source}에게 ` : "";
  return `${sourceText}${config.icon} ${config.nameKo}을(를) 입었습니다! (최대 HP -${config.maxHpReduction * 100}%)`;
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

  const totalReduction = calculateTotalHpReduction(injuries);
  return `${summary.join(", ")} (최대 HP -${Math.floor(totalReduction * 100)}%)`;
}

// Re-export utilities
export { calculateTotalHpReduction, getInjuryConfig } from "../types/constants";
