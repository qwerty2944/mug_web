"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBattleStore } from "@/application/stores";
import { rollDrops, calculateExpBonus } from "@/entities/monster";
import { useGainProficiency } from "@/features/proficiency";
import { profileKeys } from "@/entities/user";
import type { ProficiencyType } from "@/entities/proficiency";

interface BattleRewards {
  exp: number;
  gold: number;
  drops: { itemId: string; quantity: number }[];
  proficiencyGain?: {
    type: ProficiencyType;
    amount: number;
  };
}

interface UseEndBattleOptions {
  userId: string | undefined;
  playerLevel?: number;
  onVictory?: (rewards: BattleRewards) => void;
  onDefeat?: () => void;
  onFled?: () => void;
}

/**
 * 전투 종료 훅
 */
export function useEndBattle(options: UseEndBattleOptions) {
  const { userId, playerLevel = 1, onVictory, onDefeat, onFled } = options;
  const { battle, resetBattle } = useBattleStore();
  const queryClient = useQueryClient();
  const gainProficiency = useGainProficiency(userId);

  // 보상 지급 처리
  const processRewards = useCallback((): BattleRewards | null => {
    if (!battle.monster || battle.result !== "victory") return null;

    // 경험치 계산 (레벨 차이 보너스)
    const exp = calculateExpBonus(battle.monster, playerLevel);

    // 골드
    const gold = battle.monster.rewards.gold;

    // 드롭 아이템 롤
    const drops = rollDrops(battle.monster.drops);

    // 숙련도 증가 (사용한 무기/마법)
    let proficiencyGain: BattleRewards["proficiencyGain"] = undefined;
    if (battle.usedWeaponType) {
      proficiencyGain = {
        type: battle.usedWeaponType as ProficiencyType,
        amount: 1,
      };
    }

    return { exp, gold, drops, proficiencyGain };
  }, [battle, playerLevel]);

  // 승리 처리
  const handleVictory = useCallback(async () => {
    const rewards = processRewards();
    if (!rewards) return;

    // 숙련도 증가
    if (rewards.proficiencyGain && userId) {
      try {
        await gainProficiency.mutateAsync({
          type: rewards.proficiencyGain.type,
          amount: rewards.proficiencyGain.amount,
        });
      } catch (error) {
        console.error("Failed to increase proficiency:", error);
      }
    }

    // TODO: 경험치, 골드, 아이템 지급 (profile 업데이트)
    // await updateProfile({ exp: profile.exp + rewards.exp, gold: profile.gold + rewards.gold });

    // 캐시 무효화
    if (userId) {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    }

    onVictory?.(rewards);
    resetBattle();
  }, [processRewards, userId, gainProficiency, queryClient, onVictory, resetBattle]);

  // 패배 처리
  const handleDefeat = useCallback(() => {
    // TODO: 패널티 처리 (골드 손실 등)
    onDefeat?.();
    resetBattle();
  }, [onDefeat, resetBattle]);

  // 도주 처리
  const handleFled = useCallback(() => {
    onFled?.();
    resetBattle();
  }, [onFled, resetBattle]);

  // 전투 결과에 따른 종료 처리
  const endBattle = useCallback(() => {
    switch (battle.result) {
      case "victory":
        handleVictory();
        break;
      case "defeat":
        handleDefeat();
        break;
      case "fled":
        handleFled();
        break;
      default:
        // ongoing - do nothing
        break;
    }
  }, [battle.result, handleVictory, handleDefeat, handleFled]);

  return {
    endBattle,
    processRewards,
    battleResult: battle.result,
    isVictory: battle.result === "victory",
    isDefeat: battle.result === "defeat",
    isFled: battle.result === "fled",
    isBattleEnded: battle.result !== "ongoing",
  };
}
