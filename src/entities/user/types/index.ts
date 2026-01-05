import type { SavedCharacter } from "@/entities/character";

// ============ 프로필 타입 ============

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
}
