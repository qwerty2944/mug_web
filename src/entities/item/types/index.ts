import type { ProficiencyType } from "@/entities/proficiency";

// ============ Item Rarity (아키에이지 13단계 시스템) ============

export type ItemRarity =
  | "crude"      // 저급
  | "common"     // 일반
  | "grand"      // 고급
  | "rare"       // 희귀
  | "arcane"     // 고대
  | "heroic"     // 영웅
  | "unique"     // 유일
  | "celestial"  // 유물
  | "divine"     // 경이
  | "epic"       // 서사
  | "legendary"  // 전설
  | "mythic"     // 신화
  | "eternal";   // 태초

export interface RarityInfo {
  id: ItemRarity;
  nameKo: string;
  nameEn: string;
  color: string;
  dropRateMultiplier: number;
  valueMultiplier: number;
  tier: number; // 0-12
}

export const RARITY_CONFIG: Record<ItemRarity, RarityInfo> = {
  crude: {
    id: "crude",
    nameKo: "저급",
    nameEn: "Crude",
    color: "#6B7280", // gray-500
    dropRateMultiplier: 1.5,
    valueMultiplier: 0.5,
    tier: 0,
  },
  common: {
    id: "common",
    nameKo: "일반",
    nameEn: "Common",
    color: "#D1D5DB", // gray-300
    dropRateMultiplier: 1.0,
    valueMultiplier: 1.0,
    tier: 1,
  },
  grand: {
    id: "grand",
    nameKo: "고급",
    nameEn: "Grand",
    color: "#22C55E", // green-500
    dropRateMultiplier: 0.6,
    valueMultiplier: 2.0,
    tier: 2,
  },
  rare: {
    id: "rare",
    nameKo: "희귀",
    nameEn: "Rare",
    color: "#3B82F6", // blue-500
    dropRateMultiplier: 0.35,
    valueMultiplier: 4.0,
    tier: 3,
  },
  arcane: {
    id: "arcane",
    nameKo: "고대",
    nameEn: "Arcane",
    color: "#EAB308", // yellow-500
    dropRateMultiplier: 0.2,
    valueMultiplier: 8.0,
    tier: 4,
  },
  heroic: {
    id: "heroic",
    nameKo: "영웅",
    nameEn: "Heroic",
    color: "#F97316", // orange-500
    dropRateMultiplier: 0.12,
    valueMultiplier: 15.0,
    tier: 5,
  },
  unique: {
    id: "unique",
    nameKo: "유일",
    nameEn: "Unique",
    color: "#A855F7", // purple-500
    dropRateMultiplier: 0.07,
    valueMultiplier: 30.0,
    tier: 6,
  },
  celestial: {
    id: "celestial",
    nameKo: "유물",
    nameEn: "Celestial",
    color: "#EF4444", // red-500
    dropRateMultiplier: 0.03,
    valueMultiplier: 60.0,
    tier: 7,
  },
  divine: {
    id: "divine",
    nameKo: "경이",
    nameEn: "Divine",
    color: "#EC4899", // pink-500
    dropRateMultiplier: 0.015,
    valueMultiplier: 120.0,
    tier: 8,
  },
  epic: {
    id: "epic",
    nameKo: "서사",
    nameEn: "Epic",
    color: "#06B6D4", // cyan-500
    dropRateMultiplier: 0.007,
    valueMultiplier: 250.0,
    tier: 9,
  },
  legendary: {
    id: "legendary",
    nameKo: "전설",
    nameEn: "Legendary",
    color: "#F59E0B", // amber-500
    dropRateMultiplier: 0.003,
    valueMultiplier: 500.0,
    tier: 10,
  },
  mythic: {
    id: "mythic",
    nameKo: "신화",
    nameEn: "Mythic",
    color: "#FF6B6B", // special red-pink
    dropRateMultiplier: 0.001,
    valueMultiplier: 1000.0,
    tier: 11,
  },
  eternal: {
    id: "eternal",
    nameKo: "태초",
    nameEn: "Eternal",
    color: "#FFD700", // gold
    dropRateMultiplier: 0.0003,
    valueMultiplier: 2500.0,
    tier: 12,
  },
};

// ============ Item Types ============

export type ItemType = "equipment" | "consumable" | "material" | "misc";

export interface ItemTypeInfo {
  id: ItemType;
  nameKo: string;
  nameEn: string;
  icon: string;
}

export const ITEM_TYPE_CONFIG: Record<ItemType, ItemTypeInfo> = {
  equipment: { id: "equipment", nameKo: "장비", nameEn: "Equipment", icon: "⚔️" },
  consumable: { id: "consumable", nameKo: "소비", nameEn: "Consumable", icon: "🧪" },
  material: { id: "material", nameKo: "재료", nameEn: "Material", icon: "🪨" },
  misc: { id: "misc", nameKo: "기타", nameEn: "Misc", icon: "📦" },
};

// ============ Equipment Slots (12슬롯 시스템) ============

// 12개 장비 슬롯
export type EquipmentSlot =
  // 외형 변경 슬롯 (6)
  | "mainHand"    // 주무기
  | "offHand"     // 보조 (방패/횃불/한손무기)
  | "helmet"      // 투구
  | "armor"       // 갑옷 (외피)
  | "cloth"       // 의복 (내피)
  | "pants"       // 바지
  // 장신구 슬롯 (6)
  | "ring1" | "ring2"
  | "necklace"
  | "earring1" | "earring2"
  | "bracelet";

// 구 슬롯 (마이그레이션용)
export type LegacyEquipmentSlot = "weapon" | "armor" | "helmet" | "accessory";

// 무기 손 타입
export type WeaponHandType = "one_handed" | "two_handed";

// 오프핸드 아이템 타입
export type OffHandItemType = "shield" | "torch" | "weapon";

// 장신구 타입
export type AccessoryType = "ring" | "necklace" | "earring" | "bracelet";

// 슬롯 카테고리
export type SlotCategory = "weapon" | "armor" | "accessory";

// 슬롯 설정 정보
export interface SlotConfigInfo {
  nameKo: string;
  icon: string;
  category: SlotCategory;
  unityPart?: string;  // Unity 외형 연동용
}

// 슬롯 설정
export const SLOT_CONFIG: Record<EquipmentSlot, SlotConfigInfo> = {
  // 무기 슬롯
  mainHand: { nameKo: "주무기", icon: "⚔️", category: "weapon" },
  offHand: { nameKo: "보조", icon: "🛡️", category: "weapon" },
  // 방어구 슬롯 (외형 변경)
  helmet: { nameKo: "투구", icon: "🪖", category: "armor", unityPart: "Helmet" },
  armor: { nameKo: "갑옷", icon: "🥋", category: "armor", unityPart: "Armor" },
  cloth: { nameKo: "의복", icon: "👕", category: "armor", unityPart: "Cloth" },
  pants: { nameKo: "바지", icon: "👖", category: "armor", unityPart: "Pant" },
  // 장신구 슬롯
  ring1: { nameKo: "반지1", icon: "💍", category: "accessory" },
  ring2: { nameKo: "반지2", icon: "💍", category: "accessory" },
  necklace: { nameKo: "목걸이", icon: "📿", category: "accessory" },
  earring1: { nameKo: "귀걸이1", icon: "✨", category: "accessory" },
  earring2: { nameKo: "귀걸이2", icon: "✨", category: "accessory" },
  bracelet: { nameKo: "팔찌", icon: "⭕", category: "accessory" },
};

// 외형 변경 슬롯 목록
export const APPEARANCE_SLOTS: EquipmentSlot[] = [
  "mainHand", "offHand", "helmet", "armor", "cloth", "pants"
];

// 장신구 슬롯 목록
export const ACCESSORY_SLOTS: EquipmentSlot[] = [
  "ring1", "ring2", "necklace", "earring1", "earring2", "bracelet"
];

// 슬롯이 외형에 영향을 주는지 확인
export function isAppearanceSlot(slot: EquipmentSlot): boolean {
  return APPEARANCE_SLOTS.includes(slot);
}

// 슬롯이 장신구인지 확인
export function isAccessorySlot(slot: EquipmentSlot): boolean {
  return ACCESSORY_SLOTS.includes(slot);
}

// ============ Consumable Effects ============

export type ConsumableEffectType =
  | "heal"
  | "heal_percent"
  | "mana"
  | "mana_percent"
  | "stamina"
  | "buff"
  | "cure";

export interface ConsumableEffect {
  type: ConsumableEffectType;
  value: number;
  target: "self";
  statusEffect?: string;
  duration?: number;
}

// ============ Equipment Data ============

export interface EquipmentStats {
  // 기본 스탯
  attack?: number;
  defense?: number;
  magic?: number;
  hp?: number;
  mp?: number;
  speed?: number;
  critRate?: number;
  critDamage?: number;
  // 능력치 보너스 (장신구용)
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  lck?: number;
  // 특수 효과
  blockChance?: number;   // 막기 확률 (방패)
  lightRadius?: number;   // 시야 반경 (횃불)
}

export interface EquipmentData {
  slot: EquipmentSlot;
  weaponType?: ProficiencyType;
  handType?: WeaponHandType;        // 한손/양손 (무기용)
  offHandType?: OffHandItemType;    // 오프핸드 타입 (방패/횃불/무기)
  accessoryType?: AccessoryType;    // 장신구 타입
  unityPartIndex?: number;          // Unity 스프라이트 인덱스
  stats: EquipmentStats;
  requiredLevel?: number;
}

// ============ Item Description ============

export interface ItemDescription {
  ko: string;
  en: string;
}

// ============ Base Item ============

export interface Item {
  id: string;
  nameKo: string;
  nameEn: string;
  description: ItemDescription;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  weight: number;
  value: number;
  sellPrice: number;
  stackable: boolean;
  maxStack?: number;
  tags: string[];
  consumableEffect?: ConsumableEffect;
  equipmentData?: EquipmentData;
}

// ============ JSON File Structure ============

export interface ItemsData {
  version: string;
  generatedAt: string;
  items: Item[];
  summary: {
    total: number;
    byType: Record<ItemType, number>;
    byRarity: Record<ItemRarity, number>;
  };
}

// ============ Weight System ============

export const WEIGHT_CONFIG = {
  BASE_CARRY_CAPACITY: 50,
  STR_BONUS_PER_POINT: 2,
  OVERWEIGHT_SPEED_PENALTY: 0.5,
  MAX_OVERWEIGHT_RATIO: 1.5,
} as const;
