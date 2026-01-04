// 외형 스토어 (Unity 연동)
export {
  useAppearanceStore,
  useAppearancePart,
  useAppearanceAnimation,
  useAppearanceColor,
  useAppearanceActions,
  PART_TYPES,
  type PartType,
  type CharacterState,
  type SpriteCounts,
  type AnimationState,
} from "./appearanceStore";

// 프로필 스토어 (캐릭터 생성 설정)
export { useProfileStore } from "./profileStore";

// Unity 브릿지
export { useUnityBridge } from "./useUnityBridge";

// 프리셋 및 상수
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
