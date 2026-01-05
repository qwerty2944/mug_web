"use client";

import { useCallback, useMemo } from "react";
import { usePvpStore, type DuelRequest } from "@/application/stores";

interface UseRespondDuelOptions {
  userId: string;
  onAccept?: (request: DuelRequest) => void;
  onDecline?: (request: DuelRequest) => void;
}

/**
 * 결투 응답 훅
 * - acceptDuel: 결투 수락
 * - declineDuel: 결투 거절
 */
export function useRespondDuel(options: UseRespondDuelOptions) {
  const { userId, onAccept, onDecline } = options;
  const { pendingRequests, removePendingRequest, activeDuel } = usePvpStore();

  // 나에게 온 요청만 필터링
  const myPendingRequests = useMemo(() => {
    return pendingRequests.filter((r) => r.targetId === userId);
  }, [pendingRequests, userId]);

  // 가장 오래된 요청 (먼저 온 것 우선)
  const oldestRequest = useMemo(() => {
    if (myPendingRequests.length === 0) return null;
    return myPendingRequests.reduce((oldest, current) =>
      current.requestedAt < oldest.requestedAt ? current : oldest
    );
  }, [myPendingRequests]);

  const acceptDuel = useCallback(
    (challengerId: string) => {
      const request = pendingRequests.find((r) => r.challengerId === challengerId);
      if (!request) {
        console.warn("Duel request not found");
        return false;
      }

      // 이미 결투 중이면 무시
      if (activeDuel) {
        console.warn("Already in a duel");
        removePendingRequest(challengerId);
        return false;
      }

      // 만료된 요청이면 거절 처리
      if (request.expiresAt < Date.now()) {
        console.warn("Duel request expired");
        removePendingRequest(challengerId);
        return false;
      }

      onAccept?.(request);
      return true;
    },
    [pendingRequests, activeDuel, removePendingRequest, onAccept]
  );

  const declineDuel = useCallback(
    (challengerId: string) => {
      const request = pendingRequests.find((r) => r.challengerId === challengerId);

      removePendingRequest(challengerId);

      if (request) {
        onDecline?.(request);
      }

      return true;
    },
    [pendingRequests, removePendingRequest, onDecline]
  );

  const declineAll = useCallback(() => {
    myPendingRequests.forEach((request) => {
      removePendingRequest(request.challengerId);
      onDecline?.(request);
    });
  }, [myPendingRequests, removePendingRequest, onDecline]);

  return {
    acceptDuel,
    declineDuel,
    declineAll,
    pendingRequests: myPendingRequests,
    oldestRequest,
    hasPendingRequests: myPendingRequests.length > 0,
    pendingCount: myPendingRequests.length,
    isInDuel: activeDuel !== null,
  };
}
