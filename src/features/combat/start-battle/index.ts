"use client";

import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { Monster } from "@/entities/monster";
import { consumeFatigue, FATIGUE_COST } from "@/entities/user";
import toast from "react-hot-toast";

interface UseStartBattleOptions {
  userId?: string;
  onBattleStart?: (monster: Monster) => void;
  onInsufficientFatigue?: () => void;
}

/**
 * 전투 시작 훅
 * - 피로도 소모 후 전투 시작
 */
export function useStartBattle(options?: UseStartBattleOptions) {
  const { startBattle, battle } = useBattleStore();

  const start = useCallback(
    async (
      monster: Monster,
      playerHp: number,
      playerMaxHp: number,
      playerMp: number,
      playerMaxMp: number
    ): Promise<boolean> => {
      // 이미 전투 중이면 무시
      if (battle.isInBattle) {
        console.warn("Already in battle");
        return false;
      }

      // 피로도 소모
      if (options?.userId) {
        try {
          const result = await consumeFatigue(options.userId, FATIGUE_COST.BATTLE_START);
          if (!result.success) {
            toast.error(result.message || "피로도가 부족합니다");
            options?.onInsufficientFatigue?.();
            return false;
          }
        } catch (error) {
          console.error("Failed to consume fatigue:", error);
          toast.error("피로도 처리 중 오류가 발생했습니다");
          return false;
        }
      }

      startBattle(monster, playerHp, playerMaxHp, playerMp, playerMaxMp);
      options?.onBattleStart?.(monster);

      return true;
    },
    [battle.isInBattle, startBattle, options]
  );

  return {
    start,
    isInBattle: battle.isInBattle,
  };
}
