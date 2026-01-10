"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addItemToInventory, inventoryKeys } from "@/entities/inventory";
import type { InventoryType } from "@/entities/inventory";

// ============ API (re-export for convenience) ============

export { addItemToInventory as addItem } from "@/entities/inventory";

// ============ Hook ============

interface UseAddItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAddItem(userId: string | undefined, options?: UseAddItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      itemId: string;
      itemType: string;
      quantity?: number;
      inventoryType?: InventoryType;
    }) =>
      addItemToInventory({
        userId: userId!,
        itemId: params.itemId,
        itemType: params.itemType,
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
