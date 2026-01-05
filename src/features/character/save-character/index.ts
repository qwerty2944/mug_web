"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import { profileKeys } from "@/entities/user";
import type { CharacterAppearance, CharacterColors, CharacterStats } from "@/entities/character";

// ============ Types ============

export interface SaveCharacterParams {
  userId: string;
  name: string;
  gender: "male" | "female";
  race: string;
  bodyType: number;
  preset: string;
  stats: CharacterStats;
  appearance: CharacterAppearance;
  colors: CharacterColors;
}

interface CharacterData {
  name: string;
  isMain: boolean;
  gender: "male" | "female";
  race: string;
  bodyType: number;
  preset: string;
  stats: CharacterStats;
  appearance: CharacterAppearance;
  colors: CharacterColors;
  createdAt: string;
}

// ============ API ============

export async function saveCharacter({ userId, ...params }: SaveCharacterParams) {
  const character: CharacterData = {
    ...params,
    isMain: true,
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabase.rpc("save_character", {
    p_user_id: userId,
    p_character: character,
  });

  if (error) throw error;
  return data;
}

// ============ Hook ============

interface UseSaveCharacterOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSaveCharacter(options?: UseSaveCharacterOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveCharacterParams) => saveCharacter(params),
    onSuccess: (_, variables) => {
      // 프로필 캐시 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(variables.userId) });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
