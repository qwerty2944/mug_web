"use client";

import { useCallback } from "react";
import { usePvpStore, type DuelAction } from "@/application/stores";
import type { ProficiencyType } from "@/entities/proficiency";
import {
  calculatePvpDamage,
  attemptFlee,
  generateAttackMessage,
} from "../lib/duelHelpers";

interface UseDuelActionOptions {
  userId: string;
  onAction?: (action: DuelAction) => void;
  onVictory?: () => void;
  onDefeat?: () => void;
}

/**
 * 결투 행동 훅
 * - attack: 공격
 * - flee: 도주
 */
export function useDuelAction(options: UseDuelActionOptions) {
  const { userId, onAction, onVictory, onDefeat } = options;
  const {
    activeDuel,
    applyAction,
    switchTurn,
    getMyParticipant,
    getOpponentParticipant,
    isMyTurn,
  } = usePvpStore();

  const attack = useCallback(
    (attackType: ProficiencyType) => {
      if (!activeDuel || activeDuel.result !== "ongoing") {
        console.warn("No active duel");
        return null;
      }

      if (!isMyTurn(userId)) {
        console.warn("Not your turn");
        return null;
      }

      const attacker = getMyParticipant(userId);
      const defender = getOpponentParticipant(userId);

      if (!attacker || !defender) {
        console.warn("Invalid duel state");
        return null;
      }

      // 데미지 계산
      const { damage, isCritical } = calculatePvpDamage({
        attacker,
        defender,
        attackType,
        baseDamage: 10,
      });

      // 메시지 생성
      const message = generateAttackMessage({
        attackerName: attacker.name,
        defenderName: defender.name,
        attackType,
        damage,
        isCritical,
      });

      // 결과 HP
      const targetHpAfter = Math.max(0, defender.currentHp - damage);

      // 액션 생성
      const action: DuelAction = {
        duelId: activeDuel.duelId,
        actorId: userId,
        action: "attack",
        attackType,
        damage,
        isCritical,
        message,
        targetHpAfter,
      };

      // 로컬 상태 업데이트
      applyAction(action);

      // 승패 확인
      if (targetHpAfter <= 0) {
        onVictory?.();
      } else {
        // 턴 교체
        switchTurn();
      }

      // 콜백 호출 (브로드캐스트용)
      onAction?.(action);

      return action;
    },
    [
      userId,
      activeDuel,
      isMyTurn,
      getMyParticipant,
      getOpponentParticipant,
      applyAction,
      switchTurn,
      onAction,
      onVictory,
    ]
  );

  const flee = useCallback(() => {
    if (!activeDuel || activeDuel.result !== "ongoing") {
      console.warn("No active duel");
      return null;
    }

    if (!isMyTurn(userId)) {
      console.warn("Not your turn");
      return null;
    }

    const me = getMyParticipant(userId);
    const opponent = getOpponentParticipant(userId);

    if (!me || !opponent) {
      console.warn("Invalid duel state");
      return null;
    }

    // 도주 시도
    const success = attemptFlee(me.stats.dex, opponent.stats.dex);

    if (success) {
      // 도주 성공 - 패배 처리
      const action: DuelAction = {
        duelId: activeDuel.duelId,
        actorId: userId,
        action: "flee",
        message: `${me.name}이(가) 도주했습니다!`,
        targetHpAfter: opponent.currentHp, // 상대 HP 변화 없음
      };

      applyAction(action);
      onAction?.(action);
      onDefeat?.();

      return action;
    } else {
      // 도주 실패 - 턴 소모
      const action: DuelAction = {
        duelId: activeDuel.duelId,
        actorId: userId,
        action: "flee",
        message: `${me.name}의 도주 실패!`,
        targetHpAfter: opponent.currentHp,
      };

      // 턴만 넘기기 (HP 변화 없음이므로 applyAction 대신 로그만 추가)
      switchTurn();
      onAction?.(action);

      return action;
    }
  }, [
    userId,
    activeDuel,
    isMyTurn,
    getMyParticipant,
    getOpponentParticipant,
    applyAction,
    switchTurn,
    onAction,
    onDefeat,
  ]);

  return {
    attack,
    flee,
    isInDuel: activeDuel !== null && activeDuel.result === "ongoing",
    isMyTurn: isMyTurn(userId),
    activeDuel,
    myParticipant: getMyParticipant(userId),
    opponentParticipant: getOpponentParticipant(userId),
  };
}
