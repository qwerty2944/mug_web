// Actions
export { useStartBattle } from "./start-battle";
export { useAttack } from "./attack";
export { useEndBattle } from "./end-battle";

// Lib (Damage Calculation)
export {
  calculatePhysicalDamage,
  calculateMagicDamage,
  calculateDamage,
  calculateMonsterDamage,
  getCriticalChance,
  applyCritical,
  CRITICAL_MULTIPLIER,
  type PhysicalAttackParams,
  type MagicAttackParams,
  type AttackParams,
} from "./lib/damage";
