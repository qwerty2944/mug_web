/**
 * Trait Auto-Detection System
 * 캐릭터 정보를 기반으로 조건 충족 트레이트를 자동 감지
 */

import type {
  Trait,
  TraitRequirement,
  StatType,
  HandednessType,
  TraitSource,
} from "../types";

// ============ 캐릭터 정보 타입 ============

export interface CharacterInfo {
  stats: Partial<Record<StatType, number>>;
  handedness?: HandednessType;
  // 외형 정보 (오드아이 감지용)
  appearance?: {
    leftEyeColor?: string;
    rightEyeColor?: string;
    bodyType?: string;
    hairColor?: string;
  };
}

// ============ 조건 체크 함수 ============

/**
 * 스탯 조건 체크
 */
function checkStatRequirement(
  requirement: TraitRequirement,
  stats: CharacterInfo["stats"]
): boolean {
  if (!requirement.stat) return false;

  const { stat, operator, value } = requirement.stat;
  const actualValue = stats[stat] ?? 0;

  switch (operator) {
    case ">=":
      return actualValue >= value;
    case "<=":
      return actualValue <= value;
    case "==":
      return actualValue === value;
    case ">":
      return actualValue > value;
    default:
      return false;
  }
}

/**
 * 외형 조건 체크
 */
function checkAppearanceRequirement(
  requirement: TraitRequirement,
  appearance: CharacterInfo["appearance"]
): boolean {
  if (!requirement.appearance || !appearance) return false;

  const { type, value } = requirement.appearance;

  switch (type) {
    case "odd_eyes":
      // 오드아이: 좌우 눈 색상이 다름
      return (
        !!appearance.leftEyeColor &&
        !!appearance.rightEyeColor &&
        appearance.leftEyeColor !== appearance.rightEyeColor
      );
    case "body_type":
      return appearance.bodyType === value;
    case "hair_color":
      return appearance.hairColor === value;
    default:
      return false;
  }
}

/**
 * 손잡이 조건 체크
 */
function checkHandednessRequirement(
  requirement: TraitRequirement,
  handedness: HandednessType | undefined
): boolean {
  if (!requirement.handedness) return false;
  return handedness === requirement.handedness;
}

/**
 * 단일 요구사항 체크
 */
function checkRequirement(
  requirement: TraitRequirement,
  character: CharacterInfo
): boolean {
  switch (requirement.type) {
    case "stat":
      return checkStatRequirement(requirement, character.stats);
    case "appearance":
      return checkAppearanceRequirement(requirement, character.appearance);
    case "handedness":
      return checkHandednessRequirement(requirement, character.handedness);
    case "birth":
      // 생성 시 조건은 별도 처리 (항상 true로 판단, 선택에 따름)
      return true;
    case "event":
    case "hidden":
      // 이벤트/히든 조건은 자동 감지 불가
      return false;
    default:
      return false;
  }
}

// ============ 메인 감지 함수 ============

/**
 * 조건 충족 트레이트 감지 (캐릭터 생성 시)
 * 이벤트/히든 조건은 제외하고 스탯/외형/손잡이 조건만 체크
 */
export function detectQualifyingTraits(
  allTraits: Trait[],
  character: CharacterInfo
): Trait[] {
  return allTraits.filter((trait) => {
    // 이벤트/히든 트레이트는 자동 감지 제외
    if (trait.hidden) return false;

    // 요구사항이 없는 트레이트는 자동 감지 제외 (수동 부여 필요)
    if (!trait.requirements || trait.requirements.length === 0) return false;

    // 이벤트/히든 조건만 있는 트레이트는 제외
    const autoDetectableRequirements = trait.requirements.filter(
      (req) => req.type !== "event" && req.type !== "hidden"
    );
    if (autoDetectableRequirements.length === 0) return false;

    // 모든 자동 감지 조건 충족 여부 체크
    return autoDetectableRequirements.every((req) =>
      checkRequirement(req, character)
    );
  });
}

/**
 * 캐릭터 생성 시 자동 부여할 트레이트 목록 반환
 * 충돌 검사 포함
 */
export function getCharacterCreationTraits(
  allTraits: Trait[],
  character: CharacterInfo,
  selectedBirthTraits: string[] = [] // 캐릭터 생성 시 선택한 출생 트레이트
): { traitId: string; source: TraitSource; sourceDetail?: string }[] {
  const result: { traitId: string; source: TraitSource; sourceDetail?: string }[] = [];
  const addedTraitIds = new Set<string>();

  // 1. 선택한 출생 트레이트 추가
  for (const traitId of selectedBirthTraits) {
    result.push({ traitId, source: "birth", sourceDetail: "캐릭터 생성 시 선택" });
    addedTraitIds.add(traitId);
  }

  // 2. 자동 감지 트레이트 추가
  const detectedTraits = detectQualifyingTraits(allTraits, character);

  for (const trait of detectedTraits) {
    // 이미 추가된 트레이트는 건너뛰기
    if (addedTraitIds.has(trait.id)) continue;

    // 충돌 체크
    const hasConflict = trait.conflicts?.some((conflict) =>
      addedTraitIds.has(conflict.traitId)
    );
    if (hasConflict) continue;

    // 추가된 트레이트와 충돌하는지도 체크
    const existingTraits = allTraits.filter((t) => addedTraitIds.has(t.id));
    const conflictsWithExisting = existingTraits.some((existing) =>
      existing.conflicts?.some((c) => c.traitId === trait.id)
    );
    if (conflictsWithExisting) continue;

    // 요구사항 타입에 따라 소스 결정
    const primaryReq = trait.requirements?.[0];
    let sourceDetail: string | undefined;

    if (primaryReq?.type === "stat") {
      sourceDetail = `${primaryReq.stat?.stat.toUpperCase()} ${primaryReq.stat?.operator} ${primaryReq.stat?.value}`;
    } else if (primaryReq?.type === "appearance") {
      sourceDetail = primaryReq.appearance?.type;
    } else if (primaryReq?.type === "handedness") {
      sourceDetail = primaryReq.handedness;
    }

    result.push({
      traitId: trait.id,
      source: "birth",
      sourceDetail: sourceDetail ? `자동 감지: ${sourceDetail}` : "자동 감지",
    });
    addedTraitIds.add(trait.id);
  }

  return result;
}

/**
 * 두 트레이트가 충돌하는지 체크
 */
export function checkTraitConflict(
  traitA: Trait,
  traitB: Trait
): { conflicts: boolean; reason?: string } {
  // A가 B와 충돌하는지
  const conflictA = traitA.conflicts?.find((c) => c.traitId === traitB.id);
  if (conflictA) {
    return { conflicts: true, reason: conflictA.reason };
  }

  // B가 A와 충돌하는지
  const conflictB = traitB.conflicts?.find((c) => c.traitId === traitA.id);
  if (conflictB) {
    return { conflicts: true, reason: conflictB.reason };
  }

  return { conflicts: false };
}

/**
 * 새 트레이트가 기존 트레이트 목록과 충돌하는지 체크
 */
export function checkConflictWithExisting(
  newTrait: Trait,
  existingTraits: Trait[]
): { conflicts: boolean; conflictingTraits: string[]; reasons: string[] } {
  const conflictingTraits: string[] = [];
  const reasons: string[] = [];

  for (const existing of existingTraits) {
    const result = checkTraitConflict(newTrait, existing);
    if (result.conflicts) {
      conflictingTraits.push(existing.id);
      if (result.reason) reasons.push(result.reason);
    }
  }

  return {
    conflicts: conflictingTraits.length > 0,
    conflictingTraits,
    reasons,
  };
}
