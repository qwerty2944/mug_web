import { supabase } from "@/shared/api";
import type { Proficiencies, ProficiencyType } from "../types";

/**
 * 사용자의 숙련도 조회
 */
export async function fetchProficiencies(userId: string): Promise<Proficiencies> {
  const { data, error } = await supabase
    .from("proficiencies")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    // 레코드가 없으면 기본값 생성
    if (error.code === "PGRST116") {
      const { data: newData, error: insertError } = await supabase
        .from("proficiencies")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      return mapToProficiencies(newData);
    }
    throw error;
  }

  return mapToProficiencies(data);
}

/**
 * 숙련도 증가 (RPC 함수 호출)
 */
export async function increaseProficiency(
  userId: string,
  type: ProficiencyType,
  amount: number = 1
): Promise<number> {
  const { data, error } = await supabase.rpc("increase_proficiency", {
    p_user_id: userId,
    p_type: type,
    p_amount: amount,
  });

  if (error) throw error;
  return data as number;
}

/**
 * 숙련도 직접 설정 (테스트/관리용)
 */
export async function setProficiency(
  userId: string,
  type: ProficiencyType,
  value: number
): Promise<void> {
  const clampedValue = Math.max(0, Math.min(100, value));

  const { error } = await supabase
    .from("proficiencies")
    .update({ [type]: clampedValue, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw error;
}

// ============ 헬퍼 함수 ============

function mapToProficiencies(data: any): Proficiencies {
  return {
    // 무기
    light_sword: data.light_sword ?? 0,
    medium_sword: data.medium_sword ?? 0,
    great_sword: data.great_sword ?? 0,
    axe: data.axe ?? 0,
    mace: data.mace ?? 0,
    dagger: data.dagger ?? 0,
    spear: data.spear ?? 0,
    bow: data.bow ?? 0,
    crossbow: data.crossbow ?? 0,
    staff: data.staff ?? 0,
    fist: data.fist ?? 0,
    // 마법
    fire: data.fire ?? 0,
    ice: data.ice ?? 0,
    lightning: data.lightning ?? 0,
    earth: data.earth ?? 0,
    holy: data.holy ?? 0,
    dark: data.dark ?? 0,
  };
}
