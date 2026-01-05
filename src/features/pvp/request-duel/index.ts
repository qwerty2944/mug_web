"use client";

import { useCallback } from "react";
import { usePvpStore, type OnlineUser } from "@/application/stores";

interface UseRequestDuelOptions {
  userId: string;
  characterName: string;
  mapId: string;
  onRequest?: (target: OnlineUser) => void;
}

const DUEL_REQUEST_TIMEOUT = 30000; // 30초

/**
 * 결투 신청 훅
 * - requestDuel: 대상에게 결투 신청
 * - cancelRequest: 보낸 신청 취소
 */
export function useRequestDuel(options: UseRequestDuelOptions) {
  const { userId, characterName, mapId, onRequest } = options;
  const { sentRequest, setSentRequest, activeDuel } = usePvpStore();

  const requestDuel = useCallback(
    (target: OnlineUser) => {
      // 이미 보낸 요청이 있으면 무시
      if (sentRequest) {
        console.warn("Already sent a duel request");
        return false;
      }

      // 자기 자신에게 신청 불가
      if (target.userId === userId) {
        console.warn("Cannot duel yourself");
        return false;
      }

      // 이미 결투 중이면 무시
      if (activeDuel) {
        console.warn("Already in a duel");
        return false;
      }

      const now = Date.now();
      const request = {
        challengerId: userId,
        challengerName: characterName,
        targetId: target.userId,
        targetName: target.characterName,
        mapId,
        requestedAt: now,
        expiresAt: now + DUEL_REQUEST_TIMEOUT,
      };

      setSentRequest(request);
      onRequest?.(target);

      return true;
    },
    [userId, characterName, mapId, sentRequest, activeDuel, setSentRequest, onRequest]
  );

  const cancelRequest = useCallback(() => {
    setSentRequest(null);
  }, [setSentRequest]);

  return {
    requestDuel,
    cancelRequest,
    sentRequest,
    hasPendingRequest: sentRequest !== null,
    isInDuel: activeDuel !== null,
  };
}
