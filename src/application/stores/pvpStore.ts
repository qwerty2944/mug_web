import { create } from "zustand";
import type { CharacterStats } from "@/entities/character";
import type { Proficiencies, ProficiencyType } from "@/entities/proficiency";

// ============ 타입 정의 ============

// 결투 신청
export interface DuelRequest {
  challengerId: string;
  challengerName: string;
  targetId: string;
  targetName: string;
  mapId: string;
  requestedAt: number;
  expiresAt: number; // requestedAt + 30000
}

// 결투 참가자
export interface DuelParticipant {
  id: string;
  name: string;
  stats: CharacterStats;
  currentHp: number;
  maxHp: number;
  proficiencies: Proficiencies;
}

// 전투 로그
export interface DuelLogEntry {
  turn: number;
  actorId: string;
  actorName: string;
  action: "attack" | "skill" | "flee" | "start" | "end";
  attackType?: ProficiencyType;
  damage?: number;
  isCritical?: boolean;
  message: string;
  timestamp: number;
}

// 결투 행동
export interface DuelAction {
  duelId: string;
  actorId: string;
  action: "attack" | "skill" | "flee";
  attackType?: ProficiencyType;
  damage?: number;
  isCritical?: boolean;
  message: string;
  targetHpAfter: number;
}

// 결투 결과
export type DuelResult = "ongoing" | "player1_win" | "player2_win" | "draw";

export interface DuelEndResult {
  duelId: string;
  winnerId: string | null;
  loserId: string | null;
  reason: "knockout" | "flee" | "disconnect";
}

// 결투 상태
export interface DuelState {
  duelId: string;
  player1: DuelParticipant;
  player2: DuelParticipant;
  currentTurnId: string;
  turn: number;
  battleLog: DuelLogEntry[];
  result: DuelResult;
  startedAt: number;
}

// ============ 초기 상태 ============

interface PvpStoreState {
  // State
  pendingRequests: DuelRequest[]; // 받은 도전 신청
  sentRequest: DuelRequest | null; // 보낸 도전 신청
  activeDuel: DuelState | null; // 진행 중인 결투
}

const initialState: PvpStoreState = {
  pendingRequests: [],
  sentRequest: null,
  activeDuel: null,
};

// ============ 스토어 ============

interface PvpStore extends PvpStoreState {
  // Actions - 도전 신청
  setSentRequest: (request: DuelRequest | null) => void;
  addPendingRequest: (request: DuelRequest) => void;
  removePendingRequest: (challengerId: string) => void;
  clearExpiredRequests: () => void;

  // Actions - 결투 진행
  startDuel: (duelState: DuelState) => void;
  applyAction: (action: DuelAction) => void;
  switchTurn: () => void;
  endDuel: (result: DuelEndResult) => void;
  resetDuel: () => void;

  // Actions - 전체 리셋
  resetAll: () => void;

  // Getters
  isInDuel: () => boolean;
  isMyTurn: (myId: string) => boolean;
  getMyParticipant: (myId: string) => DuelParticipant | null;
  getOpponentParticipant: (myId: string) => DuelParticipant | null;
  getMyHpPercent: (myId: string) => number;
  getOpponentHpPercent: (myId: string) => number;
}

export const usePvpStore = create<PvpStore>((set, get) => ({
  ...initialState,

  // ============ 도전 신청 관련 ============

  setSentRequest: (request) => set({ sentRequest: request }),

  addPendingRequest: (request) => {
    const { pendingRequests } = get();
    // 중복 체크
    if (pendingRequests.find((r) => r.challengerId === request.challengerId)) {
      return;
    }
    set({ pendingRequests: [...pendingRequests, request] });
  },

  removePendingRequest: (challengerId) => {
    const { pendingRequests } = get();
    set({
      pendingRequests: pendingRequests.filter((r) => r.challengerId !== challengerId),
    });
  },

  clearExpiredRequests: () => {
    const { pendingRequests } = get();
    const now = Date.now();
    set({
      pendingRequests: pendingRequests.filter((r) => r.expiresAt > now),
    });
  },

  // ============ 결투 진행 관련 ============

  startDuel: (duelState) => {
    set({
      activeDuel: duelState,
      sentRequest: null,
      pendingRequests: [],
    });
  },

  applyAction: (action) => {
    const { activeDuel } = get();
    if (!activeDuel || activeDuel.result !== "ongoing") return;

    const isPlayer1Action = action.actorId === activeDuel.player1.id;
    const targetPlayer = isPlayer1Action ? "player2" : "player1";

    // 로그 추가
    const newLog: DuelLogEntry = {
      turn: activeDuel.turn,
      actorId: action.actorId,
      actorName: isPlayer1Action ? activeDuel.player1.name : activeDuel.player2.name,
      action: action.action,
      attackType: action.attackType,
      damage: action.damage,
      isCritical: action.isCritical,
      message: action.message,
      timestamp: Date.now(),
    };

    // HP 업데이트
    const updatedDuel = {
      ...activeDuel,
      [targetPlayer]: {
        ...activeDuel[targetPlayer],
        currentHp: action.targetHpAfter,
      },
      battleLog: [...activeDuel.battleLog, newLog],
    };

    // 승패 확인
    if (action.targetHpAfter <= 0) {
      const winnerId = action.actorId;
      const result: DuelResult = isPlayer1Action ? "player1_win" : "player2_win";

      set({
        activeDuel: {
          ...updatedDuel,
          result,
          battleLog: [
            ...updatedDuel.battleLog,
            {
              turn: activeDuel.turn,
              actorId: "system",
              actorName: "시스템",
              action: "end",
              message: `${isPlayer1Action ? activeDuel.player1.name : activeDuel.player2.name}의 승리!`,
              timestamp: Date.now(),
            },
          ],
        },
      });
    } else if (action.action === "flee") {
      // 도주 시 상대방 승리
      const result: DuelResult = isPlayer1Action ? "player2_win" : "player1_win";

      set({
        activeDuel: {
          ...updatedDuel,
          result,
          battleLog: [
            ...updatedDuel.battleLog,
            {
              turn: activeDuel.turn,
              actorId: "system",
              actorName: "시스템",
              action: "end",
              message: `${isPlayer1Action ? activeDuel.player1.name : activeDuel.player2.name}이(가) 도주했습니다.`,
              timestamp: Date.now(),
            },
          ],
        },
      });
    } else {
      set({ activeDuel: updatedDuel });
    }
  },

  switchTurn: () => {
    const { activeDuel } = get();
    if (!activeDuel || activeDuel.result !== "ongoing") return;

    const nextTurnId =
      activeDuel.currentTurnId === activeDuel.player1.id
        ? activeDuel.player2.id
        : activeDuel.player1.id;

    set({
      activeDuel: {
        ...activeDuel,
        currentTurnId: nextTurnId,
        turn: activeDuel.turn + 1,
      },
    });
  },

  endDuel: (result) => {
    const { activeDuel } = get();
    if (!activeDuel) return;

    let duelResult: DuelResult = "draw";
    if (result.winnerId === activeDuel.player1.id) {
      duelResult = "player1_win";
    } else if (result.winnerId === activeDuel.player2.id) {
      duelResult = "player2_win";
    }

    set({
      activeDuel: {
        ...activeDuel,
        result: duelResult,
      },
    });
  },

  resetDuel: () => {
    set({ activeDuel: null });
  },

  // ============ 전체 리셋 ============

  resetAll: () => set(initialState),

  // ============ Getters ============

  isInDuel: () => {
    const { activeDuel } = get();
    return activeDuel !== null && activeDuel.result === "ongoing";
  },

  isMyTurn: (myId) => {
    const { activeDuel } = get();
    if (!activeDuel || activeDuel.result !== "ongoing") return false;
    return activeDuel.currentTurnId === myId;
  },

  getMyParticipant: (myId) => {
    const { activeDuel } = get();
    if (!activeDuel) return null;
    if (activeDuel.player1.id === myId) return activeDuel.player1;
    if (activeDuel.player2.id === myId) return activeDuel.player2;
    return null;
  },

  getOpponentParticipant: (myId) => {
    const { activeDuel } = get();
    if (!activeDuel) return null;
    if (activeDuel.player1.id === myId) return activeDuel.player2;
    if (activeDuel.player2.id === myId) return activeDuel.player1;
    return null;
  },

  getMyHpPercent: (myId) => {
    const participant = get().getMyParticipant(myId);
    if (!participant || participant.maxHp === 0) return 0;
    return (participant.currentHp / participant.maxHp) * 100;
  },

  getOpponentHpPercent: (myId) => {
    const participant = get().getOpponentParticipant(myId);
    if (!participant || participant.maxHp === 0) return 0;
    return (participant.currentHp / participant.maxHp) * 100;
  },
}));
