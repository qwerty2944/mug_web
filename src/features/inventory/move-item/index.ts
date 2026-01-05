"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import { inventoryKeys } from "@/entities/inventory";

// ============ API ============

interface MoveItemParams {
  inventoryId: string;
  targetSlot: number;
}

export async function moveItem({ inventoryId, targetSlot }: MoveItemParams) {
  const { error } = await supabase
    .from("inventory")
    .update({ slot_index: targetSlot })
    .eq("id", inventoryId);

  if (error) throw error;
}

// ============ Hook ============

interface UseMoveItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMoveItem(userId: string | undefined, options?: UseMoveItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MoveItemParams) => moveItem(params),
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
