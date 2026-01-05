export { supabase } from "./supabase";

// 인증 API
export {
  getSession,
  subscribeToAuthChanges,
  isAuthAvailable,
  type AuthSession,
  type AuthSubscription,
} from "./auth";

// 게임 데이터 API
export {
  getEyeMappings,
  getHairMappings,
  getFacehairMappings,
  getBodyMappings,
  getAllMappings,
  clearMappingCache,
} from "./gameData";

// 타입은 shared/types에서 re-export
export type {
  EyeMapping,
  HairMapping,
  FacehairMapping,
  BodyMapping,
  AllMappings,
} from "../types/game-data";
