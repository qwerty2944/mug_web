import type { Item, ItemsData, ItemType } from "../types";

// 메모리 캐시
let itemsCache: Item[] | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5분
let cacheTimestamp: number = 0;

/**
 * public 폴더에서 아이템 데이터 가져오기
 */
async function fetchFromPublic(): Promise<Item[]> {
  const response = await fetch("/data/items/items.json");
  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }
  const parsed: ItemsData = await response.json();
  return parsed.items;
}

/**
 * 모든 아이템 조회
 */
export async function fetchItems(): Promise<Item[]> {
  // 캐시 확인
  const now = Date.now();
  if (itemsCache && now - cacheTimestamp < CACHE_TTL) {
    return itemsCache;
  }

  itemsCache = await fetchFromPublic();
  cacheTimestamp = now;
  return itemsCache;
}

/**
 * ID로 아이템 조회
 */
export async function fetchItemById(itemId: string): Promise<Item | null> {
  const items = await fetchItems();
  return items.find((i) => i.id === itemId) || null;
}

/**
 * 타입별 아이템 조회
 */
export async function fetchItemsByType(type: ItemType): Promise<Item[]> {
  const items = await fetchItems();
  return items.filter((i) => i.type === type);
}

/**
 * 태그로 아이템 조회
 */
export async function fetchItemsByTag(tag: string): Promise<Item[]> {
  const items = await fetchItems();
  return items.filter((i) => i.tags.includes(tag));
}

/**
 * 여러 ID로 아이템 조회
 */
export async function fetchItemsByIds(itemIds: string[]): Promise<Item[]> {
  const items = await fetchItems();
  return items.filter((i) => itemIds.includes(i.id));
}

/**
 * 캐시 초기화
 */
export function clearItemsCache(): void {
  itemsCache = null;
  cacheTimestamp = 0;
}
