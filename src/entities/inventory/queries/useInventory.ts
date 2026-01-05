"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInventory } from "../api";

// ============ Query Keys ============

export const inventoryKeys = {
  all: ["inventory"] as const,
  detail: (userId: string) => [...inventoryKeys.all, userId] as const,
};

// ============ Query Hook ============

export function useInventory(userId: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.detail(userId || ""),
    queryFn: () => fetchInventory(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1분
  });
}
