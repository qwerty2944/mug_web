// ============ 인벤토리 아이템 타입 ============

export interface InventoryItem {
  id: string;
  itemId: string;
  itemType: string;
  quantity: number;
  acquiredAt: string;
}

// 아이템 타입 상수
export type ItemType = "weapon" | "armor" | "consumable" | "material" | "quest";

// 인벤토리 슬롯 (확장용)
export interface InventorySlot {
  slotIndex: number;
  item: InventoryItem | null;
}
