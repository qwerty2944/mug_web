import type { SavedCharacter, ProfileAppearance } from "@/entities/character";
import type { CharacterInjury } from "@/entities/injury";

// ============ 종교 타입 ============

export interface ReligionData {
  id: string;
  piety: number;
  joinedAt: string;
}

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
  characterId: string | null;
  character: SavedCharacter | null;
  // 외형 데이터 (별도 컬럼)
  appearance: ProfileAppearance | null;
  buffs: any[];
  currentMapId: string;
  // 귓속말 크리스탈 시스템
  whisperCharges: number;
  crystalTier: CrystalTier;
  // 현재 HP/MP (null이면 최대값)
  currentHp: number | null;
  currentMp: number | null;
  // 부상 시스템
  injuries: CharacterInjury[];
  // 종교 시스템
  religion: ReligionData | null;
}
