"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCrystal, profileKeys } from "@/entities/user";
import { removeItemFromInventory, inventoryKeys } from "@/entities/inventory";
import type { InventoryType } from "@/entities/inventory";
import toast from "react-hot-toast";

type CrystalId = "crystal_basic" | "crystal_advanced" | "crystal_superior";

const CRYSTAL_CONFIG: Record<CrystalId, { tier: "basic" | "advanced" | "superior"; charges: number }> = {
  crystal_basic: { tier: "basic", charges: 10 },
  crystal_advanced: { tier: "advanced", charges: 30 },
  crystal_superior: { tier: "superior", charges: 100 },
};

interface UseUseCrystalOptions {
  onSuccess?: (newCharges: number) => void;
}

/**
 * 통신용 크리스탈 사용 훅
 * - 인벤토리에서 크리스탈 제거 (수량 1 감소)
 * - 프로필에 충전량 추가
 */
export function useUseCrystal(userId: string | undefined, options: UseUseCrystalOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      crystalId,
      slot,
      inventoryType = "personal" as InventoryType,
    }: {
      crystalId: CrystalId;
      slot: number;
      inventoryType?: InventoryType;
    }) => {
      if (!userId) throw new Error("User ID is required");

      const config = CRYSTAL_CONFIG[crystalId];
      if (!config) throw new Error("Invalid crystal item");

      // 1. 프로필에 충전 추가
      const newCharges = await useCrystal(userId, config.tier, config.charges);

      // 2. 인벤토리에서 크리스탈 수량 감소 (0이 되면 삭제됨)
      await removeItemFromInventory({
        userId,
        slot,
        quantity: 1,
        inventoryType,
      });

      return newCharges;
    },
    onSuccess: (newCharges) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId!) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(userId!) });

      toast.success(`크리스탈 충전 완료! (${newCharges}회)`);
      options.onSuccess?.(newCharges);
    },
    onError: (error) => {
      console.error("Failed to use crystal:", error);
      toast.error("크리스탈 사용에 실패했습니다");
    },
  });
}

/**
 * 크리스탈 아이템인지 확인
 */
export function isCrystalItem(itemId: string): itemId is CrystalId {
  return itemId in CRYSTAL_CONFIG;
}

/**
 * 크리스탈 충전량 정보
 */
export function getCrystalCharges(crystalId: CrystalId): number {
  return CRYSTAL_CONFIG[crystalId]?.charges || 0;
}
