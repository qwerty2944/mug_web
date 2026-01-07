"use client";

import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/shared/api";
import {
  usePvpStore,
  type DuelRequest,
  type DuelAction,
  type DuelState,
  type DuelEndResult,
} from "@/application/stores";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============ Realtime 이벤트 페이로드 타입 ============

interface DuelRequestPayload {
  challengerId: string;
  challengerName: string;
  targetId: string;
  targetName: string;
  mapId: string;
  timestamp: number;
}

interface DuelResponsePayload {
  challengerId: string;
  targetId: string;
  targetName: string;
  accepted: boolean;
}

interface DuelStartPayload {
  duelState: DuelState;
}

interface DuelActionPayload {
  action: DuelAction;
}

interface DuelEndPayload {
  result: DuelEndResult;
}

// ============ 훅 ============

interface UseRealtimeDuelProps {
  mapId: string;
  userId: string;
  characterName: string;
  channel: RealtimeChannel | null;
  onDuelStart?: () => void;
  onDuelEnd?: (result: DuelEndResult) => void;
}

const DUEL_REQUEST_TIMEOUT = 30000; // 30초

export function useRealtimeDuel({
  mapId,
  userId,
  characterName,
  channel,
  onDuelStart,
  onDuelEnd,
}: UseRealtimeDuelProps) {
  const {
    setSentRequest,
    addPendingRequest,
    removePendingRequest,
    clearExpiredRequests,
    setDeclineNotice,
    startDuel,
    applyAction,
    switchTurn,
    endDuel,
    resetDuel,
    activeDuel,
    pendingRequests,
    sentRequest,
    declineNotice,
  } = usePvpStore();

  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 만료 요청 정리 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, [clearExpiredRequests]);

  // ============ 도전 신청 ============

  const requestDuel = useCallback(
    (targetId: string, targetName: string) => {
      if (!channel || !userId || !characterName) return;

      // 이미 보낸 요청이 있으면 무시
      if (sentRequest) {
        console.warn("Already sent a duel request");
        return;
      }

      // 이미 결투 중이면 무시
      if (activeDuel) {
        console.warn("Already in a duel");
        return;
      }

      const now = Date.now();
      const request: DuelRequest = {
        challengerId: userId,
        challengerName: characterName,
        targetId,
        targetName,
        mapId,
        requestedAt: now,
        expiresAt: now + DUEL_REQUEST_TIMEOUT,
      };

      // 로컬 상태 저장
      setSentRequest(request);

      // 브로드캐스트 전송
      channel.send({
        type: "broadcast",
        event: "duel_request",
        payload: {
          challengerId: userId,
          challengerName: characterName,
          targetId,
          targetName,
          mapId,
          timestamp: now,
        } as DuelRequestPayload,
      });

      // 타임아웃 설정
      expiryTimerRef.current = setTimeout(() => {
        setSentRequest(null);
      }, DUEL_REQUEST_TIMEOUT);
    },
    [channel, userId, characterName, mapId, sentRequest, activeDuel, setSentRequest]
  );

  // ============ 도전 취소 ============

  const cancelDuelRequest = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    setSentRequest(null);
  }, [setSentRequest]);

  // ============ 도전 응답 (수락/거절) ============

  const respondToDuel = useCallback(
    (challengerId: string, accepted: boolean) => {
      if (!channel || !userId || !characterName) return;

      // 응답 브로드캐스트
      channel.send({
        type: "broadcast",
        event: "duel_response",
        payload: {
          challengerId,
          targetId: userId,
          targetName: characterName,
          accepted,
        } as DuelResponsePayload,
      });

      // 대기 목록에서 제거
      removePendingRequest(challengerId);
    },
    [channel, userId, characterName, removePendingRequest]
  );

  // ============ 결투 시작 브로드캐스트 ============

  const broadcastDuelStart = useCallback(
    (duelState: DuelState) => {
      if (!channel) return;

      channel.send({
        type: "broadcast",
        event: "duel_start",
        payload: { duelState } as DuelStartPayload,
      });
    },
    [channel]
  );

  // ============ 턴 행동 브로드캐스트 ============

  const broadcastAction = useCallback(
    (action: DuelAction) => {
      if (!channel) return;

      channel.send({
        type: "broadcast",
        event: "duel_action",
        payload: { action } as DuelActionPayload,
      });
    },
    [channel]
  );

  // ============ 결투 종료 브로드캐스트 ============

  const broadcastDuelEnd = useCallback(
    (result: DuelEndResult) => {
      if (!channel) return;

      channel.send({
        type: "broadcast",
        event: "duel_end",
        payload: { result } as DuelEndPayload,
      });
    },
    [channel]
  );

  // ============ Realtime 이벤트 핸들러 등록 ============

  useEffect(() => {
    if (!channel || !userId || !characterName) return;

    // 도전 신청 수신
    const handleDuelRequest = ({ payload }: { payload: DuelRequestPayload }) => {
      // 나에게 온 도전만 처리
      if (payload.targetId !== userId) return;

      // 이미 결투 중이면 무시
      if (activeDuel) return;

      const request: DuelRequest = {
        challengerId: payload.challengerId,
        challengerName: payload.challengerName,
        targetId: payload.targetId,
        targetName: characterName,
        mapId: payload.mapId,
        requestedAt: payload.timestamp,
        expiresAt: payload.timestamp + DUEL_REQUEST_TIMEOUT,
      };

      addPendingRequest(request);
    };

    // 도전 응답 수신
    const handleDuelResponse = ({ payload }: { payload: DuelResponsePayload }) => {
      // 내가 보낸 요청에 대한 응답만 처리
      if (payload.challengerId !== userId) return;

      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }

      if (payload.accepted && sentRequest) {
        // 수락됨 - 결투 시작 준비
        // 도전자가 결투 상태를 생성하고 브로드캐스트
        const duelId = `duel-${userId}-${payload.targetId}-${Date.now()}`;

        // TODO: 실제 스탯과 숙련도 가져오기
        // 지금은 기본값 사용
        const defaultStats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, lck: 10, ambushChance: 0, ambushDamage: 0 };
        const defaultProficiencies = {
          light_sword: 0, medium_sword: 0, great_sword: 0,
          axe: 0, mace: 0, dagger: 0, spear: 0, bow: 0, crossbow: 0, staff: 0, fist: 0,
          fire: 0, ice: 0, lightning: 0, earth: 0, holy: 0, dark: 0,
        };

        const player1 = {
          id: userId,
          name: characterName,
          stats: defaultStats,
          currentHp: 100,
          maxHp: 100,
          proficiencies: defaultProficiencies,
        };

        const player2 = {
          id: payload.targetId,
          name: payload.targetName,
          stats: defaultStats,
          currentHp: 100,
          maxHp: 100,
          proficiencies: defaultProficiencies,
        };

        // DEX 비교로 선공 결정
        const firstTurnId =
          player1.stats.dex > player2.stats.dex
            ? player1.id
            : player2.stats.dex > player1.stats.dex
              ? player2.id
              : Math.random() < 0.5
                ? player1.id
                : player2.id;

        const duelState: DuelState = {
          duelId,
          player1,
          player2,
          currentTurnId: firstTurnId,
          turn: 1,
          battleLog: [
            {
              turn: 0,
              actorId: "system",
              actorName: "시스템",
              action: "start",
              message: `${player1.name} VS ${player2.name} 결투 시작!`,
              timestamp: Date.now(),
            },
          ],
          result: "ongoing",
          startedAt: Date.now(),
        };

        // 로컬 상태 업데이트
        startDuel(duelState);

        // 브로드캐스트
        broadcastDuelStart(duelState);

        onDuelStart?.();
      } else {
        // 거절됨 - 알림 표시
        setDeclineNotice({
          targetName: payload.targetName,
          timestamp: Date.now(),
        });
        setSentRequest(null);
      }
    };

    // 결투 시작 수신
    const handleDuelStart = ({ payload }: { payload: DuelStartPayload }) => {
      const { duelState } = payload;

      // 내가 참가자인 경우에만 처리
      if (duelState.player1.id !== userId && duelState.player2.id !== userId) {
        return;
      }

      // 이미 결투 중이면 무시 (도전자가 이미 설정함)
      if (activeDuel && activeDuel.duelId === duelState.duelId) {
        return;
      }

      startDuel(duelState);
      onDuelStart?.();
    };

    // 턴 행동 수신
    const handleDuelAction = ({ payload }: { payload: DuelActionPayload }) => {
      const { action } = payload;

      // 현재 결투의 액션만 처리
      if (!activeDuel || activeDuel.duelId !== action.duelId) return;

      // 내가 보낸 액션이 아닌 경우에만 적용 (상대방의 액션)
      if (action.actorId !== userId) {
        applyAction(action);
        switchTurn();
      }
    };

    // 결투 종료 수신
    const handleDuelEnd = ({ payload }: { payload: DuelEndPayload }) => {
      const { result } = payload;

      // 현재 결투의 종료만 처리
      if (!activeDuel || activeDuel.duelId !== result.duelId) return;

      endDuel(result);
      onDuelEnd?.(result);
    };

    // 이벤트 리스너 등록
    channel.on("broadcast", { event: "duel_request" }, handleDuelRequest);
    channel.on("broadcast", { event: "duel_response" }, handleDuelResponse);
    channel.on("broadcast", { event: "duel_start" }, handleDuelStart);
    channel.on("broadcast", { event: "duel_action" }, handleDuelAction);
    channel.on("broadcast", { event: "duel_end" }, handleDuelEnd);

    // 클린업
    return () => {
      // Note: Supabase channel doesn't have off() method,
      // but the channel will be removed when component unmounts
    };
  }, [
    channel,
    userId,
    characterName,
    activeDuel,
    sentRequest,
    addPendingRequest,
    removePendingRequest,
    setSentRequest,
    setDeclineNotice,
    startDuel,
    applyAction,
    switchTurn,
    endDuel,
    broadcastDuelStart,
    onDuelStart,
    onDuelEnd,
  ]);

  // 거절 알림 초기화
  const clearDeclineNotice = useCallback(() => {
    setDeclineNotice(null);
  }, [setDeclineNotice]);

  return {
    // 도전 신청
    requestDuel,
    cancelDuelRequest,
    respondToDuel,

    // 턴 행동
    broadcastAction,
    broadcastDuelEnd,

    // 상태
    sentRequest,
    pendingRequests,
    activeDuel,
    isInDuel: activeDuel !== null && activeDuel.result === "ongoing",
    declineNotice,
    clearDeclineNotice,

    // 결투 종료 후 리셋
    resetDuel,
  };
}
