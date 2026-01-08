import type {
  CraftingType,
  MedicalType,
  KnowledgeType,
  LifeSkillType,
} from "@/entities/proficiency";
import type { LifeSkillCategory } from "./index";

// ============ 스킬 카테고리 매핑 ============

export const LIFE_SKILL_CATEGORY: Record<LifeSkillType, LifeSkillCategory> = {
  // 제작
  blacksmithing: "crafting",
  tailoring: "crafting",
  cooking: "crafting",
  alchemy: "crafting",
  jewelcrafting: "crafting",
  // 의료
  first_aid: "medical",
  herbalism: "medical",
  surgery: "medical",
  // 지식
  anatomy: "knowledge",
  metallurgy: "knowledge",
  botany: "knowledge",
  gemology: "knowledge",
};

// ============ 지식-제작 시너지 ============

// 어떤 지식 스킬이 어떤 제작 스킬에 보너스를 주는지
export const KNOWLEDGE_CRAFTING_SYNERGY: Record<KnowledgeType, CraftingType[]> = {
  anatomy: [],                              // 전투 전용
  metallurgy: ["blacksmithing"],           // 대장장이
  botany: ["alchemy", "cooking"],          // 연금, 요리
  gemology: ["jewelcrafting"],             // 보석세공
};

// 지식 스킬 보너스: 랭크당 제작 품질 확률 +2%
export const KNOWLEDGE_CRAFTING_BONUS_PER_RANK = 0.02;

// ============ 의료 스킬 계층 ============

// 상위 스킬은 하위 부상도 치료 가능
export const MEDICAL_SKILL_HIERARCHY: Record<MedicalType, MedicalType[]> = {
  first_aid: ["first_aid"],                            // 경상만
  herbalism: ["first_aid", "herbalism"],              // 경상 + 중상
  surgery: ["first_aid", "herbalism", "surgery"],     // 모든 부상
};

// ============ 제작 품질 확률 ============

// 숙련도 랭크별 품질 확률
export const CRAFTING_QUALITY_CHANCE = {
  novice: { crude: 0.40, common: 0.55, fine: 0.05, masterwork: 0 },
  apprentice: { crude: 0.20, common: 0.60, fine: 0.18, masterwork: 0.02 },
  journeyman: { crude: 0.05, common: 0.50, fine: 0.38, masterwork: 0.07 },
  expert: { crude: 0, common: 0.30, fine: 0.55, masterwork: 0.15 },
  master: { crude: 0, common: 0.10, fine: 0.60, masterwork: 0.30 },
  grandmaster: { crude: 0, common: 0, fine: 0.50, masterwork: 0.50 },
};

// ============ 유틸리티 함수 ============

/**
 * 생활 스킬 타입인지 확인
 */
export function isLifeSkillType(type: string): type is LifeSkillType {
  return type in LIFE_SKILL_CATEGORY;
}

/**
 * 제작 스킬인지 확인
 */
export function isCraftingSkill(type: LifeSkillType): type is CraftingType {
  return LIFE_SKILL_CATEGORY[type] === "crafting";
}

/**
 * 의료 스킬인지 확인
 */
export function isMedicalSkill(type: LifeSkillType): type is MedicalType {
  return LIFE_SKILL_CATEGORY[type] === "medical";
}

/**
 * 지식 스킬인지 확인
 */
export function isKnowledgeSkill(type: LifeSkillType): type is KnowledgeType {
  return LIFE_SKILL_CATEGORY[type] === "knowledge";
}

/**
 * 의료 스킬로 치료 가능한 부상 레벨 확인
 */
export function canHealWithMedicalSkill(
  medicalType: MedicalType,
  requiredMethod: MedicalType
): boolean {
  return MEDICAL_SKILL_HIERARCHY[medicalType].includes(requiredMethod);
}
