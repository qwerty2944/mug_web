"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveItemInInventory, inventoryKeys } from "@/entities/inventory";
import type { InventoryType } from "@/entities/inventory";

// ============ API (re-export for convenience) ============

export { moveItemInInventory as moveItem } from "@/entities/inventory";

// ============ Hook ============

interface UseMoveItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMoveItem(userId: string | undefined, options?: UseMoveItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      fromType: InventoryType;
      fromSlot: number;
      toType: InventoryType;
      toSlot: number;
    }) =>
      moveItemInInventory({
        userId: userId!,
        fromType: params.fromType,
        fromSlot: params.fromSlot,
        toType: params.toType,
        toSlot: params.toSlot,
      }),
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
