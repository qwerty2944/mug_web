import { supabase } from "@/shared/api";
import type { GameMap } from "../types";

// ============ 맵 API ============

export async function fetchMaps(): Promise<GameMap[]> {
  const { data, error } = await supabase
    .from("maps")
    .select("*")
    .order("min_level", { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    descriptionKo: row.description_ko,
    descriptionEn: row.description_en,
    icon: row.icon || "🏠",
    minLevel: row.min_level || 1,
    maxPlayers: row.max_players || 100,
    isPvp: row.is_pvp || false,
    isSafeZone: row.is_safe_zone ?? true,
    connectedMaps: row.connected_maps || [],
  }));
}
