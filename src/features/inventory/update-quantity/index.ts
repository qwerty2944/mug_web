"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import { inventoryKeys } from "@/entities/inventory";
import { removeItem } from "../remove-item";

// ============ API ============

interface UpdateQuantityParams {
  inventoryId: string;
  quantity: number;
}

export async function updateQuantity({ inventoryId, quantity }: UpdateQuantityParams) {
  if (quantity <= 0) {
    return removeItem(inventoryId);
  }

  const { error } = await supabase
    .from("inventory")
    .update({ quantity })
    .eq("id", inventoryId);

  if (error) throw error;
}

// ============ Hook ============

interface UseUpdateQuantityOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateQuantity(userId: string | undefined, options?: UseUpdateQuantityOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateQuantityParams) => updateQuantity(params),
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
