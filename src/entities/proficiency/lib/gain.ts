import type { ProficiencyType, ProficiencyRank, AttackType, KnowledgeType } from "../types";
import {
  getProficiencyGainChance,
  RANK_GAIN_MULTIPLIER,
  ATTACK_TYPE_TO_KNOWLEDGE,
} from "../types/constants";
import { getRank } from "./index";

// ============ 레벨 기반 숙련도 획득 ============

export interface ProficiencyGainResult {
  type: ProficiencyType;
  gained: boolean;
  amount: number;
  levelDiff: number;
  chance: number;
  reason: "level_too_low" | "chance_failed" | "success";
}

export interface ProficiencyGainParams {
  proficiencyType: ProficiencyType;
  currentProficiency: number;
  playerLevel: number;
  monsterLevel: number;
  attackSuccess?: boolean;
}

/**
 * 레벨 기반 숙련도 획득 계산
 * - 약한 몬스터(-2레벨 이하)에게는 숙련도 획득 불가
 * - 레벨 차이가 클수록 높은 확률로 획득
 * - 고랭크일수록 획득량 감소
 */
export function calculateProficiencyGain(
  params: ProficiencyGainParams
): ProficiencyGainResult {
  const {
    proficiencyType,
    currentProficiency,
    playerLevel,
    monsterLevel,
    attackSuccess = true,
  } = params;

  const levelDiff = monsterLevel - playerLevel;
  const chance = getProficiencyGainChance(levelDiff);

  // 공격 실패 시 획득 없음
  if (!attackSuccess) {
    return {
      type: proficiencyType,
      gained: false,
      amount: 0,
      levelDiff,
      chance: 0,
      reason: "chance_failed",
    };
  }

  // 레벨이 너무 낮으면 획득 불가
  if (chance === 0) {
    return {
      type: proficiencyType,
      gained: false,
      amount: 0,
      levelDiff,
      chance: 0,
      reason: "level_too_low",
    };
  }

  // 확률 체크
  const roll = Math.random();
  if (roll > chance) {
    return {
      type: proficiencyType,
      gained: false,
      amount: 0,
      levelDiff,
      chance,
      reason: "chance_failed",
    };
  }

  // 랭크별 획득량 배율
  const rank = getRank(currentProficiency);
  const multiplier = RANK_GAIN_MULTIPLIER[rank];
  const amount = Math.ceil(1 * multiplier);

  return {
    type: proficiencyType,
    gained: true,
    amount,
    levelDiff,
    chance,
    reason: "success",
  };
}

// ============ 지식 스킬 획득 ============

export interface KnowledgeGainResult {
  type: KnowledgeType;
  gained: boolean;
  amount: number;
  reason: "no_match" | "chance_failed" | "success";
}

export interface KnowledgeGainParams {
  attackType: AttackType;
  currentKnowledgeProficiency: number;
  attackSuccess: boolean;
  baseChance?: number;
}

/**
 * 공격 타입에 따른 지식 스킬 획득
 * - slash/pierce: anatomy
 * - crush: metallurgy
 */
export function calculateKnowledgeGain(
  params: KnowledgeGainParams
): KnowledgeGainResult {
  const {
    attackType,
    currentKnowledgeProficiency,
    attackSuccess,
    baseChance = 0.15,
  } = params;

  const knowledgeType = ATTACK_TYPE_TO_KNOWLEDGE[attackType];

  if (!attackSuccess) {
    return {
      type: knowledgeType,
      gained: false,
      amount: 0,
      reason: "chance_failed",
    };
  }

  // 확률 체크
  const roll = Math.random();
  if (roll > baseChance) {
    return {
      type: knowledgeType,
      gained: false,
      amount: 0,
      reason: "chance_failed",
    };
  }

  // 랭크별 획득량 배율
  const rank = getRank(currentKnowledgeProficiency);
  const multiplier = RANK_GAIN_MULTIPLIER[rank];
  const amount = Math.ceil(1 * multiplier);

  return {
    type: knowledgeType,
    gained: true,
    amount,
    reason: "success",
  };
}

// ============ 유틸리티 ============

/**
 * 레벨 차이에 따른 획득 가능 여부 확인
 */
export function canGainProficiency(
  playerLevel: number,
  monsterLevel: number
): boolean {
  const levelDiff = monsterLevel - playerLevel;
  return getProficiencyGainChance(levelDiff) > 0;
}

/**
 * 숙련도 획득 메시지 생성
 */
export function getProficiencyGainMessage(result: ProficiencyGainResult): string | null {
  if (!result.gained) {
    if (result.reason === "level_too_low") {
      return "너무 약한 상대로부터는 배울 것이 없다...";
    }
    return null;
  }

  return `${result.type} 숙련도가 ${result.amount} 상승했습니다.`;
}

/**
 * 지식 스킬 획득 메시지 생성
 */
export function getKnowledgeGainMessage(result: KnowledgeGainResult): string | null {
  if (!result.gained) return null;

  const nameMap: Record<KnowledgeType, string> = {
    anatomy: "해부학",
    metallurgy: "금속학",
    botany: "식물학",
    gemology: "보석학",
  };

  return `${nameMap[result.type]} 지식이 ${result.amount} 상승했습니다.`;
}
