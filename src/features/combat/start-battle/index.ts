"use client";

import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { Monster } from "@/entities/monster";

interface UseStartBattleOptions {
  onBattleStart?: (monster: Monster) => void;
  staminaCost?: number;
}

/**
 * 전투 시작 훅
 */
export function useStartBattle(options?: UseStartBattleOptions) {
  const { startBattle, battle } = useBattleStore();

  const start = useCallback(
    (monster: Monster, playerHp: number, playerMaxHp: number) => {
      // 이미 전투 중이면 무시
      if (battle.isInBattle) {
        console.warn("Already in battle");
        return false;
      }

      // TODO: 스태미나 확인 및 소모
      // if (staminaCost && playerStamina < staminaCost) {
      //   console.warn("Not enough stamina");
      //   return false;
      // }

      startBattle(monster, playerHp, playerMaxHp);
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
