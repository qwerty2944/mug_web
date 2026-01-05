// Actions
export { useRequestDuel } from "./request-duel";
export { useRespondDuel } from "./respond-duel";
export { useDuelAction } from "./duel-action";

// Helpers
export {
  determineFirstTurn,
  calculatePvpPhysicalDefense,
  calculatePvpMagicDefense,
  calculatePvpDamage,
  calculateMaxHp,
  calculateFleeChance,
  attemptFlee,
  generateDuelId,
  generateAttackMessage,
} from "./lib/duelHelpers";

// Types (re-export from stores)
export type {
  DuelRequest,
  DuelParticipant,
  DuelLogEntry,
  DuelAction,
  DuelResult,
  DuelEndResult,
  DuelState,
} from "@/application/stores";
