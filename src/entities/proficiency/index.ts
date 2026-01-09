// Types
export type {
  WeaponType,
  MagicElement,
  ProficiencyType,
  ProficiencyCategory,
  ProficiencyRank,
  Proficiencies,
  ProficiencyInfo,
  RankInfo,
  MagicEffectiveness,
  AttackType,
  AttackTypeInfo,
  // 생활 스킬 타입
  CraftingType,
  MedicalType,
  KnowledgeType,
  LifeSkillType,
  CombatProficiencyType,
  // 카테고리별 숙련도 인터페이스
  WeaponProficiencies,
  MagicProficiencies,
  CraftingProficiencies,
  MedicalProficiencies,
  KnowledgeProficiencies,
} from "./types";

// Default values
export {
  DEFAULT_PROFICIENCIES,
  DEFAULT_WEAPON_PROFICIENCIES,
  DEFAULT_MAGIC_PROFICIENCIES,
  DEFAULT_CRAFTING_PROFICIENCIES,
  DEFAULT_MEDICAL_PROFICIENCIES,
  DEFAULT_KNOWLEDGE_PROFICIENCIES,
} from "./types";

// Constants
export {
  WEAPON_PROFICIENCIES,
  MAGIC_PROFICIENCIES,
  ALL_PROFICIENCIES,
  PROFICIENCY_RANKS,
  MAGIC_EFFECTIVENESS,
  WEAPON_TYPES,
  MAGIC_ELEMENTS,
  MAX_PROFICIENCY,
  MIN_PROFICIENCY,
  EFFECTIVENESS_MULTIPLIER,
  // 요일별 속성 강화
  DAY_ELEMENT_BOOST,
  DAY_BOOST_MULTIPLIER,
  DAY_NAMES_KO,
  // 공격 타입
  ATTACK_TYPE_INFO,
  WEAPON_ATTACK_TYPE,
  ATTACK_TYPES,
  // 무기막기 시스템
  WEAPON_BLOCK_CONFIG,
  // 생활 스킬 상수
  CRAFTING_PROFICIENCIES,
  MEDICAL_PROFICIENCIES,
  KNOWLEDGE_PROFICIENCIES,
  LIFE_SKILL_PROFICIENCIES,
  ALL_PROFICIENCIES_EXTENDED,
  CRAFTING_TYPES,
  MEDICAL_TYPES,
  KNOWLEDGE_TYPES,
  LIFE_SKILL_TYPES,
  // 레벨 기반 숙련도 획득
  LEVEL_DIFF_PROFICIENCY_CHANCE,
  getProficiencyGainChance,
  RANK_GAIN_MULTIPLIER,
  // 지식 스킬 보너스
  KNOWLEDGE_BONUS_PER_RANK,
  calculateKnowledgeBonus,
  ATTACK_TYPE_TO_KNOWLEDGE,
} from "./types/constants";

// 무기막기 타입 export
export type {
  WeaponBlockSpecial,
  WeaponBlockInfo,
  KnowledgeBonus,
} from "./types/constants";

// API
export {
  fetchProficiencies,
  increaseProficiency,
  setProficiency,
  getCategoryForType,
  getProficiencyValue,
} from "./api";

// Queries
export { useProficiencies, proficiencyKeys } from "./queries";

// Lib (Utilities)
export {
  getRank,
  getRankInfo,
  getPointsToNextRank,
  getRankProgress,
  getDamageBonus,
  getSpeedBonus,
  getDamageMultiplier,
  getMagicEffectiveness,
  getMagicEffectivenessText,
  getProficiencyInfo,
  isWeaponProficiency,
  isMagicProficiency,
  formatProficiencyLevel,
  formatProficiencySummary,
  // 요일별 속성 강화
  getTodayBoostedElement,
  getDayBoostedElement,
  getDayBoostMultiplier,
  getTodayBoostInfo,
  // 레벨 기반 숙련도 획득
  calculateProficiencyGain,
  calculateKnowledgeGain,
  canGainProficiency,
  getProficiencyGainMessage,
  getKnowledgeGainMessage,
} from "./lib";

// 숙련도 획득 타입
export type {
  ProficiencyGainResult,
  ProficiencyGainParams,
  KnowledgeGainResult,
  KnowledgeGainParams,
} from "./lib";
