import type { MagicElement, ProficiencyType } from "@/entities/proficiency";
import type { StatusType } from "@/entities/status";

// 스킬 타입
export type SkillType =
  | "physical_attack"  // 물리 공격
  | "magic_attack"     // 마법 공격
  | "heal"             // 즉시 회복
  | "buff"             // 버프
  | "debuff";          // 디버프

// 스킬 대상
export type SkillTarget =
  | "self"             // 자신
  | "enemy"            // 적
  | "ally"             // 아군 (추후 파티 시스템)
  | "all_enemies"      // 모든 적 (추후 확장)
  | "all_allies";      // 모든 아군 (추후 확장)

// 스킬 정의
export interface Skill {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  type: SkillType;
  icon: string;

  // 비용
  mpCost: number;
  staminaCost?: number;   // 피로도 소모 (선택)
  cooldown?: number;      // 쿨다운 턴 수 (선택)

  // 공격 스킬용
  baseDamage?: number;
  element?: MagicElement;
  proficiencyType?: ProficiencyType;
  hitCount?: [number, number];  // [min, max] 다중 타격

  // 버프/디버프 스킬용
  statusEffect?: StatusType;
  statusDuration?: number;
  statusValue?: number;
  statusChance?: number;  // 상태이상 발동 확률 (%)

  // 회복 스킬용
  healAmount?: number;
  healPercent?: number;   // % 기반 회복

  // 타겟팅
  target: SkillTarget;

  // 요구 조건
  requiredLevel?: number;
  requiredProficiency?: {
    type: ProficiencyType;
    level: number;
  };
}

// 스킬 카테고리 (UI 탭용)
export type SkillCategory = "weapon" | "magic" | "support" | "item";

// 스킬 카테고리 정보
export const SKILL_CATEGORIES: Record<
  SkillCategory,
  { nameKo: string; icon: string }
> = {
  weapon: { nameKo: "무기", icon: "⚔️" },
  magic: { nameKo: "마법", icon: "✨" },
  support: { nameKo: "보조", icon: "💊" },
  item: { nameKo: "아이템", icon: "🎒" },
};

// 스킬이 속한 카테고리 판별
export function getSkillCategory(skill: Skill): SkillCategory {
  switch (skill.type) {
    case "physical_attack":
      return "weapon";
    case "magic_attack":
    case "heal":  // 힐은 마법 카테고리
      return "magic";
    case "buff":
    case "debuff":
      return "support";
    default:
      return "support";
  }
}
