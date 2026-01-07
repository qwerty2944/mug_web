import { supabase } from "@/shared/api";
import type { KarmaRank } from "../types";

// ============ 카르마 조회 ============

export interface KarmaData {
  karma: number;
  rank: KarmaRank;
}

export async function fetchKarma(userId: string): Promise<KarmaData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("karma")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const karma = data?.karma ?? 0;
  const rank = getKarmaRankFromValue(karma);

  return { karma, rank };
}

// ============ 카르마 업데이트 ============

export interface UpdateKarmaResult {
  newKarma: number;
  karmaRank: KarmaRank;
}

export async function updateKarma(
  userId: string,
  change: number,
  reason?: string
): Promise<UpdateKarmaResult> {
  const { data, error } = await supabase.rpc("update_karma", {
    p_user_id: userId,
    p_change: change,
    p_reason: reason || null,
  });

  if (error) throw error;

  const result = data?.[0] || { new_karma: 0, karma_rank: "neutral" };

  return {
    newKarma: result.new_karma,
    karmaRank: result.karma_rank as KarmaRank,
  };
}

// ============ 유틸리티 ============

function getKarmaRankFromValue(karma: number): KarmaRank {
  if (karma >= 80) return "saintly";
  if (karma >= 50) return "holy";
  if (karma >= 20) return "virtuous";
  if (karma >= -19) return "neutral";
  if (karma >= -49) return "wicked";
  if (karma >= -79) return "evil";
  return "abyssal";
}
