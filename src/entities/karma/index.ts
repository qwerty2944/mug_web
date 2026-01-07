// ============ Public API ============

// Types
export type {
  KarmaRank,
  KarmaRankInfo,
  MonsterAlignment,
  AlignmentInfo,
} from "./types";

export {
  KARMA_RANKS,
  ALIGNMENT_INFO,
  DEFAULT_ALIGNMENT_BY_TYPE,
} from "./types";

// API
export { fetchKarma, updateKarma } from "./api";
export type { KarmaData, UpdateKarmaResult } from "./api";

// Queries
export {
  karmaKeys,
  useKarma,
  useUpdateKarma,
} from "./queries";
export type { UseUpdateKarmaOptions } from "./queries";

// Lib
export {
  getKarmaRankInfo,
  getKarmaRank,
  formatKarma,
  getKarmaColor,
  calculateKarmaChange,
  getDefaultAlignment,
  getHolyMultiplier,
  getDarkMultiplier,
  getKarmaElementMultiplier,
  formatAlignment,
} from "./lib";
