export {
  useCharacterStore,
  useCharacterPart,
  useCharacterAnimation,
  useCharacterColor,
  useCharacterActions,
  PART_TYPES,
  type PartType,
  type CharacterState,
  type SpriteCounts,
  type AnimationState,
} from "./store";

export { useUnityBridge } from "./useUnityBridge";

export {
  STARTER_PRESETS,
  GENDERS,
  RACES,
  BASE_STATS,
  BONUS_POINTS,
  MAX_STAT,
  MIN_STAT,
  STAT_NAMES,
  calculateTotalStats,
  type StarterPreset,
  type Gender,
  type Race,
  type BodyType,
  type CharacterStats,
} from "./presets";
