// ============ 인벤토리 타입 ============

export type InventoryType = "personal" | "storage";

// 아이템 타입
export type ItemType = "equipment" | "consumable" | "material" | "misc";

// JSONB 내 아이템 구조
export interface InventorySlotItem {
  slot: number;
  itemId: string;
  itemType: ItemType;
  quantity: number;
  acquiredAt: string;
}

// 인벤토리 엔티티
export interface Inventory {
  id: string;
  profileId: string;
  inventoryType: InventoryType;
  maxSlots: number;
  items: (InventorySlotItem | null)[];
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입
export interface InventoryResponse {
  id: string;
  inventoryType: InventoryType;
  maxSlots: number;
  items: (InventorySlotItem | null)[];
  createdAt: string;
  updatedAt: string;
}

// 인벤토리 타입별 기본 설정
export const INVENTORY_CONFIG: Record<InventoryType, { maxSlots: number; nameKo: string }> = {
  personal: { maxSlots: 20, nameKo: "개인 인벤토리" },
  storage: { maxSlots: 30, nameKo: "창고" },
};

// 아이템 타입별 최대 스택
export const ITEM_MAX_STACK: Record<ItemType, number> = {
  equipment: 1,
  consumable: 20,
  material: 99,
  misc: 10,
};

// 구버전 호환용 (deprecated)
export interface InventoryItem {
  id: string;
  itemId: string;
  itemType: string;
  quantity: number;
  acquiredAt: string;
}
