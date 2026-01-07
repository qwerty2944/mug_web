import type { StatusType } from "@/entities/status";

// ============ 스킬 타입 ============

/**
 * 스킬 타입 (v2)
 * - weapon_attack: 무기 공격 (검, 도끼, 창 등)
 * - martial_attack: 무술 공격 (맨손 격투)
 * - physical_attack: 물리 공격 (레거시 호환)
 * - magic_attack: 마법 공격
 * - defensive: 방어 스킬 (막기, 회피, 반격)
 * - buff: 버프 (자신/아군 강화)
 * - debuff: 디버프 (적 약화)
 * - heal: 치유 스킬
 * - life: 생활 스킬 (향후 추가)
 */
export type SkillType =
  | "weapon_attack"
  | "martial_attack"
  | "physical_attack"
  | "magic_attack"
  | "defensive"
  | "buff"
  | "debuff"
  | "heal"
  | "life";

/**
 * 스킬 카테고리 (무기/무술별 분류)
 */
export type SkillCategory =
  // 무기
  | "sword"     // 검술
  | "axe"       // 도끼술
  | "mace"      // 둔기술
  | "dagger"    // 단검술
  | "spear"     // 창술
  | "bow"       // 궁술
  | "crossbow"  // 석궁술
  | "staff"     // 장봉술
  // 무술 (손/발 분리)
  | "fist"      // 주먹/손 기술
  | "kick"      // 발차기 기술
  | "martial"   // 무술 자세/내공 (공통)
  // 기타
  | "defense"   // 범용 방어
  | "utility"   // 보조
  | "life";     // 생활 (placeholder)

/**
 * 스킬 대상
 */
export type SkillTarget =
  | "self"        // 자신
  | "enemy"       // 적 1명
  | "ally"        // 아군 1명 (파티 시스템)
  | "all_enemies" // 모든 적
  | "all_allies"; // 모든 아군

// ============ 스킬 요구 조건 ============

/**
 * 캐릭터 스탯 요구 조건
 */
export interface SkillStatRequirements {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  lck?: number;
}

/**
 * 스킬 요구 조건
 */
export interface SkillRequirements {
  /** 무기/무술 숙련도 요구치 (0-100) */
  proficiency?: number;
  /** 최소 스탯 요구치 */
  stats?: SkillStatRequirements;
  /** 필요 장비 (예: "shield") */
  equipment?: string;
}

// ============ 스킬 특수 효과 ============

/**
 * 보너스 대상 타입 (몬스터 종류)
 */
export interface BonusVsType {
  type: string;      // "undead", "demon", "large" 등
  multiplier: number; // 배율 (예: 1.5 = 50% 추가 피해)
}

// ============ 스킬 정의 ============

/**
 * 전투 스킬 인터페이스 (v2)
 */
export interface Skill {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;

  // 분류
  type: SkillType;
  category: SkillCategory;
  icon: string;

  // 비용
  /** 스태미나 포인트 비용 (물리 스킬용) */
  spCost: number;
  /** 마나 포인트 비용 (마법/힐 스킬용) */
  mpCost?: number;
  /** 쿨다운 턴 수 */
  cooldown?: number;
  /** 캐스팅 시간 (턴) */
  castTime?: number;

  // 공격 스킬용
  baseDamage?: number;
  /** 다중 타격 [최소, 최대] */
  hitCount?: [number, number];
  /** 방어력 관통률 (0-1, 0.5 = 50% 무시) */
  armorPenetration?: number;
  /** 피해 배율 (snipe 등) */
  damageMultiplier?: number;
  /** 치명타 추가 확률 (%) */
  critBonus?: number;

  // 처형 스킬용
  /** HP 임계값 (0.3 = 30% 이하) */
  executeThreshold?: number;
  /** 처형 배율 */
  executeMultiplier?: number;

  // 첫 타격 스킬용
  /** 첫 공격 배율 (backstab) */
  firstStrikeMultiplier?: number;

  // 즉사 스킬용
  /** 즉사 확률 (0-1) */
  instantKillChance?: number;

  // 대상 보너스
  /** 특정 몬스터 타입에 보너스 */
  bonusVsType?: BonusVsType;

  // 버프/디버프 스킬용
  statusEffect?: StatusType;
  statusDuration?: number;
  statusValue?: number;
  /** 상태이상 발동 확률 (%) */
  statusChance?: number;

  // 방어 스킬용
  /** 막기 확률 보너스 (%) */
  blockBonus?: number;
  /** 회피 확률 보너스 (%) */
  dodgeBonus?: number;
  /** 피해 감소율 (%) */
  damageReduction?: number;

  // 회복 스킬용
  /** HP 퍼센트 회복 */
  healPercent?: number;
  /** HP 고정 회복량 */
  healAmount?: number;

  // 숙련도 및 속성 (마법/무기)
  /** 관련 숙련도 타입 (weapon type 또는 magic element) */
  proficiencyType?: string;
  /** 마법 속성 (fire, ice, lightning 등) */
  element?: string;

  // 타겟팅
  target: SkillTarget;

  // 요구 조건
  requirements: SkillRequirements;
}

// ============ 생활 스킬 (Placeholder) ============

/**
 * 생활 스킬 타입 (향후 구현)
 */
export type LifeSkillType =
  | "gathering"  // 채집
  | "crafting"   // 제작
  | "social";    // 교류

/**
 * 생활 스킬 인터페이스 (Placeholder)
 */
export interface LifeSkill {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  type: LifeSkillType;
  icon: string;
  // 향후 확장
}

// ============ UI 탭 ============

/**
 * UI 탭 카테고리
 */
export type SkillUITab = "weapon" | "martial" | "defense" | "utility" | "life";

/**
 * UI 탭 정보
 */
export interface SkillUITabInfo {
  id: SkillUITab;
  nameKo: string;
  icon: string;
  disabled?: boolean;
}

/**
 * UI 탭 정의
 */
export const SKILL_UI_TABS: SkillUITabInfo[] = [
  { id: "weapon", nameKo: "무기", icon: "⚔️" },
  { id: "martial", nameKo: "무술", icon: "👊" },
  { id: "defense", nameKo: "방어", icon: "🛡️" },
  { id: "utility", nameKo: "보조", icon: "💊" },
  { id: "life", nameKo: "생활", icon: "🌿", disabled: true },
];

/**
 * 카테고리별 무기 정보
 */
export const WEAPON_CATEGORIES: Record<
  string,
  { nameKo: string; icon: string }
> = {
  sword: { nameKo: "검술", icon: "⚔️" },
  axe: { nameKo: "도끼술", icon: "🪓" },
  mace: { nameKo: "둔기술", icon: "🔨" },
  dagger: { nameKo: "단검술", icon: "🔪" },
  spear: { nameKo: "창술", icon: "🔱" },
  bow: { nameKo: "궁술", icon: "🏹" },
  crossbow: { nameKo: "석궁술", icon: "🎯" },
  staff: { nameKo: "장봉술", icon: "🏑" },
};

/**
 * 무술 카테고리 정보 (손/발 분리)
 */
export const MARTIAL_CATEGORIES: Record<
  string,
  { nameKo: string; icon: string }
> = {
  fist: { nameKo: "주먹", icon: "👊" },
  kick: { nameKo: "발차기", icon: "🦶" },
  martial: { nameKo: "자세/내공", icon: "🥋" },
};

// ============ 유틸리티 함수 ============

/**
 * 스킬이 속한 UI 탭 판별
 */
export function getSkillUITab(skill: Skill): SkillUITab {
  switch (skill.category) {
    // 무기 스킬
    case "sword":
    case "axe":
    case "mace":
    case "dagger":
    case "spear":
    case "bow":
    case "crossbow":
    case "staff":
      return "weapon";
    // 무술 스킬 (손/발 분리)
    case "fist":
    case "kick":
    case "martial":
      return "martial";
    // 방어 스킬
    case "defense":
      return "defense";
    // 보조 스킬
    case "utility":
      return "utility";
    // 생활 스킬
    case "life":
      return "life";
    default:
      return "utility";
  }
}

/**
 * 스킬이 공격 스킬인지 확인
 */
export function isAttackSkill(skill: Skill): boolean {
  return skill.type === "weapon_attack" || skill.type === "martial_attack";
}

/**
 * 스킬이 방어 스킬인지 확인
 */
export function isDefensiveSkill(skill: Skill): boolean {
  return skill.type === "defensive";
}

/**
 * 스킬 요구 조건 충족 확인
 */
export function checkSkillRequirements(
  skill: Skill,
  options: {
    proficiency?: number;
    stats?: SkillStatRequirements;
    equipment?: string[];
  }
): { canUse: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const req = skill.requirements;

  // 숙련도 체크
  if (req.proficiency !== undefined && req.proficiency > 0) {
    const currentProf = options.proficiency ?? 0;
    if (currentProf < req.proficiency) {
      reasons.push(`숙련도 ${req.proficiency} 필요 (현재: ${currentProf})`);
    }
  }

  // 스탯 체크
  if (req.stats) {
    const stats = options.stats ?? {};
    for (const [stat, required] of Object.entries(req.stats)) {
      const current = (stats as Record<string, number>)[stat] ?? 0;
      if (current < required) {
        const statNames: Record<string, string> = {
          str: "힘",
          dex: "민첩",
          con: "체력",
          int: "지능",
          wis: "지혜",
          cha: "매력",
          lck: "행운",
        };
        reasons.push(
          `${statNames[stat] || stat} ${required} 필요 (현재: ${current})`
        );
      }
    }
  }

  // 장비 체크
  if (req.equipment) {
    const equipped = options.equipment ?? [];
    if (!equipped.includes(req.equipment)) {
      const equipNames: Record<string, string> = {
        shield: "방패",
      };
      reasons.push(`${equipNames[req.equipment] || req.equipment} 장착 필요`);
    }
  }

  return {
    canUse: reasons.length === 0,
    reasons,
  };
}

// ============ 데이터 구조 ============

/**
 * skills.json 전체 구조
 */
export interface SkillsData {
  version: string;
  generatedAt: string;
  combatSkills: Skill[];
  lifeSkills: LifeSkill[];
  summary: {
    totalCombat: number;
    totalLife: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
  };
}
