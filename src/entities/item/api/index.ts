import { supabase } from "@/shared/api/supabase";
import { STORAGE_CONFIG } from "@/shared/config/storage";
import type { Item, ItemsData, ItemType } from "../types";

// 메모리 캐시
let itemsCache: Item[] | null = null;
let cacheTimestamp: number = 0;

/**
 * Supabase Storage에서 아이템 데이터 가져오기
 */
async function fetchFromStorage(): Promise<Item[]> {
  const { data, error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .download(`${STORAGE_CONFIG.MAPPING_PATH}/items.json`);

  if (error || !data) {
    throw new Error(`Failed to fetch items from storage: ${error?.message}`);
  }

  const text = await data.text();
  const parsed: ItemsData = JSON.parse(text);
  return parsed.items;
}

/**
 * 로컬 fallback에서 아이템 데이터 가져오기
 */
async function fetchFromLocal(): Promise<Item[]> {
  const response = await fetch("/data/items/items.json");
  if (!response.ok) {
    throw new Error("Failed to fetch items from local");
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
  if (itemsCache && now - cacheTimestamp < STORAGE_CONFIG.CACHE_TTL) {
    return itemsCache;
  }

  try {
    // Storage에서 먼저 시도
    itemsCache = await fetchFromStorage();
  } catch {
    // 실패 시 로컬 fallback
    console.warn("Falling back to local items.json");
    itemsCache = await fetchFromLocal();
  }

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
