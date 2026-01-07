"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBattleStore } from "@/application/stores";
import { rollDrops, calculateExpBonus } from "@/entities/monster";
import { useGainProficiency } from "@/features/proficiency";
import { profileKeys, updateProfile, checkLevelUp, useProfile } from "@/entities/user";
import { inventoryKeys } from "@/entities/inventory";
import { fetchItemById } from "@/entities/item";
import { addItem } from "@/features/inventory";
import {
  calculateKarmaChange,
  updateKarma,
  karmaKeys,
  formatKarma,
  getKarmaRank,
} from "@/entities/karma";
import type { ProficiencyType } from "@/entities/proficiency";
import toast from "react-hot-toast";

interface BattleRewards {
  exp: number;
  gold: number;
  drops: { itemId: string; quantity: number }[];
  proficiencyGain?: {
    type: ProficiencyType;
    amount: number;
  };
  levelUp?: {
    newLevel: number;
    levelsGained: number;
  };
  karmaChange?: number;
}

interface UseEndBattleOptions {
  userId: string | undefined;
  onVictory?: (rewards: BattleRewards) => void;
  onDefeat?: () => void;
  onFled?: () => void;
}

/**
 * 전투 종료 훅
 */
export function useEndBattle(options: UseEndBattleOptions) {
  const { userId, onVictory, onDefeat, onFled } = options;
  const { battle, resetBattle } = useBattleStore();
  const queryClient = useQueryClient();
  const gainProficiency = useGainProficiency(userId);
  const { data: profile } = useProfile(userId);

  const playerLevel = profile?.level ?? 1;

  // 보상 지급 처리
  // 주의: useBattleStore.getState()로 직접 읽어서 stale 클로저 문제 방지
  const processRewards = useCallback((): BattleRewards | null => {
    const currentBattle = useBattleStore.getState().battle;
    if (!currentBattle.monster || currentBattle.result !== "victory") return null;

    // 경험치 계산 (레벨 차이 보너스)
    const exp = calculateExpBonus(currentBattle.monster, playerLevel);

    // 골드
    const gold = currentBattle.monster.rewards.gold;

    // 드롭 아이템 롤
    const drops = rollDrops(currentBattle.monster.drops);

    // 숙련도 증가 (사용한 무기/마법)
    let proficiencyGain: BattleRewards["proficiencyGain"] = undefined;
    if (currentBattle.usedWeaponType) {
      proficiencyGain = {
        type: currentBattle.usedWeaponType as ProficiencyType,
        amount: 1,
      };
    }

    // 카르마 변화 계산
    const karmaChange = calculateKarmaChange(
      currentBattle.monster.alignment,
      currentBattle.monster.level
    );

    return { exp, gold, drops, proficiencyGain, karmaChange };
  }, [playerLevel]);

  // 승리 처리
  const handleVictory = useCallback(async () => {
    const rewards = processRewards();
    if (!rewards || !profile) return;

    // 1. 경험치/골드 지급 + 레벨업 체크
    if (userId) {
      try {
        const totalExp = profile.experience + rewards.exp;
        const levelUpResult = checkLevelUp(profile.level, totalExp);

        await updateProfile({
          userId,
          level: levelUpResult.newLevel,
          experience: levelUpResult.newExp,
          gold: profile.gold + rewards.gold,
        });

        // 레벨업 알림
        if (levelUpResult.leveledUp) {
          rewards.levelUp = {
            newLevel: levelUpResult.newLevel,
            levelsGained: levelUpResult.levelsGained,
          };

          if (levelUpResult.levelsGained === 1) {
            toast.success(`레벨 업! Lv.${levelUpResult.newLevel}`);
          } else {
            toast.success(`${levelUpResult.levelsGained} 레벨 상승! Lv.${levelUpResult.newLevel}`);
          }
        }
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    }

    // 2. 숙련도 증가
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

    // 3. 카르마 변화 적용
    if (rewards.karmaChange && rewards.karmaChange !== 0 && userId) {
      try {
        const currentBattle = useBattleStore.getState().battle;
        const reason = currentBattle.monster
          ? `${currentBattle.monster.nameKo} 처치`
          : "몬스터 처치";

        const result = await updateKarma(userId, rewards.karmaChange, reason);

        // 카르마 변화 알림
        if (rewards.karmaChange > 0) {
          toast.success(`카르마 +${rewards.karmaChange}`);
        } else {
          toast.error(`카르마 ${rewards.karmaChange}`);
        }
      } catch (error) {
        console.error("Failed to update karma:", error);
      }
    }

    // 4. 드롭 아이템 인벤토리에 추가
    if (rewards.drops.length > 0 && userId) {
      for (const drop of rewards.drops) {
        try {
          const item = await fetchItemById(drop.itemId);
          if (item) {
            await addItem({
              userId,
              itemId: drop.itemId,
              itemType: item.type,
              quantity: drop.quantity,
            });
          }
        } catch (error) {
          console.error("Failed to add drop item:", error);
        }
      }
    }

    // 5. 캐시 무효화
    if (userId) {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: karmaKeys.detail(userId) });
    }

    onVictory?.(rewards);
    resetBattle();
  }, [processRewards, profile, userId, gainProficiency, queryClient, onVictory, resetBattle]);

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
