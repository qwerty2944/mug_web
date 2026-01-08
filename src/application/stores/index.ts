// ============ Auth ============
export { useAuthStore } from "./authStore";

// ============ Character ============
export { useProfileStore } from "./profileStore";
export {
  useAppearanceStore,
  useAppearancePart,
  useAppearanceAnimation,
  useAppearanceColor,
  useAppearanceActions,
  useWeaponColor,
  useWeaponActions,
  PART_TYPES,
  WEAPON_PART_TYPES,
  type PartType,
  type WeaponPartType,
  type SpriteCounts,
  type CharacterState,
  type AnimationState,
  type AnimationCounts,
} from "./appearanceStore";

// ============ Game ============
export {
  useGameStore,
  type OnlineUser,
  type MapInfo,
} from "./gameStore";
export {
  useChatStore,
  parseChatCommand,
  type ChatMessage,
  type MessageType,
} from "./chatStore";
export {
  useBattleStore,
  type BattleLogEntry,
  type BattleResult,
  type BattleState,
} from "./battleStore";

// ============ PvP ============
export {
  usePvpStore,
  type DuelRequest,
  type DuelParticipant,
  type DuelLogEntry,
  type DuelAction,
  type DuelResult,
  type DuelEndResult,
  type DuelState,
} from "./pvpStore";

// ============ Equipment ============
export {
  useEquipmentStore,
  useWeapon,
  getEquippedWeaponType,
  isDualWielding,
  hasShieldEquipped,
  getEquippedSlotCount,
  type EquippedItem,
  type CanEquipResult,
} from "./equipmentStore";

// ============ UI ============
export { useThemeStore } from "./themeStore";
export { useModalStore, useModal, type ModalConfig } from "./modalStore";
