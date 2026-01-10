import { supabase } from "@/shared/api";

/**
 * 유저 위치 업데이트
 * - character_locations 테이블 (실시간 위치 추적용)
 * - characters.current_map_id (영구 저장용)
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

  // 2. 캐릭터의 현재 맵 ID 업데이트 (영구 저장)
  const { error: profileError, data: updatedData } = await supabase
    .from("characters")
    .update({ current_map_id: params.mapId })
    .eq("user_id", params.userId)
    .select("id, current_map_id");

  if (profileError) throw profileError;
  if (!updatedData || updatedData.length === 0) {
    throw new Error(`위치 업데이트 실패: 캐릭터를 찾을 수 없습니다`);
  }
}
