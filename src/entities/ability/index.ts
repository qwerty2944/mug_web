/**
 * Ability Entity - Public API
 * 스펠과 스킬을 통합한 어빌리티 시스템
 * (구 proficiency, skill 모듈 통합)
 */

// Types - Ability
export type {
  Ability,
  AbilitySource,
  AbilityType,
  AttackType,
  TargetType,
  AbilityLevelEffects,
  AbilityLevelBonus,
  AbilityRequirements,
  QueuedAbility,
  ActionQueue,
  MonsterAbility,
} from "./types";

// Types - Proficiency (from deprecated proficiency module)
export type {
  WeaponType,
  MagicElement,
  MedicalType,
  KnowledgeType,
  CraftingType,
  LifeSkillType,
  PhysicalAttackType,
  CombatProficiencyType,
  ProficiencyType,
  ProficiencyInfo,
  Proficiencies,
  WeaponBlockEffectType,
  WeaponBlockSpecial,
  WeaponBlockConfig,
  WeaponBlockInfo,
} from "./types";

// API
export {
  fetchAbilities,
  fetchAbilityById,
  fetchAbilitiesBySource,
  fetchAbilitiesByType,
  getEffectsAtLevel,
  getApCost,
  getMpCost,
  isPhysicalAttack,
  clearAbilityCache,
  // 몬스터 어빌리티
  fetchMonsterAbilities,
  fetchMonsterAbilityById,
  calculateMonsterAbilityDamage,
  // User Abilities (DB 연동)
  fetchUserAbilities,
  increaseAbilityExp,
  updateAbilitiesProgress,
  getAbilityLevel,
  checkAbilityRequirement,
  getLearnedAbilities,
  // Proficiency Constants & Functions (from deprecated proficiency module)
  WEAPON_PROFICIENCIES,
  MAGIC_PROFICIENCIES,
  CRAFTING_PROFICIENCIES,
  MEDICAL_PROFICIENCIES,
  KNOWLEDGE_PROFICIENCIES,
  ALL_PROFICIENCIES,
  DEFAULT_PROFICIENCIES,
  WEAPON_ATTACK_TYPE,
  WEAPON_BLOCK_CONFIG,
  ATTACK_TYPE_TO_KNOWLEDGE,
  useProficiencies,
  getProficiencyValue,
  getProficiencyInfo,
  getRankInfo,
  getDamageBonus,
  getDamageMultiplier,
  getDayBoostMultiplier,
  isWeaponProficiency,
  isMagicProficiency,
  getMagicEffectiveness,
  calculateProficiencyGain,
  canGainProficiency,
  calculateKnowledgeBonus,
} from "./api";
export type {
  RawMonsterAbility,
  AbilityProgress,
  UserAbilities,
  AbilityCategory,
  KnowledgeBonus,
} from "./api";

// Queries
export {
  abilityKeys,
  useAbilities,
  useAbility,
  useAbilitiesBySource,
  useAbilitiesByType,
  useAttackAbilities,
  useSpellAbilities,
  useCombatSkillAbilities,
  // User Abilities (DB)
  useUserAbilities,
  useIncreaseAbilityExp,
  useUpdateAbilitiesProgress,
} from "./queries";

// Level Magic Utilities (FF-style level-based magic)
export {
  checkLevelCondition,
  calculateLevelMagicEffect,
  getLevelMagicMessage,
  calculateApCostModifier,
  calculateFinalApCost,
} from "./lib/levelMagic";
export type { LevelMagicType, LevelMagicResult } from "./lib/levelMagic";
