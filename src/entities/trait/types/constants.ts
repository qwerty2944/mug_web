/**
 * Trait System Constants
 */

import type { TraitRarity } from "./index";

// ============ 희귀도 순서 ============
export const TRAIT_RARITY_ORDER: TraitRarity[] = [
  "common",
  "uncommon",
  "rare",
  "legendary",
];

// ============ 스탯 아이콘 ============
export const STAT_ICONS: Record<string, string> = {
  str: "💪",
  dex: "🏃",
  con: "❤️",
  int: "🧠",
  wis: "🔮",
  cha: "✨",
  lck: "🍀",
};

// ============ 스탯 한글명 ============
export const STAT_NAMES_KO: Record<string, string> = {
  str: "힘",
  dex: "민첩",
  con: "체력",
  int: "지능",
  wis: "지혜",
  cha: "매력",
  lck: "행운",
};

// ============ 특수 효과 한글명 ============
export const SPECIAL_EFFECT_NAMES_KO: Record<string, string> = {
  // 저항/취약
  fear_resistance: "공포 저항",
  disease_resistance: "질병 저항",
  poison_resistance: "독 저항",
  fire_resistance: "화염 저항",
  ice_resistance: "냉기 저항",
  lightning_resistance: "번개 저항",
  holy_resistance: "신성 저항",
  dark_resistance: "암흑 저항",
  // 전투 보너스
  physical_damage: "물리 데미지",
  magic_damage: "마법 데미지",
  critical_chance: "치명타 확률",
  dodge_chance: "회피 확률",
  block_chance: "막기 확률",
  accuracy: "명중률",
  flee_chance: "도주 확률",
  // 경제/성장
  gold_gain: "골드 획득",
  exp_gain: "경험치 획득",
  rare_drop: "희귀 드롭률",
  proficiency_gain: "숙련도 획득",
  // 특수
  dual_wield: "이도류",
  healing_power: "치유량",
  purchase_cost: "구매 비용",
  intimidation: "위협",
  persuasion: "설득",
  night_bonus: "밤 행동",
  day_bonus: "낮 행동",
};

// ============ NPC 타입 한글명 ============
export const NPC_TYPE_NAMES_KO: Record<string, string> = {
  noble: "귀족",
  commoner: "평민",
  merchant: "상인",
  guard: "경비병",
  priest: "사제",
  criminal: "범죄자",
  monster: "몬스터",
};

// ============ 손잡이 한글명 ============
export const HANDEDNESS_NAMES_KO: Record<string, string> = {
  right: "오른손잡이",
  left: "왼손잡이",
  ambidextrous: "양손잡이",
};

// ============ 트레이트 소스 한글명 ============
export const TRAIT_SOURCE_NAMES_KO: Record<string, string> = {
  birth: "출생",
  event: "이벤트",
  achievement: "업적",
  quest: "퀘스트",
};
