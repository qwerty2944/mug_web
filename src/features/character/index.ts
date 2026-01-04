import type { CharacterPanelHooks } from "@/shared/types";
import {
  useAppearancePart,
  useAppearanceAnimation,
  useAppearanceColor,
  useAppearanceActions,
  PART_TYPES,
} from "./model";

// Model (stores, hooks)
export {
  useAppearanceStore,
  useProfileStore,
  useAppearancePart,
  useAppearanceAnimation,
  useAppearanceColor,
  useAppearanceActions,
  useUnityBridge,
  PART_TYPES,
  STARTER_PRESETS,
  GENDERS,
  RACES,
  BASE_STATS,
  BONUS_POINTS,
  MAX_STAT,
  MIN_STAT,
  STAT_NAMES,
  calculateTotalStats,
  type PartType,
  type StarterPreset,
  type Gender,
  type Race,
  type BodyType,
  type CharacterStats,
} from "./model";

// UI Components
export {
  PartSelector,
  ColorPicker,
  AnimationSelector,
  ActionButtons,
  UnityCanvas,
  CharacterConfirmModal,
} from "./ui";

// 위젯 주입용 훅 객체
export const characterPanelHooks: CharacterPanelHooks = {
  usePart: useAppearancePart,
  useAnimation: useAppearanceAnimation,
  useColor: useAppearanceColor,
  useActions: useAppearanceActions,
  partTypes: PART_TYPES,
};
