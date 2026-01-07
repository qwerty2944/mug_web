// Types
export type {
  Item,
  ItemType,
  ItemRarity,
  ItemDescription,
  ItemsData,
  RarityInfo,
  ItemTypeInfo,
  ConsumableEffect,
  ConsumableEffectType,
  EquipmentData,
  EquipmentStats,
  EquipmentSlot,
  LegacyEquipmentSlot,
  WeaponHandType,
  OffHandItemType,
  AccessoryType,
  SlotCategory,
  SlotConfigInfo,
} from "./types";

export {
  RARITY_CONFIG,
  ITEM_TYPE_CONFIG,
  WEIGHT_CONFIG,
  SLOT_CONFIG,
  APPEARANCE_SLOTS,
  ACCESSORY_SLOTS,
  isAppearanceSlot,
  isAccessorySlot,
} from "./types";

// API
export {
  fetchItems,
  fetchItemById,
  fetchItemsByType,
  fetchItemsByTag,
  fetchItemsByIds,
  clearItemsCache,
} from "./api";

// Queries
export {
  useItems,
  useItem,
  useItemsByType,
  useItemsByTag,
  useItemsByIds,
  itemKeys,
  getItemDisplayName,
  getItemDescription,
} from "./queries";

// Lib (Utilities)
export {
  getRarityColor,
  getRarityName,
  getRarityTier,
  compareRarity,
  applyRarityToDropChance,
  calculateMaxCarryCapacity,
  calculateTotalWeight,
  canCarryItem,
  getOverweightStatus,
  calculateSellPrice,
  calculateBuyPrice,
  isConsumable,
  isEquippable,
  canEquipItem,
  getMaxStack,
  formatWeight,
  formatItemSummary,
  formatEquipmentStats,
} from "./lib";
