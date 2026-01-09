/**
 * Trait Entity - Public API
 * 크루세이더 킹즈 스타일 특성 시스템
 */

// Types
export * from "./types";
export * from "./types/constants";

// API
export {
  fetchTraits,
  fetchTraitById,
  fetchCharacterTraits,
  grantTrait,
  removeTrait,
  grantMultipleTraits,
} from "./api";

// Queries
export {
  traitKeys,
  useTraits,
  useTrait,
  useTraitsByCategory,
  useVisibleTraits,
  useCharacterTraits,
  useCharacterTraitsWithDetails,
  useGrantTrait,
  useRemoveTrait,
  useGrantMultipleTraits,
} from "./queries";

// Lib
export {
  // Auto Detection
  detectQualifyingTraits,
  getCharacterCreationTraits,
  checkTraitConflict,
  checkConflictWithExisting,
  type CharacterInfo,
  // Effects
  calculateAggregatedEffects,
  applyStatModifiers,
  getSpecialEffectValue,
  getSpecialEffectMultiplier,
  getNPCDispositionModifier,
  getPhysicalDamageMultiplier,
  getMagicDamageMultiplier,
  getCriticalChanceBonus,
  getDodgeChanceBonus,
  getBlockChanceBonus,
  getAccuracyBonus,
  getFleeChanceBonus,
  getFearResistance,
  getDiseaseResistance,
  getPoisonResistance,
  getElementalResistance,
  getGoldGainMultiplier,
  getExpGainMultiplier,
  getRareDropBonus,
  getProficiencyGainMultiplier,
  getPurchaseCostMultiplier,
  getDualWieldBonus,
  getHealingPowerMultiplier,
  getIntimidationBonus,
  getPersuasionBonus,
  getNightBonusMultiplier,
  getDayBonusMultiplier,
  formatTraitEffects,
} from "./lib";

// UI Components
export { TraitBadge, TraitList, TraitTooltip } from "./ui";
