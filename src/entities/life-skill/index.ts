// Types
export type {
  CraftingType,
  MedicalType,
  KnowledgeType,
  LifeSkillType,
  LifeSkillCategory,
  LifeSkillRequirement,
  CraftingResult,
  MedicalResult,
} from "./types";

// Constants
export {
  LIFE_SKILL_CATEGORY,
  KNOWLEDGE_CRAFTING_SYNERGY,
  KNOWLEDGE_CRAFTING_BONUS_PER_RANK,
  MEDICAL_SKILL_HIERARCHY,
  CRAFTING_QUALITY_CHANCE,
  isLifeSkillType,
  isCraftingSkill,
  isMedicalSkill,
  isKnowledgeSkill,
  canHealWithMedicalSkill,
} from "./types/constants";

// Knowledge utilities
export {
  getKnowledgeAttackBonus,
  getKnowledgeMagicBonus,
  getKnowledgePoisonBonus,
  getKnowledgeHealingBonus,
  getKnowledgeDefenseBonus,
  getRelatedKnowledgeSkill,
  getFullKnowledgeBonus,
} from "./lib/knowledge";
