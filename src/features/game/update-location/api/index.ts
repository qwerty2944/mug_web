import { supabase } from "@/shared/api";

/**
 * 유저 위치 업데이트
 */
export async function updateLocation(params: {
  userId: string;
  characterName: string;
  mapId: string;
}): Promise<void> {
  const { error } = await supabase.rpc("upsert_user_location", {
    p_user_id: params.userId,
    p_character_name: params.characterName,
    p_map_id: params.mapId,
  });

  if (error) throw error;
}
