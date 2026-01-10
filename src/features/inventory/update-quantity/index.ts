"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateItemQuantity, inventoryKeys } from "@/entities/inventory";
import type { InventoryType } from "@/entities/inventory";

// ============ API (re-export for convenience) ============

export { updateItemQuantity as updateQuantity } from "@/entities/inventory";

// ============ Hook ============

interface UseUpdateQuantityOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateQuantity(userId: string | undefined, options?: UseUpdateQuantityOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      slot: number;
      quantity: number;
      inventoryType?: InventoryType;
    }) =>
      updateItemQuantity({
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
