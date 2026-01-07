import type { AttackType } from "@/entities/proficiency";
import type { PhysicalResistance, MonsterStats } from "../types";
import { DEFAULT_PHYSICAL_RESISTANCE } from "../types";

/**
 * 몬스터의 특정 공격 타입에 대한 저항 배율 가져오기
 * @param stats 몬스터 스탯
 * @param attackType 공격 타입
 * @returns 저항 배율 (1.0 = 보통, 1.5 = 약함, 0.5 = 강함)
 */
export function getPhysicalResistance(
  stats: MonsterStats,
  attackType: AttackType
): number {
  const resistance = stats.resistance ?? DEFAULT_PHYSICAL_RESISTANCE;

  switch (attackType) {
    case "slash":
      return resistance.slashResist;
    case "pierce":
      return resistance.pierceResist;
    case "crush":
      return resistance.crushResist;
    default:
      return 1.0;
  }
}

/**
 * 저항 텍스트 및 색상 가져오기
 * @param multiplier 저항 배율
 * @returns 텍스트와 색상 정보
 */
export function getResistanceText(
  multiplier: number
): { text: string; color: string } {
  if (multiplier >= 1.5) {
    return { text: "효과적!", color: "#22c55e" }; // green
  }
  if (multiplier <= 0.5) {
    return { text: "효과 없음", color: "#ef4444" }; // red
  }
  return { text: "", color: "" };
}
