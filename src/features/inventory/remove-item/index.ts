"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import { inventoryKeys } from "@/entities/inventory";

// ============ API ============

export async function removeItem(inventoryId: string) {
  const { error } = await supabase
    .from("inventory")
    .delete()
    .eq("id", inventoryId);

  if (error) throw error;
}

// ============ Hook ============

interface UseRemoveItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRemoveItem(userId: string | undefined, options?: UseRemoveItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryId: string) => removeItem(inventoryId),
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
