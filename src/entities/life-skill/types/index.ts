import type {
  CraftingType,
  MedicalType,
  KnowledgeType,
  LifeSkillType,
} from "@/entities/proficiency";

// Re-export types from proficiency
export type { CraftingType, MedicalType, KnowledgeType, LifeSkillType };

// ============ 생활 스킬 카테고리 ============

export type LifeSkillCategory = "crafting" | "medical" | "knowledge";

// ============ 생활 스킬 요구 조건 ============

export interface LifeSkillRequirement {
  skillType: LifeSkillType;
  minProficiency: number;
  relatedSkills?: LifeSkillType[];  // 시너지 스킬
}

// ============ 제작 결과 ============

export interface CraftingResult {
  success: boolean;
  quality?: "crude" | "common" | "fine" | "masterwork";
  itemId?: string;
  proficiencyGain?: number;
  message: string;
}

// ============ 치료 결과 ============

export interface MedicalResult {
  success: boolean;
  healAmount?: number;
  proficiencyGain?: number;
  message: string;
}
