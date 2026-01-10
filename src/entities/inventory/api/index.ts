import { supabase } from "@/shared/api";
import type { InventoryType, InventoryResponse, InventorySlotItem } from "../types";

// ============ 인벤토리 조회 ============

export async function fetchInventory(
  userId: string,
  inventoryType: InventoryType = "personal"
): Promise<InventoryResponse> {
  const { data, error } = await supabase.rpc("inventory_get", {
    p_user_id: userId,
    p_inventory_type: inventoryType,
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return {
    id: data.id,
    inventoryType: data.inventoryType,
    maxSlots: data.maxSlots,
    items: data.items || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ============ 모든 인벤토리 조회 ============

export async function fetchAllInventories(
  userId: string
): Promise<{ personal: InventoryResponse; storage: InventoryResponse }> {
  const [personal, storage] = await Promise.all([
    fetchInventory(userId, "personal"),
    fetchInventory(userId, "storage"),
  ]);

  return { personal, storage };
}

// ============ 아이템 추가 ============

interface AddItemParams {
  userId: string;
  inventoryType?: InventoryType;
  itemId: string;
  itemType: string;
  quantity?: number;
}

interface AddItemResult {
  success: boolean;
  error?: string;
  slot?: number;
  items?: (InventorySlotItem | null)[];
}

export async function addItemToInventory({
  userId,
  inventoryType = "personal",
  itemId,
  itemType,
  quantity = 1,
}: AddItemParams): Promise<AddItemResult> {
  const { data, error } = await supabase.rpc("inventory_add_item", {
    p_user_id: userId,
    p_inventory_type: inventoryType,
    p_item_id: itemId,
    p_item_type: itemType,
    p_quantity: quantity,
  });

  if (error) throw error;
  return data as AddItemResult;
}

// ============ 아이템 제거 ============

interface RemoveItemParams {
  userId: string;
  inventoryType?: InventoryType;
  slot: number;
  quantity?: number;
}

interface RemoveItemResult {
  success: boolean;
  error?: string;
  removedItem?: InventorySlotItem;
  items?: (InventorySlotItem | null)[];
}

export async function removeItemFromInventory({
  userId,
  inventoryType = "personal",
  slot,
  quantity = 1,
}: RemoveItemParams): Promise<RemoveItemResult> {
  const { data, error } = await supabase.rpc("inventory_remove_item", {
    p_user_id: userId,
    p_inventory_type: inventoryType,
    p_slot: slot,
    p_quantity: quantity,
  });

  if (error) throw error;
  return data as RemoveItemResult;
}

// ============ 아이템 이동 ============

interface MoveItemParams {
  userId: string;
  fromType: InventoryType;
  fromSlot: number;
  toType: InventoryType;
  toSlot: number;
}

interface MoveItemResult {
  success: boolean;
  error?: string;
}

export async function moveItemInInventory({
  userId,
  fromType,
  fromSlot,
  toType,
  toSlot,
}: MoveItemParams): Promise<MoveItemResult> {
  const { data, error } = await supabase.rpc("inventory_move_item", {
    p_user_id: userId,
    p_from_type: fromType,
    p_from_slot: fromSlot,
    p_to_type: toType,
    p_to_slot: toSlot,
  });

  if (error) throw error;
  return data as MoveItemResult;
}

// ============ 수량 업데이트 ============

interface UpdateQuantityParams {
  userId: string;
  inventoryType?: InventoryType;
  slot: number;
  quantity: number;
}

interface UpdateQuantityResult {
  success: boolean;
  error?: string;
  items?: (InventorySlotItem | null)[];
}

export async function updateItemQuantity({
  userId,
  inventoryType = "personal",
  slot,
  quantity,
}: UpdateQuantityParams): Promise<UpdateQuantityResult> {
  const { data, error } = await supabase.rpc("inventory_update_quantity", {
    p_user_id: userId,
    p_inventory_type: inventoryType,
    p_slot: slot,
    p_quantity: quantity,
  });

  if (error) throw error;
  return data as UpdateQuantityResult;
}

// ============ 유틸리티 ============

/**
 * 인벤토리에서 특정 아이템 찾기
 */
export function findItemInInventory(
  items: (InventorySlotItem | null)[],
  itemId: string
): InventorySlotItem | null {
  for (const item of items) {
    if (item && item.itemId === itemId) {
      return item;
    }
  }
  return null;
}

/**
 * 인벤토리 내 특정 아이템 총 수량
 */
export function countItemInInventory(
  items: (InventorySlotItem | null)[],
  itemId: string
): number {
  let count = 0;
  for (const item of items) {
    if (item && item.itemId === itemId) {
      count += item.quantity;
    }
  }
  return count;
}

/**
 * 빈 슬롯 찾기
 */
export function findEmptySlot(
  items: (InventorySlotItem | null)[],
  maxSlots: number
): number {
  for (let i = 0; i < maxSlots; i++) {
    if (!items[i]) {
      return i;
    }
  }
  return -1;
}

/**
 * 인벤토리가 가득 찼는지 확인
 */
export function isInventoryFull(
  items: (InventorySlotItem | null)[],
  maxSlots: number
): boolean {
  return findEmptySlot(items, maxSlots) === -1;
}
