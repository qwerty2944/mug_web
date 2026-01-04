import type { CharacterPanelHooks } from "@/shared/types";
import {
  useCharacterPart,
  useCharacterAnimation,
  useCharacterColor,
  useCharacterActions,
  PART_TYPES,
} from "./model";

// Model (stores, hooks)
export {
  useCharacterStore,
  useCharacterPart,
  useCharacterAnimation,
  useCharacterColor,
  useCharacterActions,
  useUnityBridge,
  PART_TYPES,
  type PartType,
} from "./model";

// UI Components
export {
  PartSelector,
  ColorPicker,
  AnimationSelector,
  ActionButtons,
  UnityCanvas,
} from "./ui";

// 위젯 주입용 훅 객체
export const characterPanelHooks: CharacterPanelHooks = {
  usePart: useCharacterPart,
  useAnimation: useCharacterAnimation,
  useColor: useCharacterColor,
  useActions: useCharacterActions,
  partTypes: PART_TYPES,
};
