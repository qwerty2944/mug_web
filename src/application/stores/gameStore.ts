import { create } from "zustand";

// ============ 타입 정의 ============

export interface OnlineUser {
  userId: string;
  characterName: string;
}

export interface MapInfo {
  id: string;
  name: string;
  description: string;
}

interface GameState {
  // 상태
  currentMap: MapInfo | null;
  onlineUsers: OnlineUser[];
  isConnected: boolean;
  myCharacterName: string;

  // 액션
  setCurrentMap: (map: MapInfo) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  addOnlineUser: (user: OnlineUser) => void;
  removeOnlineUser: (userId: string) => void;
  setConnected: (connected: boolean) => void;
  setMyCharacterName: (name: string) => void;
  reset: () => void;
}

// ============ 초기 상태 ============

const initialState = {
  currentMap: null,
  onlineUsers: [],
  isConnected: false,
  myCharacterName: "",
};

// ============ 스토어 ============

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setCurrentMap: (map) => set({ currentMap: map }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (user) => {
    const { onlineUsers } = get();
    if (!onlineUsers.find((u) => u.userId === user.userId)) {
      set({ onlineUsers: [...onlineUsers, user] });
    }
  },

  removeOnlineUser: (userId) => {
    const { onlineUsers } = get();
    set({ onlineUsers: onlineUsers.filter((u) => u.userId !== userId) });
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setMyCharacterName: (name) => set({ myCharacterName: name }),

  reset: () => set(initialState),
}));
