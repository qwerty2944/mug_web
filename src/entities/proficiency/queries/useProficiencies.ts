"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProficiencies } from "../api";

// ============ Query Keys ============

export const proficiencyKeys = {
  all: ["proficiencies"] as const,
  detail: (userId: string) => [...proficiencyKeys.all, userId] as const,
};

// ============ Query Hook ============

export function useProficiencies(userId: string | undefined) {
  return useQuery({
    queryKey: proficiencyKeys.detail(userId || ""),
    queryFn: () => fetchProficiencies(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
