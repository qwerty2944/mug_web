import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WeaponType } from "@/entities/proficiency";
import type {
  EquipmentSlot,
  EquipmentStats,
  WeaponHandType,
  OffHandItemType,
  AccessoryType,
} from "@/entities/item";

// 장착된 아이템 정보
export interface EquippedItem {
  itemId: string;
  itemName: string;
  itemType: WeaponType | string;
  icon: string;
  // 무기 정보
  handType?: WeaponHandType;
  offHandType?: OffHandItemType;
  // 장신구 정보
  accessoryType?: AccessoryType;
  // Unity 외형
  unityPartIndex?: number;
  // 스탯
  stats?: EquipmentStats;
}

// 장착 가능 여부 결과
export interface CanEquipResult {
  canEquip: boolean;
  reason?: string;
}

// 장비 상태
interface EquipmentState {
  // 외형 슬롯 (6)
  mainHand: EquippedItem | null;
  offHand: EquippedItem | null;
  helmet: EquippedItem | null;
  armor: EquippedItem | null;
  cloth: EquippedItem | null;
  pants: EquippedItem | null;

  // 장신구 슬롯 (6)
  ring1: EquippedItem | null;
  ring2: EquippedItem | null;
  necklace: EquippedItem | null;
  earring1: EquippedItem | null;
  earring2: EquippedItem | null;
  bracelet: EquippedItem | null;

  // 배운 스킬 ID 목록
  learnedSkills: string[];

  // 액션
  equipItem: (slot: EquipmentSlot, item: EquippedItem) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  canEquipToSlot: (slot: EquipmentSlot, item: EquippedItem) => CanEquipResult;
  isOffHandDisabled: () => boolean;
  getTotalStats: () => EquipmentStats;
  getEquippedItem: (slot: EquipmentSlot) => EquippedItem | null;

  // 스킬 관련
  learnSkill: (skillId: string) => void;
  unlearnSkill: (skillId: string) => void;
  hasLearnedSkill: (skillId: string) => boolean;

  // 초기화 (테스트용)
  resetEquipment: () => void;
  initializeDefaultSkills: () => void;
}

// 기본 시작 스킬
const DEFAULT_SKILLS = ["heal"];

const initialEquipmentState = {
  // 외형 슬롯
  mainHand: null,
  offHand: null,
  helmet: null,
  armor: null,
  cloth: null,
  pants: null,
  // 장신구 슬롯
  ring1: null,
  ring2: null,
  necklace: null,
  earring1: null,
  earring2: null,
  bracelet: null,
  // 스킬
  learnedSkills: DEFAULT_SKILLS,
};

// 모든 슬롯 키
const ALL_SLOTS: EquipmentSlot[] = [
  "mainHand", "offHand", "helmet", "armor", "cloth", "pants",
  "ring1", "ring2", "necklace", "earring1", "earring2", "bracelet"
];

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      ...initialEquipmentState,

      // 아이템 장착
      equipItem: (slot, item) => {
        // 양손무기 장착 시 오프핸드 자동 해제
        if (slot === "mainHand" && item.handType === "two_handed") {
          set({ [slot]: item, offHand: null });
        } else {
          set({ [slot]: item });
        }
      },

      // 아이템 해제
      unequipItem: (slot) => {
        set({ [slot]: null });
      },

      // 슬롯에 장착 가능 여부 확인
      canEquipToSlot: (slot, item) => {
        const state = get();

        // 양손무기 장착 시 오프핸드 확인
        if (slot === "mainHand" && item.handType === "two_handed" && state.offHand) {
          return { canEquip: false, reason: "보조 장비를 먼저 해제하세요" };
        }

        // 오프핸드 비활성화 체크
        if (slot === "offHand" && state.isOffHandDisabled()) {
          return { canEquip: false, reason: "양손 무기 장착 중" };
        }

        // 쌍수: 오프핸드에 무기 장착 시 주무기가 한손이어야 함
        if (slot === "offHand" && item.offHandType === "weapon") {
          if (!state.mainHand) {
            return { canEquip: false, reason: "주무기를 먼저 장착하세요" };
          }
          if (state.mainHand.handType !== "one_handed") {
            return { canEquip: false, reason: "한손 무기를 먼저 장착하세요" };
          }
        }

        return { canEquip: true };
      },

      // 오프핸드 비활성화 여부 (양손무기 장착 중)
      isOffHandDisabled: () => {
        const { mainHand } = get();
        return mainHand?.handType === "two_handed";
      },

      // 전체 장비 스탯 합산
      getTotalStats: () => {
        const state = get();
        const totalStats: EquipmentStats = {};

        for (const slot of ALL_SLOTS) {
          const item = state[slot] as EquippedItem | null;
          if (item?.stats) {
            for (const [key, value] of Object.entries(item.stats)) {
              if (typeof value === "number") {
                totalStats[key as keyof EquipmentStats] =
                  (totalStats[key as keyof EquipmentStats] || 0) + value;
              }
            }
          }
        }

        return totalStats;
      },

      // 슬롯에 장착된 아이템 가져오기
      getEquippedItem: (slot) => {
        return get()[slot] as EquippedItem | null;
      },

      // 스킬 배우기
      learnSkill: (skillId) => {
        const { learnedSkills } = get();
        if (!learnedSkills.includes(skillId)) {
          set({ learnedSkills: [...learnedSkills, skillId] });
        }
      },

      // 스킬 잊기
      unlearnSkill: (skillId) => {
        const { learnedSkills } = get();
        set({ learnedSkills: learnedSkills.filter((id) => id !== skillId) });
      },

      // 스킬 보유 확인
      hasLearnedSkill: (skillId) => {
        return get().learnedSkills.includes(skillId);
      },

      // 장비 초기화
      resetEquipment: () => {
        set(initialEquipmentState);
      },

      // 기본 스킬 초기화
      initializeDefaultSkills: () => {
        set({ learnedSkills: DEFAULT_SKILLS });
      },
    }),
    {
      name: "equipment-storage",
      version: 2, // 마이그레이션 버전
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mainHand: state.mainHand,
        offHand: state.offHand,
        helmet: state.helmet,
        armor: state.armor,
        cloth: state.cloth,
        pants: state.pants,
        ring1: state.ring1,
        ring2: state.ring2,
        necklace: state.necklace,
        earring1: state.earring1,
        earring2: state.earring2,
        bracelet: state.bracelet,
        learnedSkills: state.learnedSkills,
      }),
      // 기존 데이터 마이그레이션
      migrate: (persistedState, version) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persistedState as any;

        // 항상 마이그레이션 수행 (버전과 관계없이 데이터 정합성 보장)
        // v1 → v2 마이그레이션: 4슬롯 → 12슬롯
        // weapon → mainHand
        if (state.weapon && !state.mainHand) {
          state.mainHand = state.weapon;
          delete state.weapon;
        }
        // accessory → ring1
        if (state.accessory && !state.ring1) {
          state.ring1 = state.accessory;
          delete state.accessory;
        }

        // 모든 슬롯 초기화 (누락된 필드 채우기)
        state.mainHand = state.mainHand ?? null;
        state.offHand = state.offHand ?? null;
        state.helmet = state.helmet ?? null;
        state.armor = state.armor ?? null;
        state.cloth = state.cloth ?? null;
        state.pants = state.pants ?? null;
        state.ring1 = state.ring1 ?? null;
        state.ring2 = state.ring2 ?? null;
        state.necklace = state.necklace ?? null;
        state.earring1 = state.earring1 ?? null;
        state.earring2 = state.earring2 ?? null;
        state.bracelet = state.bracelet ?? null;
        state.learnedSkills = state.learnedSkills ?? DEFAULT_SKILLS;

        // 잘못된 데이터 정리 (old fields 삭제)
        delete state.weapon;
        delete state.accessory;

        return state;
      },
    }
  )
);

// ============ 유틸리티 함수 ============

// 장착 무기 타입 가져오기
export function getEquippedWeaponType(
  weapon: EquippedItem | null
): WeaponType | null {
  if (!weapon) return null;
  return weapon.itemType as WeaponType;
}

// 쌍수 장착 여부 확인
export function isDualWielding(state: EquipmentState): boolean {
  return (
    state.mainHand?.handType === "one_handed" &&
    state.offHand?.offHandType === "weapon"
  );
}

// 방패 장착 여부 확인
export function hasShieldEquipped(state: EquipmentState): boolean {
  return state.offHand?.offHandType === "shield";
}

// 장비된 슬롯 개수
export function getEquippedSlotCount(state: EquipmentState): number {
  return ALL_SLOTS.filter((slot) => state[slot] !== null).length;
}

// 호환성: weapon 별칭 (mainHand로 매핑)
export const useWeapon = () => {
  const mainHand = useEquipmentStore((state) => state.mainHand);
  return mainHand;
};
