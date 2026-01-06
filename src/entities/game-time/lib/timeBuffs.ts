import type { Period } from "../types";

// ============ 시간대 버프 타입 ============

export interface TimeBuff {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string;
  periods: Period[]; // 적용되는 시간대
  effect: {
    type: "element" | "stat";
    target: string; // 속성명 또는 스탯명
    modifier: number; // 배율 (1.2 = +20%)
  };
  description: string;
}

// ============ 시간대 버프 정의 ============

export const TIME_BUFFS: TimeBuff[] = [
  {
    id: "night_dark_boost",
    nameKo: "암흑의 힘",
    nameEn: "Dark Power",
    icon: "🌑",
    periods: ["night"],
    effect: { type: "element", target: "dark", modifier: 1.2 },
    description: "밤에 암흑 마법 데미지 +20%",
  },
  {
    id: "night_stealth",
    nameKo: "어둠의 은신",
    nameEn: "Shadow Stealth",
    icon: "👤",
    periods: ["night"],
    effect: { type: "stat", target: "dex", modifier: 1.1 },
    description: "밤에 DEX +10%",
  },
  {
    id: "day_holy_boost",
    nameKo: "신성의 은총",
    nameEn: "Divine Grace",
    icon: "✨",
    periods: ["day", "dawn"],
    effect: { type: "element", target: "holy", modifier: 1.15 },
    description: "낮에 신성 마법 데미지 +15%",
  },
];

// ============ 버프 조회 함수 ============

/**
 * 현재 시간대에 활성화된 모든 버프를 반환합니다.
 */
export function getActiveTimeBuffs(period: Period): TimeBuff[] {
  return TIME_BUFFS.filter((buff) => buff.periods.includes(period));
}

/**
 * 특정 속성에 대한 시간대 배율을 반환합니다.
 *
 * @example
 * const multiplier = getElementTimeMultiplier("dark", "night"); // 1.2
 * const multiplier = getElementTimeMultiplier("fire", "night"); // 1.0
 */
export function getElementTimeMultiplier(
  element: string,
  period: Period
): number {
  const buff = TIME_BUFFS.find(
    (b) =>
      b.effect.type === "element" &&
      b.effect.target === element &&
      b.periods.includes(period)
  );
  return buff?.effect.modifier ?? 1.0;
}

/**
 * 특정 스탯에 대한 시간대 배율을 반환합니다.
 *
 * @example
 * const multiplier = getStatTimeMultiplier("dex", "night"); // 1.1
 */
export function getStatTimeMultiplier(stat: string, period: Period): number {
  const buff = TIME_BUFFS.find(
    (b) =>
      b.effect.type === "stat" &&
      b.effect.target === stat &&
      b.periods.includes(period)
  );
  return buff?.effect.modifier ?? 1.0;
}

/**
 * 시간대에 따른 마법 속성 버프 정보를 반환합니다.
 * UI 표시용입니다.
 */
export function getElementBuffInfo(period: Period): {
  element: string;
  bonus: number;
  buffName: string;
} | null {
  const buff = TIME_BUFFS.find(
    (b) => b.effect.type === "element" && b.periods.includes(period)
  );

  if (!buff) return null;

  return {
    element: buff.effect.target,
    bonus: Math.round((buff.effect.modifier - 1) * 100),
    buffName: buff.nameKo,
  };
}
