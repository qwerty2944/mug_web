import { useQuery } from "@tanstack/react-query";
import type { Skill, SkillsData, SkillCategory, SkillUITab } from "../types";
import { getSkillUITab } from "../types";

// Query keys
export const skillKeys = {
  all: ["skills"] as const,
  byCategory: (category: SkillCategory) =>
    [...skillKeys.all, "category", category] as const,
  byUITab: (tab: SkillUITab) => [...skillKeys.all, "tab", tab] as const,
  byType: (type: string) => [...skillKeys.all, "type", type] as const,
};

// Skills 데이터 로드 (v2 구조)
async function fetchSkills(): Promise<Skill[]> {
  const response = await fetch("/data/combat/skills.json");
  if (!response.ok) {
    throw new Error("Failed to fetch skills data");
  }
  const data: SkillsData = await response.json();
  return data.combatSkills;
}

// 전체 데이터 로드 (summary 포함)
async function fetchSkillsData(): Promise<SkillsData> {
  const response = await fetch("/data/combat/skills.json");
  if (!response.ok) {
    throw new Error("Failed to fetch skills data");
  }
  return response.json();
}

/**
 * 모든 전투 스킬 조회
 */
export function useSkills() {
  return useQuery({
    queryKey: skillKeys.all,
    queryFn: fetchSkills,
    staleTime: Infinity, // 정적 데이터이므로 캐싱
  });
}

/**
 * 전체 스킬 데이터 (summary 포함) 조회
 */
export function useSkillsData() {
  return useQuery({
    queryKey: [...skillKeys.all, "full"],
    queryFn: fetchSkillsData,
    staleTime: Infinity,
  });
}

/**
 * 카테고리별 스킬 필터링 (sword, axe, martial 등)
 */
export function useSkillsByCategory(category: SkillCategory) {
  return useQuery({
    queryKey: skillKeys.byCategory(category),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => skill.category === category);
    },
    staleTime: Infinity,
  });
}

/**
 * UI 탭별 스킬 필터링 (weapon, martial, defense, utility)
 */
export function useSkillsByUITab(tab: SkillUITab) {
  return useQuery({
    queryKey: skillKeys.byUITab(tab),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => getSkillUITab(skill) === tab);
    },
    staleTime: Infinity,
  });
}

/**
 * 특정 스킬 ID로 조회
 */
export function useSkill(skillId: string) {
  const { data: skills } = useSkills();
  return skills?.find((s) => s.id === skillId);
}

/**
 * 무기 공격 스킬만 조회
 */
export function useWeaponSkills() {
  return useQuery({
    queryKey: skillKeys.byType("weapon_attack"),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => skill.type === "weapon_attack");
    },
    staleTime: Infinity,
  });
}

/**
 * 무술 공격 스킬만 조회
 */
export function useMartialSkills() {
  return useQuery({
    queryKey: skillKeys.byType("martial_attack"),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter(
        (skill) =>
          skill.type === "martial_attack" || skill.category === "martial"
      );
    },
    staleTime: Infinity,
  });
}

/**
 * 방어 스킬만 조회
 */
export function useDefensiveSkills() {
  return useQuery({
    queryKey: skillKeys.byType("defensive"),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter(
        (skill) => skill.type === "defensive" || skill.category === "defense"
      );
    },
    staleTime: Infinity,
  });
}

/**
 * 버프 스킬만 조회
 */
export function useBuffSkills() {
  return useQuery({
    queryKey: skillKeys.byType("buff"),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => skill.type === "buff");
    },
    staleTime: Infinity,
  });
}

/**
 * 디버프 스킬만 조회
 */
export function useDebuffSkills() {
  return useQuery({
    queryKey: skillKeys.byType("debuff"),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => skill.type === "debuff");
    },
    staleTime: Infinity,
  });
}

/**
 * 공격 스킬 조회 (weapon_attack + martial_attack)
 */
export function useAttackSkills() {
  return useQuery({
    queryKey: [...skillKeys.all, "attacks"],
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter(
        (skill) =>
          skill.type === "weapon_attack" || skill.type === "martial_attack"
      );
    },
    staleTime: Infinity,
  });
}

/**
 * 특정 무기 카테고리의 스킬 조회
 */
export function useWeaponCategorySkills(
  weaponType:
    | "sword"
    | "axe"
    | "mace"
    | "dagger"
    | "spear"
    | "bow"
    | "crossbow"
    | "staff"
) {
  return useQuery({
    queryKey: skillKeys.byCategory(weaponType),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => skill.category === weaponType);
    },
    staleTime: Infinity,
  });
}

/**
 * 막기/회피 보너스가 있는 스킬 조회
 */
export function useDefenseBonusSkills() {
  return useQuery({
    queryKey: [...skillKeys.all, "defense_bonus"],
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter(
        (skill) =>
          (skill.blockBonus !== undefined && skill.blockBonus > 0) ||
          (skill.dodgeBonus !== undefined && skill.dodgeBonus > 0) ||
          (skill.damageReduction !== undefined && skill.damageReduction > 0)
      );
    },
    staleTime: Infinity,
  });
}
