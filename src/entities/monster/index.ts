// Types
export type {
  Monster,
  MonsterStats,
  MonsterDrop,
  MonsterRewards,
  MonsterBehavior,
  MonsterDescription,
  MonstersData,
  MonsterType,
  MonsterTypeInfo,
  PhysicalResistance,
} from "./types";

// Constants
export { MONSTER_TYPE_INFO, DEFAULT_PHYSICAL_RESISTANCE } from "./types";

// API
export {
  fetchMonsters,
  fetchMonstersByMap,
  fetchMonsterById,
  clearMonstersCache,
} from "./api";

// Queries
export {
  useMonsters,
  useMonstersByMap,
  useMonster,
  monsterKeys,
  getMonsterDisplayName,
  getMonsterDescription,
} from "./queries";

// Lib (Utilities)
export {
  rollDrops,
  getMonsterDifficulty,
  getDifficultyColor,
  canMonsterAttack,
  calculateExpBonus,
  formatMonsterSummary,
} from "./lib";

// Lib (Resistance)
export { getPhysicalResistance, getResistanceText } from "./lib/resistance";
