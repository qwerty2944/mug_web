import type { Character, ProfileAppearance } from "@/entities/character";
import type { CharacterInjury } from "@/entities/status";

// ============ 종교 타입 ============

export interface ReligionData {
  id: string;
  piety: number;
  joinedAt: string;
}

// ============ 프로필 타입 ============

export type CrystalTier = "basic" | "advanced" | "superior" | null;

/**
 * 게임 프로필 (DB characters 테이블 행)
 * - User의 게임 진행 상태를 담는 타입
 * - character: 캐릭터 기본 정보 (이름, 스탯)
 * - appearance: 캐릭터 외형 (ID 기반)
 */
export interface Profile {
  id: string;           // 프로필 고유 ID
  userId: string;       // Auth User ID (auth.users.id 참조)
  nickname: string | null;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  fatigue: number;
  maxFatigue: number;
  fatigueUpdatedAt: string;
  isPremium: boolean;
  premiumUntil: string | null;
  character: Character | null;
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

/** @deprecated Profile을 사용하세요 */
export type UserProfile = Profile;
