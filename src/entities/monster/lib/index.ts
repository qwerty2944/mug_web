import type { Monster, MonsterDrop } from "../types";

/**
 * 드롭 아이템 롤 (확률 기반)
 * @returns 획득한 아이템과 수량 배열
 */
export function rollDrops(drops: MonsterDrop[]): { itemId: string; quantity: number }[] {
  const result: { itemId: string; quantity: number }[] = [];

  for (const drop of drops) {
    if (Math.random() < drop.chance) {
      const [min, max] = drop.quantity;
      const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
      result.push({ itemId: drop.itemId, quantity });
    }
  }

  return result;
}

/**
 * 몬스터 난이도 계산 (플레이어 레벨 대비)
 */
export function getMonsterDifficulty(
  monster: Monster,
  playerLevel: number
): "easy" | "normal" | "hard" | "deadly" {
  const levelDiff = monster.level - playerLevel;

  if (levelDiff <= -3) return "easy";
  if (levelDiff <= 0) return "normal";
  if (levelDiff <= 2) return "hard";
  return "deadly";
}

/**
 * 난이도에 따른 색상
 */
export function getDifficultyColor(difficulty: "easy" | "normal" | "hard" | "deadly"): string {
  switch (difficulty) {
    case "easy":
      return "#22c55e"; // green
    case "normal":
      return "#eab308"; // yellow
    case "hard":
      return "#f97316"; // orange
    case "deadly":
      return "#ef4444"; // red
  }
}

/**
 * 몬스터가 반격하는지 확인
 */
export function canMonsterAttack(monster: Monster): boolean {
  return monster.behavior !== "passive" && monster.stats.attack > 0;
}

/**
 * 몬스터 경험치 보너스 계산 (레벨 차이 기반)
 */
export function calculateExpBonus(monster: Monster, playerLevel: number): number {
  const levelDiff = monster.level - playerLevel;

  // 자신보다 강한 적일수록 보너스
  if (levelDiff > 0) {
    return Math.round(monster.rewards.exp * (1 + levelDiff * 0.1));
  }
  // 자신보다 약한 적일수록 감소
  if (levelDiff < -5) {
    return Math.round(monster.rewards.exp * 0.5);
  }

  return monster.rewards.exp;
}

/**
 * 몬스터 요약 정보 텍스트
 */
export function formatMonsterSummary(monster: Monster): string {
  const elementText = monster.element ? ` [${monster.element}]` : "";
  return `${monster.icon} ${monster.nameKo} Lv.${monster.level}${elementText}`;
}
