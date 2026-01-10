// Types
export type {
  InventoryType,
  ItemType,
  InventorySlotItem,
  Inventory,
  InventoryResponse,
  InventoryItem, // deprecated
} from "./types";

export { INVENTORY_CONFIG, ITEM_MAX_STACK } from "./types";

// API
export {
  fetchInventory,
  fetchAllInventories,
  addItemToInventory,
  removeItemFromInventory,
  moveItemInInventory,
  updateItemQuantity,
  findItemInInventory,
  countItemInInventory,
  findEmptySlot,
  isInventoryFull,
} from "./api";

// Queries
export {
  useInventory,
  useAllInventories,
  usePersonalInventory,
  useStorageInventory,
  inventoryKeys,
} from "./queries";
