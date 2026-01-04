import { create } from "zustand";

// Unity에서 받는 스프라이트 개수 정보
export interface SpriteCounts {
  bodyCount: number;
  eyeCount: number;
  hairCount: number;
  clothCount: number;
  armorCount: number;
  pantCount: number;
  helmetCount: number;
  backCount: number;
  swordCount: number;
  shieldCount: number;
  bodyNames?: string[];
  eyeNames?: string[];
  hairNames?: string[];
  clothNames?: string[];
  armorNames?: string[];
}

// Unity에서 받는 캐릭터 상태
export interface CharacterState {
  bodyIndex: number;
  eyeIndex: number;
  hairIndex: number;
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
  clothColor: string;
  armorColor: string;
  pantColor: string;
}

// 애니메이션 상태
export interface AnimationState {
  currentState: string;
  currentIndex: number;
  currentName: string;
  totalInState: number;
}

export interface AnimationCounts {
  states: string[];
  stateCounts: number[];
  idleCount: number;
  moveCount: number;
  attackCount: number;
}

// Unity 메시지 전송 함수 타입
type SendMessageFn = (objectName: string, methodName: string, param?: string) => void;

interface CharacterStore {
  // 상태
  isUnityLoaded: boolean;
  spriteCounts: SpriteCounts | null;
  characterState: CharacterState | null;
  animationState: AnimationState | null;
  animationCounts: AnimationCounts | null;
  unityObjectName: string;
  sendMessage: SendMessageFn | null;

  // Unity 연결
  setUnityLoaded: (loaded: boolean) => void;
  setSendMessage: (fn: SendMessageFn, objectName: string) => void;
  setSpriteCounts: (counts: SpriteCounts) => void;
  setCharacterState: (state: CharacterState) => void;
  setAnimationState: (state: AnimationState) => void;
  setAnimationCounts: (counts: AnimationCounts) => void;

  // Unity 호출 헬퍼
  callUnity: (method: string, param?: string) => void;

  // 캐릭터 조작
  nextBody: () => void;
  prevBody: () => void;
  nextEye: () => void;
  prevEye: () => void;
  nextHair: () => void;
  prevHair: () => void;
  nextCloth: () => void;
  prevCloth: () => void;
  nextArmor: () => void;
  prevArmor: () => void;
  nextPant: () => void;
  prevPant: () => void;
  nextHelmet: () => void;
  prevHelmet: () => void;
  nextBack: () => void;
  prevBack: () => void;

  // 색상
  setHairColor: (hex: string) => void;
  setClothColor: (hex: string) => void;
  setBodyColor: (hex: string) => void;
  setArmorColor: (hex: string) => void;

  // 애니메이션
  nextAnimation: () => void;
  prevAnimation: () => void;
  changeAnimationState: (state: string) => void;

  // 유틸리티
  randomize: () => void;
  clearAll: () => void;
  resetColors: () => void;
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

  // Unity 연결
  setUnityLoaded: (loaded) => set({ isUnityLoaded: loaded }),
  setSendMessage: (fn, objectName) => set({ sendMessage: fn, unityObjectName: objectName }),
  setSpriteCounts: (counts) => set({ spriteCounts: counts }),
  setCharacterState: (state) => set({ characterState: state }),
  setAnimationState: (state) => set({ animationState: state }),
  setAnimationCounts: (counts) => set({ animationCounts: counts }),

  // Unity 호출 헬퍼
  callUnity: (method, param) => {
    const { sendMessage, unityObjectName, isUnityLoaded } = get();
    if (!isUnityLoaded || !sendMessage) return;
    sendMessage(unityObjectName, method, param ?? "");
  },

  // 캐릭터 조작
  nextBody: () => get().callUnity("JS_NextBody"),
  prevBody: () => get().callUnity("JS_PrevBody"),
  nextEye: () => get().callUnity("JS_NextEye"),
  prevEye: () => get().callUnity("JS_PrevEye"),
  nextHair: () => get().callUnity("JS_NextHair"),
  prevHair: () => get().callUnity("JS_PrevHair"),
  nextCloth: () => get().callUnity("JS_NextCloth"),
  prevCloth: () => get().callUnity("JS_PrevCloth"),
  nextArmor: () => get().callUnity("JS_NextArmor"),
  prevArmor: () => get().callUnity("JS_PrevArmor"),
  nextPant: () => get().callUnity("JS_NextPant"),
  prevPant: () => get().callUnity("JS_PrevPant"),
  nextHelmet: () => get().callUnity("JS_NextHelmet"),
  prevHelmet: () => get().callUnity("JS_PrevHelmet"),
  nextBack: () => get().callUnity("JS_NextBack"),
  prevBack: () => get().callUnity("JS_PrevBack"),

  // 색상
  setHairColor: (hex) => get().callUnity("JS_SetHairColor", hex.replace("#", "")),
  setClothColor: (hex) => get().callUnity("JS_SetClothColor", hex.replace("#", "")),
  setBodyColor: (hex) => get().callUnity("JS_SetBodyColor", hex.replace("#", "")),
  setArmorColor: (hex) => get().callUnity("JS_SetArmorColor", hex.replace("#", "")),

  // 애니메이션
  nextAnimation: () => get().callUnity("JS_NextAnimation"),
  prevAnimation: () => get().callUnity("JS_PrevAnimation"),
  changeAnimationState: (state) => get().callUnity("JS_SetAnimationState", state),

  // 유틸리티
  randomize: () => get().callUnity("JS_Randomize"),
  clearAll: () => get().callUnity("JS_ClearAll"),
  resetColors: () => get().callUnity("JS_ResetColors"),
}));
