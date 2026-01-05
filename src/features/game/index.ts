// Stores (re-export from application stores) - 클라이언트 상태만
export {
  useGameStore,
  useChatStore,
  parseChatCommand,
  type OnlineUser,
  type MapInfo,
  type ChatMessage,
  type MessageType,
} from "@/application/stores";

// 서버 상태는 entities에서 직접 import
// import { useProfile, getMainCharacter } from "@/entities/user";
// import { useInventory } from "@/entities/inventory";
// import { useMaps, getMapById, getMapDisplayName } from "@/entities/map";

// UI
export {
  ChatBox,
  ChatInput,
  ChatMessage as ChatMessageComponent,
  PlayerList,
  MapSelector,
  AVAILABLE_MAPS,
  PlayerContextMenu,
  DuelRequestModal,
  DuelBattlePanel,
  BattlePanel,
  MonsterList,
  WorldMap,
  WorldMapModal,
} from "./ui";

// Hooks
export { useRealtimeChat } from "./lib/useRealtimeChat";
export { useRealtimeDuel } from "./lib/useRealtimeDuel";

// Actions
export { updateLocation } from "./update-location";

// Queries (React Query Mutations)
export { useUpdateLocation } from "./update-location";
