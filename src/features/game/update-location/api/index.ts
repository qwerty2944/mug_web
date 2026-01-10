import { supabase } from "@/shared/api";

/**
 * 유저 위치 업데이트
 * - user_locations 테이블 (실시간 위치 추적용)
 * - profiles.current_map_id (영구 저장용)
 */
export async function updateLocation(params: {
  userId: string;
  characterName: string;
  mapId: string;
}): Promise<void> {
  // 1. 실시간 위치 테이블 업데이트
  const { error: locationError } = await supabase.rpc("upsert_user_location", {
    p_user_id: params.userId,
    p_character_name: params.characterName,
    p_map_id: params.mapId,
  });

  if (locationError) throw locationError;

  // 2. 프로필의 현재 맵 ID 업데이트 (영구 저장)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ current_map_id: params.mapId })
    .eq("id", params.userId);

  if (profileError) throw profileError;
}
