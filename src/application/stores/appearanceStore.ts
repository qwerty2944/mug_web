import { create } from "zustand";
import type { CharacterAppearance, CharacterColors } from "@/entities/character";
import type { EquipmentSlot } from "@/entities/item";

// ============ 타입 정의 ============

export type PartType =
  | "body" | "eye" | "hair" | "facehair" | "cloth"
  | "armor" | "pant" | "helmet" | "back";

export interface SpriteCounts {
  bodyCount: number;
  eyeCount: number;
  hairCount: number;
  facehairCount: number;
  clothCount: number;
  armorCount: number;
  pantCount: number;
  helmetCount: number;
  backCount: number;
  swordCount: number;
  shieldCount: number;
}

export interface CharacterState {
  bodyIndex: number;
  eyeIndex: number;
  hairIndex: number;
  facehairIndex: number;
  clothIndex: number;
  armorIndex: number;
  pantIndex: number;
  helmetIndex: number;
  backIndex: number;
  leftWeaponIndex: number;
  rightWeaponIndex: number;
  leftWeaponType: string;
  rightWeaponType: string;
  bodyColor: string;
  eyeColor: string;
  hairColor: string;
  facehairColor: string;
  clothColor: string;
  armorColor: string;
  pantColor: string;
}

export interface AnimationState {
  currentState: string;
  currentIndex: number;
  currentName: string;
  totalInState: number;
}

export interface AnimationCounts {
  states: string[];
  stateCounts: number[];
}

type SendMessageFn = (objectName: string, methodName: string, param?: string) => void;

// ============ 파츠 메타데이터 ============

const PART_META: Record<PartType, { label: string; indexKey: keyof CharacterState; countKey: keyof SpriteCounts; required: boolean }> = {
  body: { label: "종족", indexKey: "bodyIndex", countKey: "bodyCount", required: true },
  eye: { label: "눈", indexKey: "eyeIndex", countKey: "eyeCount", required: true },
  hair: { label: "머리", indexKey: "hairIndex", countKey: "hairCount", required: false },
  facehair: { label: "수염", indexKey: "facehairIndex", countKey: "facehairCount", required: false },
  cloth: { label: "옷", indexKey: "clothIndex", countKey: "clothCount", required: false },
  armor: { label: "갑옷", indexKey: "armorIndex", countKey: "armorCount", required: false },
  pant: { label: "바지", indexKey: "pantIndex", countKey: "pantCount", required: false },
  helmet: { label: "투구", indexKey: "helmetIndex", countKey: "helmetCount", required: false },
  back: { label: "등", indexKey: "backIndex", countKey: "backCount", required: false },
};

export const PART_TYPES = Object.keys(PART_META) as PartType[];

// ============ 스토어 ============

interface AppearanceStore {
  // 상태
  isUnityLoaded: boolean;
  spriteCounts: SpriteCounts | null;
  characterState: CharacterState | null;
  animationState: AnimationState | null;
  animationCounts: AnimationCounts | null;
  unityObjectName: string;
  sendMessage: SendMessageFn | null;
  selectedColor: string;

  // Unity 연결
  setUnityLoaded: (loaded: boolean) => void;
  setSendMessage: (fn: SendMessageFn, objectName: string) => void;
  setSpriteCounts: (counts: SpriteCounts) => void;
  setCharacterState: (state: CharacterState) => void;
  setAnimationState: (state: AnimationState) => void;
  setAnimationCounts: (counts: AnimationCounts) => void;
  setSelectedColor: (color: string) => void;

  // Unity 호출
  callUnity: (method: string, param?: string) => void;

  // 파츠 조작
  nextPart: (type: PartType) => void;
  prevPart: (type: PartType) => void;

  // 색상
  applyColorTo: (target: "hair" | "facehair" | "cloth" | "body" | "armor") => void;

  // 애니메이션
  nextAnimation: () => void;
  prevAnimation: () => void;
  changeAnimationState: (state: string) => void;

  // 유틸리티
  randomize: () => void;
  clearAll: () => void;
  resetColors: () => void;

  // 캐릭터 외형 로드
  loadAppearance: (appearance: CharacterAppearance, colors: CharacterColors) => void;
  setPart: (type: PartType, index: number) => void;
  setColor: (target: "body" | "eye" | "hair" | "facehair" | "cloth" | "armor" | "pant", hex: string) => void;

  // 장비 외형 연동
  setEquipmentAppearance: (slot: EquipmentSlot, index: number | null) => void;

  // Computed (선택자)
  getPartInfo: (type: PartType) => { label: string; current: number; total: number };
  getAnimationInfo: () => { state: string; index: number; total: number; name: string; states: string[] };
}

export const useAppearanceStore = create<AppearanceStore>((set, get) => ({
  // 초기 상태
  isUnityLoaded: false,
  spriteCounts: null,
  characterState: null,
  animationState: null,
  animationCounts: null,
  unityObjectName: "",
  sendMessage: null,
  selectedColor: "#FF0000",

  // Unity 연결
  setUnityLoaded: (loaded) => set({ isUnityLoaded: loaded }),
  setSendMessage: (fn, objectName) => set({ sendMessage: fn, unityObjectName: objectName }),
  setSpriteCounts: (counts) => set({ spriteCounts: counts }),
  setCharacterState: (state) => set({ characterState: state }),
  setAnimationState: (state) => set({ animationState: state }),
  setAnimationCounts: (counts) => set({ animationCounts: counts }),
  setSelectedColor: (color) => set({ selectedColor: color }),

  // Unity 호출
  callUnity: (method, param) => {
    const { sendMessage, unityObjectName, isUnityLoaded } = get();
    if (!isUnityLoaded || !sendMessage) return;
    try {
      sendMessage(unityObjectName, method, param ?? "");
    } catch (err) {
      console.warn(`Unity method not found: ${method}`, err);
    }
  },

  // 파츠 조작
  nextPart: (type) => {
    const method = `JS_Next${type.charAt(0).toUpperCase() + type.slice(1)}`;
    get().callUnity(method);
  },
  prevPart: (type) => {
    const method = `JS_Prev${type.charAt(0).toUpperCase() + type.slice(1)}`;
    get().callUnity(method);
  },

  // 색상
  applyColorTo: (target) => {
    const { selectedColor, callUnity } = get();
    const hex = selectedColor.replace("#", "");
    const methodMap = {
      hair: "JS_SetHairColor",
      facehair: "JS_SetFacehairColor",
      cloth: "JS_SetClothColor",
      body: "JS_SetBodyColor",
      armor: "JS_SetArmorColor",
    };
    callUnity(methodMap[target], hex);
  },

  // 애니메이션
  nextAnimation: () => get().callUnity("JS_NextAnimation"),
  prevAnimation: () => get().callUnity("JS_PrevAnimation"),
  changeAnimationState: (state) => get().callUnity("JS_SetAnimationState", state),

  // 유틸리티
  randomize: () => get().callUnity("JS_Randomize"),
  clearAll: () => get().callUnity("JS_ClearAll"),
  resetColors: () => get().callUnity("JS_ResetColors"),

  // 파츠/색상 직접 설정
  setPart: (type, index) => {
    const method = `JS_Set${type.charAt(0).toUpperCase() + type.slice(1)}`;
    get().callUnity(method, index.toString());
  },

  setColor: (target, hex) => {
    const cleanHex = hex.replace("#", "");
    const methodMap: Record<string, string> = {
      body: "JS_SetBodyColor",
      eye: "JS_SetEyeColor",
      hair: "JS_SetHairColor",
      facehair: "JS_SetFacehairColor",
      cloth: "JS_SetClothColor",
      armor: "JS_SetArmorColor",
      pant: "JS_SetPantColor",
    };
    get().callUnity(methodMap[target], cleanHex);
  },

  // 저장된 캐릭터 외형 로드
  loadAppearance: (appearance, colors) => {
    const { callUnity, isUnityLoaded } = get();
    if (!isUnityLoaded) return;

    // 파츠 설정 (Unity에 존재하는 메서드만 호출)
    // 주의: JS_SetEye는 Unity에 없음 - 눈은 body와 함께 설정됨
    if (appearance.bodyIndex >= 0) callUnity("JS_SetBody", appearance.bodyIndex.toString());
    if (appearance.hairIndex >= 0) callUnity("JS_SetHair", appearance.hairIndex.toString());
    if (appearance.facehairIndex >= 0) callUnity("JS_SetFacehair", appearance.facehairIndex.toString());
    if (appearance.clothIndex >= 0) callUnity("JS_SetCloth", appearance.clothIndex.toString());
    if (appearance.armorIndex >= 0) callUnity("JS_SetArmor", appearance.armorIndex.toString());
    if (appearance.pantIndex >= 0) callUnity("JS_SetPant", appearance.pantIndex.toString());
    if (appearance.helmetIndex >= 0) callUnity("JS_SetHelmet", appearance.helmetIndex.toString());
    if (appearance.backIndex >= 0) callUnity("JS_SetBack", appearance.backIndex.toString());

    // 색상 설정
    if (colors.hair) callUnity("JS_SetHairColor", colors.hair.replace("#", ""));
    if (colors.facehair) callUnity("JS_SetFacehairColor", colors.facehair.replace("#", ""));
    if (colors.cloth) callUnity("JS_SetClothColor", colors.cloth.replace("#", ""));
    if (colors.armor) callUnity("JS_SetArmorColor", colors.armor.replace("#", ""));
    // 눈 색상은 좌우 분리되어 있음
    if (colors.eye) {
      callUnity("JS_SetLeftEyeColor", colors.eye.replace("#", ""));
      callUnity("JS_SetRightEyeColor", colors.eye.replace("#", ""));
    }
  },

  // 장비 외형 연동 (12슬롯 시스템)
  setEquipmentAppearance: (slot, index) => {
    const { callUnity, isUnityLoaded } = get();
    if (!isUnityLoaded) return;

    // 외형에 영향을 주는 슬롯만 Unity 메서드 호출
    const methodMap: Partial<Record<EquipmentSlot, string>> = {
      armor: "JS_SetArmor",
      cloth: "JS_SetCloth",
      pants: "JS_SetPant",
      helmet: "JS_SetHelmet",
    };

    const method = methodMap[slot];
    if (method) {
      // index가 null이면 -1 (해제)
      callUnity(method, (index ?? -1).toString());
    }
  },

  // Computed
  getPartInfo: (type) => {
    const { characterState, spriteCounts } = get();
    const meta = PART_META[type];
    const current = (characterState?.[meta.indexKey] as number) ?? (meta.required ? 0 : -1);
    const total = (spriteCounts?.[meta.countKey] as number) ?? 0;
    return { label: meta.label, current, total };
  },

  getAnimationInfo: () => {
    const { animationState, animationCounts } = get();
    return {
      state: animationState?.currentState ?? "IDLE",
      index: animationState?.currentIndex ?? 0,
      total: animationState?.totalInState ?? 0,
      name: animationState?.currentName ?? "",
      states: animationCounts?.states ?? [],
    };
  },
}));

// ============ 선택자 훅 ============

export function useAppearancePart(type: PartType) {
  const store = useAppearanceStore();
  const info = store.getPartInfo(type);

  return {
    ...info,
    next: () => store.nextPart(type),
    prev: () => store.prevPart(type),
  };
}

export function useAppearanceAnimation() {
  const store = useAppearanceStore();
  const info = store.getAnimationInfo();

  return {
    ...info,
    next: store.nextAnimation,
    prev: store.prevAnimation,
    changeState: store.changeAnimationState,
  };
}

export function useAppearanceColor() {
  const store = useAppearanceStore();

  return {
    color: store.selectedColor,
    setColor: store.setSelectedColor,
    applyTo: store.applyColorTo,
  };
}

export function useAppearanceActions() {
  const store = useAppearanceStore();

  return {
    randomize: store.randomize,
    clearAll: store.clearAll,
    resetColors: store.resetColors,
  };
}
