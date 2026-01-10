"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInventory, fetchAllInventories } from "../api";
import type { InventoryType } from "../types";

// ============ Query Keys ============

export const inventoryKeys = {
  all: ["inventory"] as const,
  detail: (userId: string) => [...inventoryKeys.all, userId] as const,
  byType: (userId: string, type: InventoryType) =>
    [...inventoryKeys.detail(userId), type] as const,
};

// ============ Single Inventory Hook ============

export function useInventory(
  userId: string | undefined,
  inventoryType: InventoryType = "personal"
) {
  return useQuery({
    queryKey: inventoryKeys.byType(userId || "", inventoryType),
    queryFn: () => fetchInventory(userId!, inventoryType),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1분
  });
}

// ============ All Inventories Hook ============

export function useAllInventories(userId: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.detail(userId || ""),
    queryFn: () => fetchAllInventories(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1분
  });
}

// ============ Personal Inventory Hook (편의용) ============

export function usePersonalInventory(userId: string | undefined) {
  return useInventory(userId, "personal");
}

// ============ Storage Inventory Hook (편의용) ============

export function useStorageInventory(userId: string | undefined) {
  return useInventory(userId, "storage");
}
