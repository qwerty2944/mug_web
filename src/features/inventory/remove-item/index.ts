"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeItemFromInventory, inventoryKeys } from "@/entities/inventory";
import type { InventoryType } from "@/entities/inventory";

// ============ API (re-export for convenience) ============

export { removeItemFromInventory as removeItem } from "@/entities/inventory";

// ============ Hook ============

interface UseRemoveItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRemoveItem(userId: string | undefined, options?: UseRemoveItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      slot: number;
      quantity?: number;
      inventoryType?: InventoryType;
    }) =>
      removeItemFromInventory({
        userId: userId!,
        slot: params.slot,
        quantity: params.quantity,
        inventoryType: params.inventoryType,
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
