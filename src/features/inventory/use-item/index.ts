"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeItemFromInventory, inventoryKeys } from "@/entities/inventory";
import type { InventoryType } from "@/entities/inventory";

// ============ API ============

interface UseItemParams {
  userId: string;
  slot: number;
  amount?: number;
  inventoryType?: InventoryType;
}

export async function useItem({
  userId,
  slot,
  amount = 1,
  inventoryType = "personal",
}: UseItemParams) {
  // 아이템 사용 = 수량 감소 (0이 되면 자동 삭제)
  return removeItemFromInventory({
    userId,
    slot,
    quantity: amount,
    inventoryType,
  });
}

// ============ Hook ============

interface UseUseItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUseItem(userId: string | undefined, options?: UseUseItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      slot: number;
      amount?: number;
      inventoryType?: InventoryType;
    }) =>
      useItem({
        userId: userId!,
        slot: params.slot,
        amount: params.amount,
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
