"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import { inventoryKeys } from "@/entities/inventory";
import { removeItem } from "../remove-item";

// ============ API ============

interface UseItemParams {
  inventoryId: string;
  amount?: number;
}

export async function useItem({ inventoryId, amount = 1 }: UseItemParams) {
  const { data: item, error: fetchError } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("id", inventoryId)
    .single();

  if (fetchError) throw fetchError;
  if (!item) throw new Error("Item not found");

  const newQuantity = item.quantity - amount;

  if (newQuantity <= 0) {
    return removeItem(inventoryId);
  }

  const { error } = await supabase
    .from("inventory")
    .update({ quantity: newQuantity })
    .eq("id", inventoryId);

  if (error) throw error;
}

// ============ Hook ============

interface UseUseItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUseItem(userId: string | undefined, options?: UseUseItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UseItemParams) => useItem(params),
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
