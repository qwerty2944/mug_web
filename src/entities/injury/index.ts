// Types
export type {
  InjuryType,
  CharacterInjury,
  InjuryConfig,
  InjuryOccurrenceConfig,
  HealInjuryResult,
} from "./types";

// Constants
export {
  INJURY_CONFIG,
  INJURY_OCCURRENCE_CONFIG,
  INJURY_TYPES,
  getInjuryLevelMultiplier,
  getInjuryConfig,
  calculateTotalHpReduction,
  calculateNaturalHealTime,
} from "./types/constants";

// Lib (Utilities)
export {
  checkInjuryOccurrence,
  attemptHealInjury,
  filterNaturallyHealedInjuries,
  getInjuryOccurredMessage,
  getInjurySummaryMessage,
} from "./lib";
