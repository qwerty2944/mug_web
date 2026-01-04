import { create } from "zustand";

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

interface CharacterStore {
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

  // Computed (선택자)
  getPartInfo: (type: PartType) => { label: string; current: number; total: number };
  getAnimationInfo: () => { state: string; index: number; total: number; name: string; states: string[] };
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
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
    sendMessage(unityObjectName, method, param ?? "");
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

export function useCharacterPart(type: PartType) {
  const store = useCharacterStore();
  const info = store.getPartInfo(type);

  return {
    ...info,
    next: () => store.nextPart(type),
    prev: () => store.prevPart(type),
  };
}

export function useCharacterAnimation() {
  const store = useCharacterStore();
  const info = store.getAnimationInfo();

  return {
    ...info,
    next: store.nextAnimation,
    prev: store.prevAnimation,
    changeState: store.changeAnimationState,
  };
}

export function useCharacterColor() {
  const store = useCharacterStore();

  return {
    color: store.selectedColor,
    setColor: store.setSelectedColor,
    applyTo: store.applyColorTo,
  };
}

export function useCharacterActions() {
  const store = useCharacterStore();

  return {
    randomize: store.randomize,
    clearAll: store.clearAll,
    resetColors: store.resetColors,
  };
}
