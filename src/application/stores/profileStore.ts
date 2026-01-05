import { create } from "zustand";
import {
  STARTER_PRESETS,
  RACES,
  BASE_STATS,
  BONUS_POINTS,
  MAX_STAT,
  MIN_STAT,
  type Gender,
  type Race,
  type BodyType,
  type StarterPreset,
  type CharacterStats,
} from "@/features/character/types/presets";
import { useAppearanceStore } from "./appearanceStore";

// ============ 타입 정의 ============

type CreateStep = "info" | "customize";

interface ProfileState {
  // 상태
  step: CreateStep;
  name: string;
  gender: Gender;
  race: Race;
  bodyType: BodyType;
  preset: StarterPreset;
  allocatedStats: CharacterStats;

  // 액션
  setStep: (step: CreateStep) => void;
  setName: (name: string) => void;
  setGender: (gender: Gender) => void;
  setRace: (race: Race) => void;
  setBodyType: (bodyType: BodyType) => void;
  setPreset: (preset: StarterPreset) => void;

  // 스탯 관련
  increaseStat: (stat: keyof CharacterStats) => void;
  decreaseStat: (stat: keyof CharacterStats) => void;
  resetStats: () => void;

  // Computed
  getUsedPoints: () => number;
  getRemainingPoints: () => number;
  getFinalStats: () => CharacterStats;
  getStatBonus: (stat: keyof CharacterStats) => number;

  // 초기화
  reset: () => void;
}

// ============ 스토어 ============

export const useProfileStore = create<ProfileState>((set, get) => ({
  // 초기 상태
  step: "info",
  name: "",
  gender: "male",
  race: RACES[0],
  bodyType: RACES[0].bodyTypes[0],
  preset: STARTER_PRESETS[0],
  allocatedStats: { ...BASE_STATS },

  // 기본 액션
  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setGender: (gender) => set({ gender }),

  // 종족 선택 (바디타입도 함께 변경)
  setRace: (race) => {
    const bodyType = race.bodyTypes[0];
    set({ race, bodyType });
    useAppearanceStore.getState().callUnity("JS_SetBody", bodyType.index.toString());
  },

  // 바디타입 선택
  setBodyType: (bodyType) => {
    set({ bodyType });
    useAppearanceStore.getState().callUnity("JS_SetBody", bodyType.index.toString());
  },

  // 프리셋 선택 (장비 적용)
  setPreset: (preset) => {
    set({ preset });
    const { bodyType } = get();
    const { callUnity } = useAppearanceStore.getState();

    // 장비 초기화 후 프리셋 적용
    callUnity("JS_ClearAll");
    callUnity("JS_SetBody", bodyType.index.toString());

    const { appearance } = preset;
    if (appearance.clothIndex !== undefined) {
      callUnity("JS_SetCloth", appearance.clothIndex.toString());
    }
    if (appearance.armorIndex !== undefined) {
      callUnity("JS_SetArmor", appearance.armorIndex.toString());
    }
    if (appearance.pantIndex !== undefined) {
      callUnity("JS_SetPant", appearance.pantIndex.toString());
    }
    if (appearance.helmetIndex !== undefined) {
      callUnity("JS_SetHelmet", appearance.helmetIndex.toString());
    }
    if (appearance.backIndex !== undefined) {
      callUnity("JS_SetBack", appearance.backIndex.toString());
    }
  },

  // 스탯 증가
  increaseStat: (stat) => {
    const { allocatedStats, getRemainingPoints } = get();
    if (getRemainingPoints() <= 0) return;
    if (allocatedStats[stat] >= MAX_STAT) return;

    set({
      allocatedStats: {
        ...allocatedStats,
        [stat]: allocatedStats[stat] + 1,
      },
    });
  },

  // 스탯 감소
  decreaseStat: (stat) => {
    const { allocatedStats } = get();
    if (allocatedStats[stat] <= MIN_STAT) return;

    set({
      allocatedStats: {
        ...allocatedStats,
        [stat]: allocatedStats[stat] - 1,
      },
    });
  },

  // 스탯 리셋
  resetStats: () => set({ allocatedStats: { ...BASE_STATS } }),

  // 사용 포인트 계산
  getUsedPoints: () => {
    const { allocatedStats } = get();
    return Object.keys(BASE_STATS).reduce((sum, key) => {
      const k = key as keyof CharacterStats;
      return sum + (allocatedStats[k] - BASE_STATS[k]);
    }, 0);
  },

  // 남은 포인트
  getRemainingPoints: () => {
    return BONUS_POINTS - get().getUsedPoints();
  },

  // 최종 스탯 (종족 + 프리셋 보너스 포함)
  getFinalStats: () => {
    const { allocatedStats, race, preset } = get();
    const result = { ...allocatedStats };

    // 종족 보너스 적용
    for (const [key, value] of Object.entries(race.statBonus)) {
      result[key as keyof CharacterStats] += value;
    }

    // 프리셋 보너스 적용
    if (preset.bonusStats) {
      for (const [key, value] of Object.entries(preset.bonusStats)) {
        result[key as keyof CharacterStats] += value;
      }
    }

    return result;
  },

  // 특정 스탯의 보너스 (종족 + 프리셋)
  getStatBonus: (stat) => {
    const { race, preset } = get();
    const raceBonus = race.statBonus[stat] ?? 0;
    const presetBonus = preset.bonusStats?.[stat] ?? 0;
    return raceBonus + presetBonus;
  },

  // 전체 초기화
  reset: () =>
    set({
      step: "info",
      name: "",
      gender: "male",
      race: RACES[0],
      bodyType: RACES[0].bodyTypes[0],
      preset: STARTER_PRESETS[0],
      allocatedStats: { ...BASE_STATS },
    }),
}));
