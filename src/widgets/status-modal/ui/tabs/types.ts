import type { Theme } from "@/shared/config";
import type { Profile } from "@/entities/user";
import type { DerivedCombatStats, Character } from "@/entities/character";
import type { ElementBonusData } from "../ElementBonusItem";
import type { Trait } from "@/entities/trait";

export interface CombatStats {
  dodgeChance: number;
  blockChance: number;
  physicalCritChance: number;
  magicalCritChance: number;
  critMultiplier: number;
  physicalAttack: number;
  physicalDefense: number;
  magicAttack: number;
  magicDefense: number;
}

export interface StatusTabProps {
  theme: Theme;
  profile: Profile | null | undefined;
  mainCharacter: Character | null | undefined;
  derivedStats: DerivedCombatStats | null;
  combatStats: CombatStats | null;
  elementBonuses: ElementBonusData[];
}

export interface TraitsTabProps {
  theme: Theme;
  characterTraits: Trait[];
  traitEffects: ReturnType<typeof import("@/entities/trait").calculateAggregatedEffects> | null;
}

export interface AbilitiesTabProps {
  theme: Theme;
  learnedSkills: string[];
  abilities: import("@/entities/ability").Ability[];
}

export interface EquipmentTabProps {
  theme: Theme;
}

export interface InventoryTabProps {
  theme: Theme;
  inventoryItems: (import("@/entities/inventory").InventorySlotItem | null)[];
  allItems: import("@/entities/item").Item[];
  inventoryMaxSlots: number;
}
