/**
 * 상태이상 엔티티
 *
 * 버프, 디버프, 부상을 통합 관리
 *
 * @example
 * ```typescript
 * import {
 *   useStatuses,
 *   createStatusEffect,
 *   checkInjuryOccurrence,
 *   INJURY_CONFIG,
 *   InjuryDisplay,
 * } from "@/entities/status";
 *
 * // 상태이상 조회
 * const { data: statuses } = useStatuses();
 *
 * // 상태 효과 생성
 * const poison = createStatusEffect("poison", 10);
 *
 * // 부상 발생 체크
 * const result = checkInjuryOccurrence({
 *   currentHp: 30,
 *   maxHp: 100,
 *   playerLevel: 5,
 *   monsterLevel: 7,
 * });
 * ```
 */

// =====================================
// Types
// =====================================

export type {
  // 카테고리 & 효과 타입
  StatusCategory,
  EffectType,
  // 상태 타입
  BuffType,
  DebuffType,
  StatusType,
  InjuryType,
  // 정의 & 효과
  StatusDefinition,
  StatusEffect,
  // 부상 관련
  CharacterInjury,
  InjuryConfig,
  InjuryOccurrenceConfig,
  InjuryOccurrenceResult,
  HealInjuryResult,
} from "./types";

// =====================================
// Constants (from types)
// =====================================

export {
  STATUS_DEFINITIONS,
  INJURY_CONFIG,
  INJURY_OCCURRENCE_CONFIG,
  INJURY_TYPES,
} from "./types";

// =====================================
// API (JSON Loading)
// =====================================

export {
  fetchStatuses,
  fetchStatusesByCategory,
  fetchStatusById,
  fetchBuffs,
  fetchDebuffs,
  fetchInjuries,
} from "./api";

// =====================================
// Queries (React Query Hooks)
// =====================================

export {
  useStatuses,
  useStatusesByCategory,
  useStatus,
  useBuffs,
  useDebuffs,
  useInjuryDefinitions,
  statusKeys,
} from "./queries";

// =====================================
// Lib (Utilities)
// =====================================

// 상태 효과 유틸
export {
  createStatusEffect,
  addStatusEffect,
  removeStatusEffect,
  removeStatusByType,
  tickStatusEffects,
  calculateDotDamage,
  calculateRegenHeal,
  calculateStatModifier,
  hasStatus,
  isIncapacitated,
  isSilenced,
  getBuffs,
  getDebuffs,
  getShieldAmount,
  applyDamageToShield,
} from "./lib";

// 부상 유틸
export {
  getInjuryLevelMultiplier,
  getInjuryConfig,
  calculateTotalRecoveryReduction,
  calculateTotalHpReduction, // alias for backwards compatibility
  calculateNaturalHealTime,
  checkInjuryOccurrence,
  attemptHealInjury,
  filterNaturallyHealedInjuries,
  getInjuryOccurredMessage,
  getInjurySummaryMessage,
} from "./lib";

// =====================================
// UI Components
// =====================================

export { InjuryDisplay } from "./ui";
