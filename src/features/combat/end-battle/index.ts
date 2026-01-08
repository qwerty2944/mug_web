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
import {
  calculateProficiencyGain,
  canGainProficiency,
  useProficiencies,
} from "@/entities/proficiency";
import toast from "react-hot-toast";

interface BattleRewards {
  exp: number;
  gold: number;
  drops: { itemId: string; quantity: number }[];
  proficiencyGain?: {
    type: ProficiencyType;
    amount: number;
    levelDiff?: number;
    gained: boolean;
    reason?: string;
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
  const { data: proficiencies } = useProficiencies(userId);

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

    // 숙련도 증가 (사용한 무기/마법) - 레벨 기반 시스템
    let proficiencyGain: BattleRewards["proficiencyGain"] = undefined;
    if (currentBattle.usedWeaponType && currentBattle.monster) {
      const profType = currentBattle.usedWeaponType as ProficiencyType;
      const currentProf = proficiencies?.[profType as keyof typeof proficiencies] ?? 0;
      const monsterLevel = currentBattle.monster.level;

      // 레벨 기반 숙련도 획득 계산
      const gainResult = calculateProficiencyGain({
        proficiencyType: profType,
        currentProficiency: currentProf,
        playerLevel,
        monsterLevel,
        attackSuccess: true,
      });

      proficiencyGain = {
        type: profType,
        amount: gainResult.amount,
        levelDiff: gainResult.levelDiff,
        gained: gainResult.gained,
        reason: gainResult.reason,
      };
    }

    // 카르마 변화 계산
    const karmaChange = calculateKarmaChange(
      currentBattle.monster.alignment,
      currentBattle.monster.level
    );

    return { exp, gold, drops, proficiencyGain, karmaChange };
  }, [playerLevel, proficiencies]);

  // 승리 처리
  const handleVictory = useCallback(async () => {
    const rewards = processRewards();
    const currentBattleState = useBattleStore.getState().battle;
    const monsterName = currentBattleState.monster?.nameKo || "몬스터";

    // UI 먼저 닫기 (사용자 경험 개선)
    resetBattle();

    // 보상 처리 실패해도 전투는 이미 종료됨
    if (!rewards || !profile) {
      console.warn("[Battle] Cannot process rewards - battle already closed");
      return;
    }

    try {
      // 1. 경험치/골드 지급 + 레벨업 체크 + HP/MP 저장
      if (userId) {
        try {
          const totalExp = profile.experience + rewards.exp;
          const levelUpResult = checkLevelUp(profile.level, totalExp);

          await updateProfile({
            userId,
            level: levelUpResult.newLevel,
            experience: levelUpResult.newExp,
            gold: profile.gold + rewards.gold,
            // 전투 후 HP/MP 저장
            currentHp: currentBattleState.playerCurrentHp,
            currentMp: currentBattleState.playerMp,
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

      // 2. 숙련도 증가 (레벨 기반)
      if (rewards.proficiencyGain && userId) {
        if (rewards.proficiencyGain.gained && rewards.proficiencyGain.amount > 0) {
          try {
            await gainProficiency.mutateAsync({
              type: rewards.proficiencyGain.type,
              amount: rewards.proficiencyGain.amount,
            });
          } catch (error) {
            console.error("Failed to increase proficiency:", error);
          }
        } else if (rewards.proficiencyGain.reason === "level_too_low") {
          // 레벨이 너무 낮아 숙련도 미획득 (조용히 처리, 토스트 안 띄움)
          console.log(`[Proficiency] Level too low for gain (level diff: ${rewards.proficiencyGain.levelDiff})`);
        }
      }

      // 3. 카르마 변화 적용
      if (rewards.karmaChange && rewards.karmaChange !== 0 && userId) {
        try {
          const reason = `${monsterName} 처치`;

          await updateKarma(userId, rewards.karmaChange, reason);

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
    } catch (error) {
      console.error("[Battle] Error processing rewards:", error);
    }
  }, [processRewards, profile, userId, gainProficiency, queryClient, onVictory, resetBattle]);

  // 패배 처리
  const handleDefeat = useCallback(async () => {
    const currentBattleState = useBattleStore.getState().battle;

    // UI 먼저 닫기
    resetBattle();

    // 패배 시 HP/MP 저장 (HP는 0 또는 낮은 상태)
    if (userId) {
      try {
        await updateProfile({
          userId,
          currentHp: currentBattleState.playerCurrentHp,
          currentMp: currentBattleState.playerMp,
        });

        // 캐시 무효화
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      } catch (error) {
        console.error("Failed to save HP/MP after defeat:", error);
      }
    }

    // TODO: 패널티 처리 (골드 손실 등)
    onDefeat?.();
  }, [userId, onDefeat, resetBattle, queryClient]);

  // 도주 처리
  const handleFled = useCallback(async () => {
    const currentBattleState = useBattleStore.getState().battle;

    // UI 먼저 닫기
    resetBattle();

    // 도주 시 HP/MP 저장
    if (userId) {
      try {
        await updateProfile({
          userId,
          currentHp: currentBattleState.playerCurrentHp,
          currentMp: currentBattleState.playerMp,
        });

        // 캐시 무효화
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      } catch (error) {
        console.error("Failed to save HP/MP after flee:", error);
      }
    }

    onFled?.();
  }, [userId, onFled, resetBattle, queryClient]);

  // 전투 결과에 따른 종료 처리
  // 주의: useBattleStore.getState()로 최신 상태를 읽어서 stale closure 문제 방지
  const endBattle = useCallback(() => {
    const currentResult = useBattleStore.getState().battle.result;
    switch (currentResult) {
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
  }, [handleVictory, handleDefeat, handleFled]);

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
