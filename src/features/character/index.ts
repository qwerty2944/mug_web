import type { CharacterPanelHooks } from "@/shared/types";
import {
  useAppearancePart,
  useAppearanceAnimation,
  useAppearanceColor,
  useAppearanceActions,
  useWeaponColor,
  useWeaponActions,
  useHandWeapon,
  PART_TYPES,
  WEAPON_PART_TYPES,
} from "@/application/stores";

// Stores (re-export from application stores)
export {
  useAppearanceStore,
  useProfileStore,
  useAppearancePart,
  useAppearanceAnimation,
  useAppearanceColor,
  useAppearanceActions,
  PART_TYPES,
  type PartType,
} from "@/application/stores";

// Unity (from application/providers)
export { useUnityBridge } from "@/application/providers";

// Presets (keep in model)
export {
  GENDERS,
  RACES,
  BASE_STATS,
  BONUS_POINTS,
  MAX_STAT,
  MIN_STAT,
  STAT_NAMES,
  calculateTotalStats,
  type Gender,
  type Race,
  type BodyType,
  type CharacterStats,
} from "./types";

// UI Components
export {
  PartSelector,
  ColorPicker,
  AnimationSelector,
  ActionButtons,
  UnityCanvas,
  DynamicUnityCanvas,
  CharacterConfirmModal,
} from "./ui";

// Actions
export { saveCharacter, useSaveCharacter, type SaveCharacterParams } from "./save-character";

// 위젯 주입용 훅 객체
export const characterPanelHooks: CharacterPanelHooks = {
  usePart: useAppearancePart,
  useAnimation: useAppearanceAnimation,
  useColor: useAppearanceColor,
  useWeaponColor: useWeaponColor,
  useWeaponActions: useWeaponActions,
  useActions: useAppearanceActions,
  useHandWeapon: useHandWeapon,
  partTypes: PART_TYPES,
  weaponPartTypes: WEAPON_PART_TYPES,
};
