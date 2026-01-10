import type { CharacterStats } from "@/entities/character";
import type { Item, ItemRarity } from "../types";
import { RARITY_CONFIG, WEIGHT_CONFIG } from "../types";

// ============ 등급 관련 ============

/**
 * 등급 색상 반환
 */
export function getRarityColor(rarity: ItemRarity): string {
  return RARITY_CONFIG[rarity].color;
}

/**
 * 등급 이름 반환
 */
export function getRarityName(rarity: ItemRarity, locale: "ko" | "en" = "ko"): string {
  const info = RARITY_CONFIG[rarity];
  return locale === "ko" ? info.nameKo : info.nameEn;
}

/**
 * 등급 비교 (정렬용)
 */
export function compareRarity(a: ItemRarity, b: ItemRarity): number {
  return RARITY_CONFIG[a].tier - RARITY_CONFIG[b].tier;
}

/**
 * 등급 tier 반환
 */
export function getRarityTier(rarity: ItemRarity): number {
  return RARITY_CONFIG[rarity].tier;
}

/**
 * 등급 배율 적용된 드랍률
 */
export function applyRarityToDropChance(baseChance: number, rarity: ItemRarity): number {
  return baseChance * RARITY_CONFIG[rarity].dropRateMultiplier;
}

// ============ 무게 시스템 ============

/**
 * 플레이어 최대 소지량 계산
 */
export function calculateMaxCarryCapacity(stats: CharacterStats): number {
  return WEIGHT_CONFIG.BASE_CARRY_CAPACITY + stats.str * WEIGHT_CONFIG.STR_BONUS_PER_POINT;
}

/**
 * 아이템 목록 총 무게 계산
 */
export function calculateTotalWeight(items: { item: Item; quantity: number }[]): number {
  return items.reduce((total, { item, quantity }) => {
    return total + item.weight * quantity;
  }, 0);
}

/**
 * 아이템 획득 가능 여부 (무게 체크)
 */
export function canCarryItem(
  currentWeight: number,
  itemToAdd: Item,
  quantity: number,
  maxCapacity: number
): boolean {
  const additionalWeight = itemToAdd.weight * quantity;
  const newTotal = currentWeight + additionalWeight;
  return newTotal <= maxCapacity * WEIGHT_CONFIG.MAX_OVERWEIGHT_RATIO;
}

/**
 * 과적 상태 확인
 */
export function getOverweightStatus(
  currentWeight: number,
  maxCapacity: number
): {
  isOverweight: boolean;
  speedPenalty: number;
  percentage: number;
  canPickup: boolean;
} {
  const percentage = (currentWeight / maxCapacity) * 100;
  const isOverweight = currentWeight > maxCapacity;
  const speedPenalty = isOverweight ? WEIGHT_CONFIG.OVERWEIGHT_SPEED_PENALTY : 0;
  const canPickup = currentWeight < maxCapacity * WEIGHT_CONFIG.MAX_OVERWEIGHT_RATIO;

  return { isOverweight, speedPenalty, percentage, canPickup };
}

// ============ 가격 관련 ============

/**
 * 등급 배율 적용된 판매가
 */
export function calculateSellPrice(item: Item): number {
  return Math.floor(item.sellPrice * RARITY_CONFIG[item.rarity].valueMultiplier);
}

/**
 * 등급 배율 적용된 구매가
 */
export function calculateBuyPrice(item: Item): number {
  return Math.floor(item.value * RARITY_CONFIG[item.rarity].valueMultiplier);
}

// ============ 아이템 유틸리티 ============

/**
 * 소비 아이템 여부
 */
export function isConsumable(item: Item): boolean {
  return item.type === "consumable" && !!item.consumableEffect;
}

/**
 * 장비 아이템 여부
 */
export function isEquippable(item: Item): boolean {
  return item.type === "equipment" && !!item.equipmentData;
}

/**
 * 장비 장착 가능 여부 (레벨 체크)
 */
export function canEquipItem(item: Item, playerLevel: number): boolean {
  if (!item.equipmentData) return false;
  const { requiredLevel } = item.equipmentData;
  if (requiredLevel && playerLevel < requiredLevel) return false;
  return true;
}

/**
 * 스택 가능한 최대 수량
 */
export function getMaxStack(item: Item): number {
  if (!item.stackable) return 1;
  return item.maxStack || 99;
}

// ============ 포맷팅 ============

/**
 * 무게 포맷팅
 */
export function formatWeight(weight: number): string {
  if (weight < 1) {
    return `${(weight * 1000).toFixed(0)}g`;
  }
  return `${weight.toFixed(1)}kg`;
}

/**
 * 아이템 요약 정보
 */
export function formatItemSummary(item: Item): string {
  const rarityName = getRarityName(item.rarity, "ko");
  return `${item.icon} [${rarityName}] ${item.nameKo}`;
}

/**
 * 장비 스탯 요약
 */
export function formatEquipmentStats(item: Item): string {
  if (!item.equipmentData) return "";

  const stats = item.equipmentData.stats;
  const parts: string[] = [];

  if (stats.attack) parts.push(`ATK +${stats.attack}`);
  if (stats.defense) parts.push(`DEF +${stats.defense}`);
  if (stats.magic) parts.push(`MAG +${stats.magic}`);
  if (stats.hp) parts.push(`HP +${stats.hp}`);
  if (stats.mp) parts.push(`MP +${stats.mp}`);
  if (stats.speed) parts.push(`SPD +${stats.speed}`);
  if (stats.critRate) parts.push(`CRT +${stats.critRate}%`);
  if (stats.critDamage) parts.push(`CDMG +${stats.critDamage}%`);

  return parts.join(", ");
}

// ============ 스프라이트 조회 시스템 ============

import type { SpriteCategory, SpriteReference } from "../types";

// 스프라이트 데이터 캐시
interface SpriteData {
  sprites: string[];
  nameToIndex: Record<string, number>;
  count: number;
}

const spriteDataCache: Partial<Record<SpriteCategory, SpriteData>> = {};

// 카테고리별 JSON 파일 경로
const SPRITE_JSON_PATHS: Record<SpriteCategory, string> = {
  sword: "/data/sprites/equipment/weapons/sword.json",
  shield: "/data/sprites/equipment/weapons/shield.json",
  axe: "/data/sprites/equipment/weapons/axe.json",
  bow: "/data/sprites/equipment/weapons/bow.json",
  wand: "/data/sprites/equipment/weapons/wand.json",
  armor: "/data/sprites/equipment/armor/armor.json",
  cloth: "/data/sprites/equipment/armor/cloth.json",
  helmet: "/data/sprites/equipment/armor/helmet.json",
  pant: "/data/sprites/equipment/armor/pant.json",
};

/**
 * 스프라이트 데이터 로드 (캐시 사용)
 */
export async function loadSpriteData(category: SpriteCategory): Promise<SpriteData | null> {
  // 캐시 확인
  if (spriteDataCache[category]) {
    return spriteDataCache[category]!;
  }

  const path = SPRITE_JSON_PATHS[category];
  if (!path) return null;

  try {
    const response = await fetch(path);
    if (!response.ok) return null;

    const data = await response.json();
    const spriteData: SpriteData = {
      sprites: data.sprites || [],
      nameToIndex: data.nameToIndex || {},
      count: data.count || 0,
    };

    spriteDataCache[category] = spriteData;
    return spriteData;
  } catch {
    console.warn(`Failed to load sprite data for category: ${category}`);
    return null;
  }
}

/**
 * 스프라이트 이름으로 인덱스 조회 (동기 - 캐시 필요)
 */
export function getSpriteIndex(category: SpriteCategory, spriteName: string): number {
  const cached = spriteDataCache[category];
  if (!cached) {
    console.warn(`Sprite data not loaded for category: ${category}. Call loadSpriteData first.`);
    return -1;
  }

  const index = cached.nameToIndex[spriteName];
  return index ?? -1;
}

/**
 * 스프라이트 이름으로 인덱스 조회 (비동기 - 캐시 자동 로드)
 */
export async function getSpriteIndexAsync(category: SpriteCategory, spriteName: string): Promise<number> {
  const data = await loadSpriteData(category);
  if (!data) return -1;

  return data.nameToIndex[spriteName] ?? -1;
}

/**
 * SpriteReference에서 Unity 인덱스 조회 (비동기)
 */
export async function resolveSpriteIndex(sprite: SpriteReference): Promise<number> {
  return getSpriteIndexAsync(sprite.category, sprite.spriteName);
}

/**
 * SpriteReference에서 Unity 인덱스 조회 (동기 - 캐시 필요)
 */
export function resolveSpriteIndexSync(sprite: SpriteReference): number {
  return getSpriteIndex(sprite.category, sprite.spriteName);
}

/**
 * 모든 스프라이트 카테고리 데이터 프리로드
 */
export async function preloadAllSpriteData(): Promise<void> {
  const categories = Object.keys(SPRITE_JSON_PATHS) as SpriteCategory[];
  await Promise.all(categories.map(loadSpriteData));
}

/**
 * 스프라이트 데이터 캐시 초기화
 */
export function clearSpriteCache(): void {
  Object.keys(spriteDataCache).forEach((key) => {
    delete spriteDataCache[key as SpriteCategory];
  });
}

/**
 * 카테고리의 총 스프라이트 수 반환
 */
export function getSpriteCount(category: SpriteCategory): number {
  const cached = spriteDataCache[category];
  return cached?.count ?? 0;
}

/**
 * 인덱스로 스프라이트 이름 조회 (역방향)
 */
export function getSpriteNameByIndex(category: SpriteCategory, index: number): string | null {
  const cached = spriteDataCache[category];
  if (!cached || index < 0 || index >= cached.sprites.length) {
    return null;
  }
  return cached.sprites[index];
}
