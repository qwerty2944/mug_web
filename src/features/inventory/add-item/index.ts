"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import { inventoryKeys } from "@/entities/inventory";

// ============ API ============

interface AddItemParams {
  userId: string;
  itemId: string;
  itemType: string;
  quantity?: number;
}

export async function addItem({ userId, itemId, itemType, quantity = 1 }: AddItemParams) {
  // 기존 아이템이 있으면 수량 증가
  const { data: existing } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("inventory")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);

    if (error) throw error;
    return { id: existing.id, merged: true };
  }

  // 새 아이템 추가
  const { data, error } = await supabase
    .from("inventory")
    .insert({
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      quantity,
      acquired_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id, merged: false };
}

// ============ Hook ============

interface UseAddItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAddItem(userId: string | undefined, options?: UseAddItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { itemId: string; itemType: string; quantity?: number }) =>
      addItem({ userId: userId!, ...params }),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(userId) });
      }
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
