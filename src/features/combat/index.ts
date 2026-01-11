// Actions
export { useStartBattle } from "./start-battle";
export { useEndBattle } from "./end-battle";

// 통합 어빌리티 시스템 (기존 attack, cast-spell, spell-cast 대체)
export { useAbility } from "./use-ability";
export { useExecuteQueue } from "./execute-queue";

// UI Components
export {
  BattlePanel,
  BattleHeader,
  BattleLog,
  StatusEffectDisplay,
  ActionTabs,
  ActionPanel,
  ActionQueue,
  AbilitySelector,
  MagicSubTabs,
  type MagicElement,
} from "./ui";

// Passive Skills
export { usePassiveSkills } from "./lib/usePassiveSkills";

// Monster AI
export {
  getAvailableAbilities,
  selectAbilityByWeight,
  buildMonsterQueue,
  calculateMonsterAbilityDamage,
  checkMonsterStatusEffect,
  getMonsterBuffEffect,
} from "./lib/monsterAi";

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

// Messages
export {
  getAttackMessage,
  getMonsterAttackMessage,
  getBattleStartMessage,
  getVictoryMessage,
  getDefeatMessage,
  getFleeSuccessMessage,
  getFleeFailMessage,
  getDodgeMessage,
  getBlockMessage,
  getMissMessage,
  getPlayerDodgeMessage,
  getPlayerBlockMessage,
  getMonsterMissMessage,
  // 방어 스킬 메시지
  getGuardSuccessMessage,
  getDodgeSkillSuccessMessage,
  getDodgeSkillFailMessage,
  getCounterReadyMessage,
  // 무기막기 메시지
  getWeaponBlockMessage,
  getPlayerWeaponBlockMessage,
  getCounterDamageMessage,
} from "./lib/messages";
