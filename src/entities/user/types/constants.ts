// ============ 피로도 시스템 ============

export const FATIGUE_COST = {
  MAP_MOVE: 5,      // 맵 이동
  BATTLE_START: 3,  // 전투 시작
  BATTLE_TURN: 1,   // 전투 턴당
  PVP_DUEL: 10,     // PvP 결투
} as const;

export const FATIGUE_RECOVERY = {
  PER_MINUTE: 1,    // 분당 회복량
  MAX_DEFAULT: 100, // 기본 최대 피로도
} as const;

// ============ 경험치/레벨 시스템 ============

export const LEVEL_CONFIG = {
  MAX_LEVEL: 100,           // 최대 레벨
  EXP_PER_LEVEL: 100,       // 레벨당 필요 경험치 배수
} as const;

/**
 * 해당 레벨에서 레벨업에 필요한 경험치
 * 공식: level * 100
 */
export function getExpForLevel(level: number): number {
  return level * LEVEL_CONFIG.EXP_PER_LEVEL;
}

/**
 * 레벨 1부터 해당 레벨까지 필요한 총 경험치
 */
export function getTotalExpForLevel(level: number): number {
  // 1 + 2 + ... + (level-1) = (level-1) * level / 2
  return ((level - 1) * level / 2) * LEVEL_CONFIG.EXP_PER_LEVEL;
}
