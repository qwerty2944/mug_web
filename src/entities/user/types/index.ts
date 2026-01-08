import type { SavedCharacter } from "@/entities/character";

// ============ 프로필 타입 ============

export type CrystalTier = "basic" | "advanced" | "superior" | null;

export interface UserProfile {
  id: string;
  nickname: string | null;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  stamina: number;
  maxStamina: number;
  staminaUpdatedAt: string;
  isPremium: boolean;
  premiumUntil: string | null;
  characters: SavedCharacter[];
  buffs: any[];
  currentMapId: string;
  // 귓속말 크리스탈 시스템
  whisperCharges: number;
  crystalTier: CrystalTier;
  // 현재 HP/MP (null이면 최대값)
  currentHp: number | null;
  currentMp: number | null;
}
