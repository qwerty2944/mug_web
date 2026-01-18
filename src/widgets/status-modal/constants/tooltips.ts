// 기본 능력치 툴팁
export const STAT_TOOLTIPS: Record<
  string,
  { title: string; effects: string[] }
> = {
  str: {
    title: "힘 (STR)",
    effects: [
      "물리 공격력 +STR x 0.5",
      "최대 소지 무게 +STR x 2kg",
      "근접 무기 데미지 보너스",
    ],
  },
  dex: {
    title: "민첩 (DEX)",
    effects: [
      "회피 확률 +DEX x 0.4%",
      "물리 치명타 확률 보조",
      "세검/단검/활 데미지 보너스",
    ],
  },
  con: {
    title: "체력 (CON)",
    effects: [
      "최대 HP +CON x 5",
      "막기 확률 +CON x 0.3%",
      "물리 방어력 +CON x 0.5",
      "최대 피로도 +CON x 5",
    ],
  },
  int: {
    title: "지능 (INT)",
    effects: [
      "마법 공격력 +INT x 0.8",
      "최대 MP +INT",
      "마법 치명타 확률 보조",
    ],
  },
  wis: {
    title: "지혜 (WIS)",
    effects: ["최대 MP +WIS x 3", "마법 방어력 +WIS x 0.3"],
  },
  cha: {
    title: "매력 (CHA)",
    effects: ["NPC 호감도 보너스", "상점 가격 할인", "설득 성공률 증가"],
  },
  lck: {
    title: "행운 (LCK)",
    effects: [
      "치명타 확률 +LCK x 0.3%",
      "치명타 배율 +LCK x 0.01",
      "아이템 드랍률 보너스",
    ],
  },
};

// 전투 스탯 툴팁
export const COMBAT_TOOLTIPS: Record<
  string,
  { title: string; formula: string; max?: string; effect?: string }
> = {
  physicalAttack: {
    title: "물리 공격력",
    formula: "STR x 0.5 + 무기 + 장비",
    effect: "물리 데미지 증가",
  },
  magicAttack: {
    title: "마법 공격력",
    formula: "INT x 0.8 + 무기 + 장비",
    effect: "마법 데미지 증가",
  },
  physicalDefense: {
    title: "물리 방어력",
    formula: "CON x 0.5 + 방어구",
    effect: "물리 데미지 감소",
  },
  magicDefense: {
    title: "마법 방어력",
    formula: "WIS x 0.3 + 장비",
    effect: "마법 데미지 감소",
  },
  dodge: {
    title: "회피 확률",
    formula: "3% + DEX x 0.4 + 장비",
    max: "최대 40%",
    effect: "공격을 완전히 회피",
  },
  block: {
    title: "막기 확률",
    formula: "5% + CON x 0.3 + 장비",
    max: "최대 35%",
    effect: "데미지 50% 감소",
  },
  physCrit: {
    title: "물리 치명타",
    formula: "5% + LCK x 0.3 + DEX x 0.05",
    max: "최대 60%",
  },
  magicCrit: {
    title: "마법 치명타",
    formula: "5% + LCK x 0.3 + INT x 0.05",
    max: "최대 60%",
  },
  critMult: {
    title: "치명타 배율",
    formula: "1.5x + LCK x 0.01",
    max: "최대 2.5x",
  },
};

// 속성 정보
export const ELEMENTS = [
  { id: "fire", nameKo: "화염", icon: "🔥" },
  { id: "ice", nameKo: "냉기", icon: "❄️" },
  { id: "lightning", nameKo: "번개", icon: "⚡" },
  { id: "earth", nameKo: "대지", icon: "🪨" },
  { id: "holy", nameKo: "신성", icon: "✨" },
  { id: "dark", nameKo: "암흑", icon: "🌑" },
  { id: "poison", nameKo: "독", icon: "☠️" },
  { id: "arcane", nameKo: "비전", icon: "🔮" },
] as const;

export type ElementId = (typeof ELEMENTS)[number]["id"];

// 지형별 속성 보너스
export const TERRAIN_BONUSES: Record<
  string,
  { element: ElementId; multiplier: number }
> = {
  forest: { element: "earth", multiplier: 1.15 },
  deep_forest: { element: "dark", multiplier: 1.1 },
  volcano: { element: "fire", multiplier: 1.25 },
  glacier: { element: "ice", multiplier: 1.25 },
  storm_plains: { element: "lightning", multiplier: 1.2 },
  temple: { element: "holy", multiplier: 1.2 },
  crypt: { element: "dark", multiplier: 1.2 },
  cave: { element: "earth", multiplier: 1.2 },
  swamp: { element: "dark", multiplier: 1.15 },
  ruins: { element: "holy", multiplier: 1.1 },
};
