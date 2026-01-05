import { supabase } from "@/shared/api";
import type { InventoryItem } from "../types";

// ============ 인벤토리 조회 ============

export async function fetchInventory(userId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("user_id", userId)
    .order("acquired_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    itemId: item.item_id,
    itemType: item.item_type,
    quantity: item.quantity || 1,
    acquiredAt: item.acquired_at,
  }));
}
