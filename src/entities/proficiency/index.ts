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
} from "./types/constants";

// API
export {
  fetchProficiencies,
  increaseProficiency,
  setProficiency,
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
} from "./lib";
