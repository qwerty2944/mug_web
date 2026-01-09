import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MagicElement, MagicProficiencies } from "@/entities/proficiency";
import type { Spell, SpellProficiency, SpellType } from "../types";
import {
  fetchSpells,
  fetchSpellById,
  fetchSpellsByElement,
  fetchHealingSpells,
  fetchAttackSpells,
  fetchSpellProficiencies,
  fetchSpellProficiency,
  increaseSpellProficiency,
} from "../api";

// ============ Query Keys ============

export const spellKeys = {
  all: ["spells"] as const,
  byElement: (element: MagicElement) =>
    [...spellKeys.all, "element", element] as const,
  byType: (type: SpellType) =>
    [...spellKeys.all, "type", type] as const,
  byId: (spellId: string) =>
    [...spellKeys.all, "detail", spellId] as const,
  healing: () => [...spellKeys.all, "healing"] as const,
  attack: () => [...spellKeys.all, "attack"] as const,

  // 숙련도
  proficiency: {
    all: (userId: string) => ["spellProficiency", userId] as const,
    bySpell: (userId: string, spellId: string) =>
      ["spellProficiency", userId, spellId] as const,
  },
};

// ============ 주문 데이터 Queries ============

/**
 * 모든 주문 조회
 */
export function useSpells() {
  return useQuery({
    queryKey: spellKeys.all,
    queryFn: fetchSpells,
    staleTime: Infinity, // 정적 데이터
  });
}

/**
 * 속성별 주문 조회
 */
export function useSpellsByElement(element: MagicElement) {
  return useQuery({
    queryKey: spellKeys.byElement(element),
    queryFn: () => fetchSpellsByElement(element),
    staleTime: Infinity,
  });
}

/**
 * 타입별 주문 조회
 */
export function useSpellsByType(type: SpellType) {
  return useQuery({
    queryKey: spellKeys.byType(type),
    queryFn: async () => {
      const spells = await fetchSpells();
      return spells.filter((s) => s.type === type);
    },
    staleTime: Infinity,
  });
}

/**
 * 특정 주문 조회
 */
export function useSpell(spellId: string) {
  return useQuery({
    queryKey: spellKeys.byId(spellId),
    queryFn: () => fetchSpellById(spellId),
    staleTime: Infinity,
    enabled: !!spellId,
  });
}

/**
 * 치유 주문만 조회
 */
export function useHealingSpells() {
  return useQuery({
    queryKey: spellKeys.healing(),
    queryFn: fetchHealingSpells,
    staleTime: Infinity,
  });
}

/**
 * 공격 주문만 조회
 */
export function useAttackSpells() {
  return useQuery({
    queryKey: spellKeys.attack(),
    queryFn: fetchAttackSpells,
    staleTime: Infinity,
  });
}

// ============ 주문 숙련도 Queries ============

/**
 * 유저의 모든 주문 숙련도 조회
 */
export function useSpellProficiencies(userId: string | undefined) {
  return useQuery({
    queryKey: spellKeys.proficiency.all(userId || ""),
    queryFn: () => fetchSpellProficiencies(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 특정 주문의 숙련도 조회
 */
export function useSpellProficiency(
  userId: string | undefined,
  spellId: string
) {
  return useQuery({
    queryKey: spellKeys.proficiency.bySpell(userId || "", spellId),
    queryFn: () => fetchSpellProficiency(userId!, spellId),
    enabled: !!userId && !!spellId,
    staleTime: 1000 * 60 * 5,
  });
}

// ============ Mutations ============

interface IncreaseSpellProficiencyParams {
  spellId: string;
  amount?: number;
}

/**
 * 주문 숙련도 증가 훅
 */
export function useIncreaseSpellProficiency(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spellId, amount = 1 }: IncreaseSpellProficiencyParams) => {
      if (!userId) throw new Error("User ID required");
      return increaseSpellProficiency(userId, spellId, amount);
    },
    onSuccess: (_, { spellId }) => {
      // 해당 주문 숙련도 캐시 무효화
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: spellKeys.proficiency.all(userId),
        });
        queryClient.invalidateQueries({
          queryKey: spellKeys.proficiency.bySpell(userId, spellId),
        });
      }
    },
  });
}

// ============ 유틸리티 훅 ============

/**
 * 사용 가능한 주문 목록 (요구 조건 충족)
 */
export function useAvailableSpells(
  userId: string | undefined,
  options: {
    karma?: number;
    piety?: number;
    religion?: string;
    proficiencies?: MagicProficiencies;
  }
) {
  const { data: spells, isLoading } = useSpells();
  const { karma, piety, religion, proficiencies } = options;

  const availableSpells = spells?.filter((spell) => {
    const req = spell.requirements;

    // 숙련도 체크
    if (req.proficiency && proficiencies) {
      const elementProficiency = proficiencies[spell.element] ?? 0;
      if (elementProficiency < req.proficiency) return false;
    }

    // 카르마 체크 (양수: 이상, 음수: 이하)
    if (req.karma !== undefined && karma !== undefined) {
      if (req.karma >= 0 && karma < req.karma) return false;
      if (req.karma < 0 && karma > req.karma) return false;
    }

    // 신앙심 체크
    if (req.piety !== undefined && (piety ?? 0) < req.piety) return false;

    // 종교 체크
    if (req.religion && religion !== req.religion) return false;

    return true;
  });

  return {
    data: availableSpells ?? [],
    isLoading,
  };
}

/**
 * 속성별로 그룹화된 주문 조회
 */
export function useSpellsGroupedByElement() {
  const { data: spells, isLoading } = useSpells();

  const grouped = spells?.reduce((acc, spell) => {
    if (!acc[spell.element]) {
      acc[spell.element] = [];
    }
    acc[spell.element].push(spell);
    return acc;
  }, {} as Record<MagicElement, Spell[]>);

  return {
    data: grouped,
    isLoading,
  };
}
