// Actions
export { useStartBattle } from "./start-battle";
export { useAttack } from "./attack";
export { useEndBattle } from "./end-battle";
export { useCastSpell } from "./cast-spell";
export { useSpellCast } from "./spell-cast";

// Lib (Damage Calculation)
export {
  calculatePhysicalDamage,
  calculateMagicDamage,
  calculateDamage,
  calculateMonsterDamage,
  getCriticalChance,
  getCriticalMultiplier,
  applyCritical,
  getAttackTypeFromWeapon,
  // 공격 판정
  determineHitResult,
  getDodgeChance,
  getBlockChance,
  getMissChance,
  // 암습 시스템
  calculateAmbushDamage,
  getAmbushChance,
  getDaggerAmbushBonus,
  // 패리 시스템
  canParry,
  getParryChance,
  attemptParry,
  PARRY_WEAPONS,
  // Types
  type PhysicalAttackParams,
  type MagicAttackParams,
  type AttackParams,
  type HitResult,
  type AmbushResult,
  type ParryResult,
} from "./lib/damage";
