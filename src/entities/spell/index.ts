// ============ Public API ============

// Types
export type {
  SpellType,
  SpellTarget,
  SpellRequirements,
  SpellEffect,
  SpellDescription,
  Spell,
  SpellsData,
  SpellProficiency,
  SpellProficiencyRank,
  SpellProficiencyRankInfo,
  SpellCategory,
  SpellCategoryInfo,
} from "./types";

export {
  SPELL_PROFICIENCY_RANKS,
  SPELL_CATEGORIES,
} from "./types";

// API
export {
  fetchSpells,
  fetchSpellById,
  fetchSpellsByElement,
  fetchHealingSpells,
  fetchAttackSpells,
  fetchSpellProficiencies,
  fetchSpellProficiency,
  increaseSpellProficiency,
} from "./api";

// Queries
export {
  spellKeys,
  useSpells,
  useSpellsByElement,
  useSpellsByType,
  useSpell,
  useHealingSpells,
  useAttackSpells,
  useSpellProficiencies,
  useSpellProficiency,
  useIncreaseSpellProficiency,
  useAvailableSpells,
  useSpellsGroupedByElement,
} from "./queries";

// Lib (Utilities)
export {
  // 숙련도
  getSpellProficiencyRank,
  getExpToNextRank,
  getSpellBonuses,

  // 요구 조건
  checkSpellRequirements,
  checkHealingRestriction,

  // 치유 보너스
  getReligionHealingBonus,
  calculateHealAmount,
  getNethrosHealPenalty,

  // 계산
  calculateFinalMpCost,
  calculateFinalCooldown,
  calculateBoostedBaseDamage,

  // 분류
  isAttackSpell,
  isHealingSpell,
  isBuffDebuffSpell,
  isSpecialSpell,

  // 포맷
  formatSpellProficiency,
  formatSpellRequirements,
  formatMpCost,
  formatCooldown,
  formatSpellEffect,
} from "./lib";

export type { RequirementCheckResult, NethrosHealPenalty } from "./lib";
