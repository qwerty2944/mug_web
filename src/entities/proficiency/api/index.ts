import { supabase } from "@/shared/api";
import type {
  Proficiencies,
  ProficiencyType,
  ProficiencyCategory,
  WeaponType,
  MagicElement,
  CraftingType,
  MedicalType,
  KnowledgeType,
} from "../types";
import {
  DEFAULT_WEAPON_PROFICIENCIES,
  DEFAULT_MAGIC_PROFICIENCIES,
  DEFAULT_CRAFTING_PROFICIENCIES,
  DEFAULT_MEDICAL_PROFICIENCIES,
  DEFAULT_KNOWLEDGE_PROFICIENCIES,
  DEFAULT_PROFICIENCIES,
} from "../types";

// ============ 타입-카테고리 매핑 ============

const WEAPON_TYPES: WeaponType[] = [
  "light_sword", "medium_sword", "great_sword", "axe", "mace",
  "dagger", "spear", "bow", "crossbow", "staff", "fist",
];

const MAGIC_TYPES: MagicElement[] = [
  "fire", "ice", "lightning", "earth", "holy", "dark", "poison",
];

const CRAFTING_TYPES: CraftingType[] = [
  "blacksmithing", "tailoring", "cooking", "alchemy", "jewelcrafting",
];

const MEDICAL_TYPES: MedicalType[] = [
  "first_aid", "herbalism", "surgery",
];

const KNOWLEDGE_TYPES: KnowledgeType[] = [
  "anatomy", "metallurgy", "botany", "gemology",
];

/**
 * 숙련도 타입에서 카테고리 추출
 */
export function getCategoryForType(type: ProficiencyType): ProficiencyCategory {
  if (WEAPON_TYPES.includes(type as WeaponType)) return "weapon";
  if (MAGIC_TYPES.includes(type as MagicElement)) return "magic";
  if (CRAFTING_TYPES.includes(type as CraftingType)) return "crafting";
  if (MEDICAL_TYPES.includes(type as MedicalType)) return "medical";
  if (KNOWLEDGE_TYPES.includes(type as KnowledgeType)) return "knowledge";
  throw new Error(`Unknown proficiency type: ${type}`);
}

/**
 * 숙련도 값 조회 헬퍼
 */
export function getProficiencyValue(
  proficiencies: Proficiencies | undefined,
  type: ProficiencyType
): number {
  if (!proficiencies) return 0;

  const category = getCategoryForType(type);
  const categoryData = proficiencies[category];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (categoryData as any)?.[type] ?? 0;
}

// ============ API 함수 ============

/**
 * 사용자의 숙련도 조회
 */
export async function fetchProficiencies(userId: string): Promise<Proficiencies> {
  const { data, error } = await supabase
    .from("proficiencies")
    .select("weapon, magic, crafting, medical, knowledge")
    .eq("user_id", userId)
    .single();

  if (error) {
    // 레코드가 없으면 기본값 생성
    if (error.code === "PGRST116") {
      const { data: newData, error: insertError } = await supabase
        .from("proficiencies")
        .insert({
          user_id: userId,
          weapon: DEFAULT_WEAPON_PROFICIENCIES,
          magic: DEFAULT_MAGIC_PROFICIENCIES,
          crafting: DEFAULT_CRAFTING_PROFICIENCIES,
          medical: DEFAULT_MEDICAL_PROFICIENCIES,
          knowledge: DEFAULT_KNOWLEDGE_PROFICIENCIES,
        })
        .select("weapon, magic, crafting, medical, knowledge")
        .single();

      if (insertError) throw insertError;
      return mapToProficiencies(newData);
    }
    throw error;
  }

  return mapToProficiencies(data);
}

/**
 * 숙련도 증가 (RPC 함수 호출)
 */
export async function increaseProficiency(
  userId: string,
  type: ProficiencyType,
  amount: number = 1
): Promise<number> {
  const category = getCategoryForType(type);

  const { data, error } = await supabase.rpc("increase_proficiency", {
    p_user_id: userId,
    p_category: category,
    p_type: type,
    p_amount: amount,
  });

  if (error) throw error;
  return data as number;
}

/**
 * 숙련도 직접 설정 (테스트/관리용)
 */
export async function setProficiency(
  userId: string,
  type: ProficiencyType,
  value: number
): Promise<void> {
  const category = getCategoryForType(type);
  const clampedValue = Math.max(0, Math.min(100, value));

  // JSONB 필드 업데이트
  const { data: current, error: fetchError } = await supabase
    .from("proficiencies")
    .select(category)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw fetchError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedCategory = { ...(current as any)[category], [type]: clampedValue };

  const { error } = await supabase
    .from("proficiencies")
    .update({ [category]: updatedCategory, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw error;
}

// ============ 헬퍼 함수 ============

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToProficiencies(data: any): Proficiencies {
  if (!data) return DEFAULT_PROFICIENCIES;

  return {
    weapon: {
      ...DEFAULT_WEAPON_PROFICIENCIES,
      ...(data.weapon || {}),
    },
    magic: {
      ...DEFAULT_MAGIC_PROFICIENCIES,
      ...(data.magic || {}),
    },
    crafting: {
      ...DEFAULT_CRAFTING_PROFICIENCIES,
      ...(data.crafting || {}),
    },
    medical: {
      ...DEFAULT_MEDICAL_PROFICIENCIES,
      ...(data.medical || {}),
    },
    knowledge: {
      ...DEFAULT_KNOWLEDGE_PROFICIENCIES,
      ...(data.knowledge || {}),
    },
  };
}
