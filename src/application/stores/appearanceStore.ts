import { create } from "zustand";
import type { CharacterAppearance, CharacterColors } from "@/entities/character";
import type { EquipmentSlot, SpriteReference, SpriteCategory } from "@/entities/item";

// ============ 타입 정의 ============

export type PartType =
  | "body" | "eye" | "hair" | "facehair" | "cloth"
  | "armor" | "pant" | "helmet" | "back"
  // 무기 파츠 (12슬롯 장비 시스템용)
  | "sword" | "shield" | "axe" | "bow" | "wand";

// 무기 타입 (스프라이트 카테고리와 매핑)
export type WeaponPartType = "sword" | "shield" | "axe" | "bow" | "wand";

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
  // 무기 스프라이트 카운트
  swordCount: number;
  shieldCount: number;
  axeCount: number;
  bowCount: number;
  wandCount: number;
}

// 스프라이트 이름 데이터 (all-sprites.json)
export interface SpriteNames {
  bodyNames: string[];
  eyeNames: string[];
  hairNames: string[];
  facehairNames: string[];
  clothNames: string[];
  armorNames: string[];
  pantNames: string[];
  helmetNames: string[];
  backNames: string[];
  swordNames: string[];
  shieldNames: string[];
  axeNames: string[];
  bowNames: string[];
  wandNames: string[];
}

// 손별 무기 상태
export interface HandWeaponState {
  weaponType: WeaponPartType | null;
  index: number; // -1이면 없음
}

export type HandType = "left" | "right";

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
  // 무기 인덱스 (각 타입별)
  swordIndex: number;
  shieldIndex: number;
  axeIndex: number;
  bowIndex: number;
  wandIndex: number;
  // 기존 호환용 (deprecated)
  leftWeaponIndex: number;
  rightWeaponIndex: number;
  leftWeaponType: string;
  rightWeaponType: string;
  // 색상
  bodyColor: string;
  eyeColor: string;
  hairColor: string;
  facehairColor: string;
  clothColor: string;
  armorColor: string;
  pantColor: string;
  helmetColor: string;
  backColor: string;
  // 무기 색상 (hex, 기본값은 빈 문자열 = 원본 색상)
  swordColor: string;
  shieldColor: string;
  axeColor: string;
  bowColor: string;
  wandColor: string;
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

const PART_META: Record<PartType, { label: string; indexKey: keyof CharacterState; countKey: keyof SpriteCounts; required: boolean; colorKey?: keyof CharacterState }> = {
  body: { label: "종족", indexKey: "bodyIndex", countKey: "bodyCount", required: true }, // 종족 색상 변경 비활성화
  eye: { label: "눈", indexKey: "eyeIndex", countKey: "eyeCount", required: true, colorKey: "eyeColor" },
  hair: { label: "머리", indexKey: "hairIndex", countKey: "hairCount", required: false, colorKey: "hairColor" },
  facehair: { label: "수염", indexKey: "facehairIndex", countKey: "facehairCount", required: false, colorKey: "facehairColor" },
  cloth: { label: "옷", indexKey: "clothIndex", countKey: "clothCount", required: false, colorKey: "clothColor" },
  armor: { label: "갑옷", indexKey: "armorIndex", countKey: "armorCount", required: false, colorKey: "armorColor" },
  pant: { label: "바지", indexKey: "pantIndex", countKey: "pantCount", required: false, colorKey: "pantColor" },
  helmet: { label: "투구", indexKey: "helmetIndex", countKey: "helmetCount", required: false, colorKey: "helmetColor" },
  back: { label: "등", indexKey: "backIndex", countKey: "backCount", required: false, colorKey: "backColor" },
  // 무기 파츠
  sword: { label: "검", indexKey: "swordIndex", countKey: "swordCount", required: false, colorKey: "swordColor" },
  shield: { label: "방패", indexKey: "shieldIndex", countKey: "shieldCount", required: false, colorKey: "shieldColor" },
  axe: { label: "도끼", indexKey: "axeIndex", countKey: "axeCount", required: false, colorKey: "axeColor" },
  bow: { label: "활", indexKey: "bowIndex", countKey: "bowCount", required: false, colorKey: "bowColor" },
  wand: { label: "지팡이", indexKey: "wandIndex", countKey: "wandCount", required: false, colorKey: "wandColor" },
};

// 캐릭터 외형용 파츠 (무기 제외)
export const PART_TYPES = Object.keys(PART_META).filter(
  (key) => !["sword", "shield", "axe", "bow", "wand"].includes(key)
) as PartType[];

// 무기 파츠만
export const WEAPON_PART_TYPES: WeaponPartType[] = ["sword", "shield", "axe", "bow", "wand"];

// ============ 스토어 ============

interface AppearanceStore {
  // 상태
  isUnityLoaded: boolean;
  spriteCounts: SpriteCounts | null;
  spriteNames: SpriteNames | null;
  characterState: CharacterState | null;
  animationState: AnimationState | null;
  animationCounts: AnimationCounts | null;
  unityObjectName: string;
  sendMessage: SendMessageFn | null;
  selectedColor: string;
  // 손별 무기 상태
  leftHandWeapon: HandWeaponState;
  rightHandWeapon: HandWeaponState;

  // Unity 연결
  setUnityLoaded: (loaded: boolean) => void;
  setSendMessage: (fn: SendMessageFn, objectName: string) => void;
  setSpriteCounts: (counts: SpriteCounts) => void;
  setSpriteNames: (names: SpriteNames) => void;
  setCharacterState: (state: CharacterState) => void;
  setAnimationState: (state: AnimationState) => void;
  setAnimationCounts: (counts: AnimationCounts) => void;
  setSelectedColor: (color: string) => void;

  // Unity 호출
  callUnity: (method: string, param?: string) => void;

  // 파츠 조작
  nextPart: (type: PartType) => void;
  prevPart: (type: PartType) => void;
  clearPart: (type: PartType) => void;

  // 손별 무기 조작
  setHandWeaponType: (hand: HandType, weaponType: WeaponPartType | null) => void;
  nextHandWeapon: (hand: HandType) => void;
  prevHandWeapon: (hand: HandType) => void;
  clearHandWeapon: (hand: HandType) => void;
  getHandWeaponName: (hand: HandType) => string;

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
  setColor: (target: "body" | "eye" | "hair" | "facehair" | "cloth" | "armor" | "pant" | "helmet" | "back", hex: string) => void;

  // 장비 외형 연동
  setEquipmentAppearance: (slot: EquipmentSlot, index: number | null) => void;

  // 스프라이트 + 색상 시스템 (새로운 장비 연동)
  setEquipmentSprite: (slot: EquipmentSlot, sprite: SpriteReference | null) => void;
  setWeaponSprite: (category: SpriteCategory, index: number, color?: string) => void;
  clearWeapon: (hand: "left" | "right" | "both") => void;

  // Computed (선택자)
  getPartInfo: (type: PartType) => { label: string; current: number; total: number; name: string; hasColor: boolean };
  getAnimationInfo: () => { state: string; index: number; total: number; name: string; states: string[] };
}

export const useAppearanceStore = create<AppearanceStore>((set, get) => ({
  // 초기 상태
  isUnityLoaded: false,
  spriteCounts: null,
  spriteNames: null,
  characterState: null,
  animationState: null,
  animationCounts: null,
  unityObjectName: "",
  sendMessage: null,
  selectedColor: "#FF0000",
  // 손별 무기 상태
  leftHandWeapon: { weaponType: null, index: -1 },
  rightHandWeapon: { weaponType: null, index: -1 },

  // Unity 연결
  setUnityLoaded: (loaded) => set({ isUnityLoaded: loaded }),
  setSendMessage: (fn, objectName) => set({ sendMessage: fn, unityObjectName: objectName }),
  setSpriteCounts: (counts) => set({ spriteCounts: counts }),
  setSpriteNames: (names) => set({ spriteNames: names }),
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
    const weaponTypes: WeaponPartType[] = ["sword", "shield", "axe", "bow", "wand"];
    const { characterState, spriteCounts, callUnity } = get();
    const meta = PART_META[type];
    const current = (characterState?.[meta.indexKey] as number) ?? 0;
    const total = (spriteCounts?.[meta.countKey] as number) ?? 0;

    if (total === 0) return;

    // 다음 인덱스 계산: 0 → 1 → ... → total-1 → 0 (순환, -1로 가지 않음)
    // 현재가 -1(없음)인 경우 0으로 설정
    const next = current < 0 ? 0 : (current + 1) % total;

    if (weaponTypes.includes(type as WeaponPartType)) {
      // 무기는 JS_SetRightWeapon/JS_SetLeftWeapon 사용
      const method = type === "shield" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
      const weaponTypeName = type.charAt(0).toUpperCase() + type.slice(1);
      callUnity(method, `${weaponTypeName},${next}`);

      // 로컬 상태 업데이트
      set((state) => ({
        characterState: state.characterState ? {
          ...state.characterState,
          [meta.indexKey]: next,
        } : null,
      }));
    } else {
      // 일반 파츠는 JS_SetXxx 사용 (0-total 범위만 순환)
      const method = `JS_Set${type.charAt(0).toUpperCase() + type.slice(1)}`;
      callUnity(method, next.toString());
    }
  },
  prevPart: (type) => {
    const weaponTypes: WeaponPartType[] = ["sword", "shield", "axe", "bow", "wand"];
    const { characterState, spriteCounts, callUnity } = get();
    const meta = PART_META[type];
    const current = (characterState?.[meta.indexKey] as number) ?? 0;
    const total = (spriteCounts?.[meta.countKey] as number) ?? 0;

    if (total === 0) return;

    // 이전 인덱스 계산: 0 ← 1 ← ... ← total-1 (순환, -1로 가지 않음)
    // 현재가 -1(없음)인 경우 마지막으로 설정
    const prev = current <= 0 ? total - 1 : current - 1;

    if (weaponTypes.includes(type as WeaponPartType)) {
      // 무기는 JS_SetRightWeapon/JS_SetLeftWeapon 사용
      const method = type === "shield" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
      const weaponTypeName = type.charAt(0).toUpperCase() + type.slice(1);
      callUnity(method, `${weaponTypeName},${prev}`);

      // 로컬 상태 업데이트
      set((state) => ({
        characterState: state.characterState ? {
          ...state.characterState,
          [meta.indexKey]: prev,
        } : null,
      }));
    } else {
      // 일반 파츠는 JS_SetXxx 사용 (0-total 범위만 순환)
      const method = `JS_Set${type.charAt(0).toUpperCase() + type.slice(1)}`;
      callUnity(method, prev.toString());
    }
  },
  // 명시적으로 파츠를 없음(-1) 상태로 설정 (body, eye는 불가)
  clearPart: (type) => {
    const meta = PART_META[type];
    // 필수 파츠는 클리어 불가
    if (meta.required) return;

    const weaponTypes: WeaponPartType[] = ["sword", "shield", "axe", "bow", "wand"];
    const { callUnity } = get();

    if (weaponTypes.includes(type as WeaponPartType)) {
      // 무기는 Clear 메서드 사용 + -1 설정
      // shield는 왼손, 나머지는 오른손
      if (type === "shield") {
        callUnity("JS_ClearLeftWeapon");
      } else {
        callUnity("JS_ClearRightWeapon");
      }

      // 해당 무기 타입 인덱스도 -1로 설정
      const typeName = type.charAt(0).toUpperCase() + type.slice(1);
      const setMethod = type === "shield" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
      callUnity(setMethod, `${typeName},-1`);

      // 로컬 상태 업데이트
      set((state) => ({
        characterState: state.characterState ? {
          ...state.characterState,
          [meta.indexKey]: -1,
        } : null,
      }));
    } else {
      // 일반 파츠는 JS_SetXxx에 -1 전달
      const method = `JS_Set${type.charAt(0).toUpperCase() + type.slice(1)}`;
      callUnity(method, "-1");
    }
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
  clearAll: () => {
    const { callUnity } = get();
    callUnity("JS_ClearAll");
    // Unity ClearAll에서 수염이 빠져있어서 추가로 호출
    callUnity("JS_SetFacehair", "-1");
  },
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
      helmet: "JS_SetHelmetColor",
      back: "JS_SetBackColor",
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

  // 장비 외형 연동 (12슬롯 시스템) - 기존 호환용
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

  // 스프라이트 + 색상 시스템 (새로운 장비 연동)
  setEquipmentSprite: (slot, sprite) => {
    const { callUnity, isUnityLoaded, setWeaponSprite } = get();
    if (!isUnityLoaded) return;

    // 스프라이트가 없으면 해제
    if (!sprite) {
      // 슬롯에 따라 적절한 해제 호출
      const clearMethodMap: Partial<Record<EquipmentSlot, string>> = {
        mainHand: "JS_ClearRightWeapon",
        offHand: "JS_ClearLeftWeapon",
        armor: "JS_SetArmor",
        cloth: "JS_SetCloth",
        pants: "JS_SetPant",
        helmet: "JS_SetHelmet",
      };
      const method = clearMethodMap[slot];
      if (method) {
        if (slot === "mainHand" || slot === "offHand") {
          callUnity(method);
        } else {
          callUnity(method, "-1");
        }
      }
      return;
    }

    // 스프라이트 카테고리에 따라 처리
    const { category, index, color } = sprite;

    // 무기 카테고리인 경우
    if (["sword", "shield", "axe", "bow", "wand"].includes(category)) {
      setWeaponSprite(category, index, color);
      return;
    }

    // 방어구 카테고리인 경우
    const armorMethodMap: Record<string, string> = {
      armor: "JS_SetArmor",
      cloth: "JS_SetCloth",
      helmet: "JS_SetHelmet",
      pant: "JS_SetPant",
    };

    const method = armorMethodMap[category];
    if (method) {
      callUnity(method, index.toString());
      // 색상 적용 (색상이 있으면)
      if (color) {
        const colorMethodMap: Record<string, string> = {
          armor: "JS_SetArmorColor",
          cloth: "JS_SetClothColor",
          pant: "JS_SetPantColor",
        };
        const colorMethod = colorMethodMap[category];
        if (colorMethod) {
          callUnity(colorMethod, color.replace("#", ""));
        }
      }
    }
  },

  // 무기 스프라이트 설정 (카테고리 + 인덱스 + 색상)
  setWeaponSprite: (category, index, color) => {
    const { callUnity, isUnityLoaded } = get();
    if (!isUnityLoaded) return;

    // 무기 타입에 따른 Unity 메서드
    const methodMap: Record<string, { setIndex: string; setColor?: string; hand: "left" | "right" }> = {
      sword: { setIndex: "JS_SetSword", setColor: "JS_SetSwordColor", hand: "right" },
      axe: { setIndex: "JS_SetAxe", setColor: "JS_SetAxeColor", hand: "right" },
      bow: { setIndex: "JS_SetBow", setColor: "JS_SetBowColor", hand: "right" },
      wand: { setIndex: "JS_SetWand", setColor: "JS_SetWandColor", hand: "right" },
      shield: { setIndex: "JS_SetShield", setColor: "JS_SetShieldColor", hand: "left" },
    };

    const config = methodMap[category];
    if (!config) return;

    // 스프라이트 인덱스 설정
    callUnity(config.setIndex, index.toString());

    // 색상 설정 (색상이 있으면)
    if (color && config.setColor) {
      callUnity(config.setColor, color.replace("#", ""));
    }
  },

  // 무기 해제
  clearWeapon: (hand) => {
    const { callUnity, isUnityLoaded } = get();
    if (!isUnityLoaded) return;

    if (hand === "left" || hand === "both") {
      callUnity("JS_ClearLeftWeapon");
    }
    if (hand === "right" || hand === "both") {
      callUnity("JS_ClearRightWeapon");
    }
  },

  // 손별 무기 조작
  setHandWeaponType: (hand, weaponType) => {
    const stateKey = hand === "left" ? "leftHandWeapon" : "rightHandWeapon";
    const { callUnity, isUnityLoaded } = get();
    const currentWeapon = get()[stateKey];

    // 같은 무기 타입이면 무시
    if (currentWeapon.weaponType === weaponType) return;

    // 먼저 해당 손의 기존 무기 해제 (모든 무기 타입 클리어)
    if (isUnityLoaded && currentWeapon.weaponType) {
      // 기존 무기 타입을 -1로 설정하여 해제
      const method = hand === "left" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
      const oldTypeName = currentWeapon.weaponType.charAt(0).toUpperCase() + currentWeapon.weaponType.slice(1);
      callUnity(method, `${oldTypeName},-1`);
    }

    // 상태 업데이트
    set({ [stateKey]: { weaponType, index: weaponType ? 0 : -1 } });

    // 새 무기 설정 (약간의 딜레이로 Unity가 처리할 시간 확보)
    if (isUnityLoaded && weaponType) {
      setTimeout(() => {
        const method = hand === "left" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
        const typeName = weaponType.charAt(0).toUpperCase() + weaponType.slice(1);
        callUnity(method, `${typeName},0`);
      }, 50);
    }
  },

  nextHandWeapon: (hand) => {
    const { spriteCounts, callUnity, isUnityLoaded } = get();
    const stateKey = hand === "left" ? "leftHandWeapon" : "rightHandWeapon";
    const current = get()[stateKey];

    if (!current.weaponType || !spriteCounts) return;

    const countKey = `${current.weaponType}Count` as keyof SpriteCounts;
    const total = spriteCounts[countKey] as number;
    if (total === 0) return;

    // 0 → 1 → ... → total-1 → 0 순환 (-1로 가지 않음)
    // 현재가 -1(없음)인 경우 0으로 설정
    const nextIndex = current.index < 0 ? 0 : (current.index + 1) % total;
    set({ [stateKey]: { ...current, index: nextIndex } });

    if (isUnityLoaded) {
      const method = hand === "left" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
      const typeName = current.weaponType.charAt(0).toUpperCase() + current.weaponType.slice(1);
      callUnity(method, `${typeName},${nextIndex}`);
    }
  },

  prevHandWeapon: (hand) => {
    const { spriteCounts, callUnity, isUnityLoaded } = get();
    const stateKey = hand === "left" ? "leftHandWeapon" : "rightHandWeapon";
    const current = get()[stateKey];

    if (!current.weaponType || !spriteCounts) return;

    const countKey = `${current.weaponType}Count` as keyof SpriteCounts;
    const total = spriteCounts[countKey] as number;
    if (total === 0) return;

    // 0 ← 1 ← ... ← total-1 순환 (-1로 가지 않음)
    // 현재가 -1(없음)인 경우 마지막으로 설정
    const prevIndex = current.index <= 0 ? total - 1 : current.index - 1;
    set({ [stateKey]: { ...current, index: prevIndex } });

    if (isUnityLoaded) {
      const method = hand === "left" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
      const typeName = current.weaponType.charAt(0).toUpperCase() + current.weaponType.slice(1);
      callUnity(method, `${typeName},${prevIndex}`);
    }
  },

  clearHandWeapon: (hand) => {
    const stateKey = hand === "left" ? "leftHandWeapon" : "rightHandWeapon";
    const currentWeapon = get()[stateKey];

    const { callUnity, isUnityLoaded } = get();
    if (isUnityLoaded && currentWeapon.weaponType) {
      // 먼저 무기 타입을 -1로 설정해서 Unity에서 무기 해제
      const setMethod = hand === "left" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon";
      const typeName = currentWeapon.weaponType.charAt(0).toUpperCase() + currentWeapon.weaponType.slice(1);
      callUnity(setMethod, `${typeName},-1`);

      // 그 다음 Clear 메서드 호출
      const clearMethod = hand === "left" ? "JS_ClearLeftWeapon" : "JS_ClearRightWeapon";
      callUnity(clearMethod);
    }

    set({ [stateKey]: { weaponType: null, index: -1 } });
  },

  getHandWeaponName: (hand) => {
    const { spriteNames } = get();
    const stateKey = hand === "left" ? "leftHandWeapon" : "rightHandWeapon";
    const current = get()[stateKey];

    if (!current.weaponType || current.index < 0 || !spriteNames) {
      return "";
    }

    const namesKey = `${current.weaponType}Names` as keyof SpriteNames;
    const names = spriteNames[namesKey] as string[];
    return names?.[current.index] ?? "";
  },

  // Computed
  getPartInfo: (type) => {
    const { characterState, spriteCounts, spriteNames } = get();
    const meta = PART_META[type];
    // body 기본값은 11(12번 종족), 나머지 필수 파츠는 0, 선택 파츠는 -1
    const defaultValue = type === "body" ? 11 : (meta.required ? 0 : -1);
    const current = (characterState?.[meta.indexKey] as number) ?? defaultValue;
    const total = (spriteCounts?.[meta.countKey] as number) ?? 0;

    // 파트 이름 가져오기
    let name = "";
    if (spriteNames && current >= 0) {
      const namesKey = `${type}Names` as keyof SpriteNames;
      const names = spriteNames[namesKey];
      if (names) {
        name = names[current] ?? "";
      }
    }

    // 색상 적용 가능 여부
    const hasColor = !!meta.colorKey;

    return { label: meta.label, current, total, name, hasColor };
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
  const meta = PART_META[type];

  return {
    ...info,
    // 필수 파츠 여부 (body, eye는 클리어 불가)
    isRequired: meta.required,
    next: () => store.nextPart(type),
    prev: () => store.prevPart(type),
    // 명시적으로 없음(-1) 상태로 설정 (필수 파츠는 동작 안함)
    clear: () => store.clearPart(type),
    setColor: (hex: string) => {
      // 색상 적용 가능한 파츠만
      if (meta.colorKey) {
        store.setColor(type as "body" | "eye" | "hair" | "facehair" | "cloth" | "armor" | "pant" | "helmet" | "back", hex);
      }
    },
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

// 무기 색상 훅
export function useWeaponColor() {
  const store = useAppearanceStore();

  return {
    color: store.selectedColor,
    setColor: store.setSelectedColor,
    applyTo: (target: WeaponPartType) => {
      const { callUnity, selectedColor } = store;
      const hex = selectedColor.replace("#", "");
      const methodMap: Record<WeaponPartType, string> = {
        sword: "JS_SetSwordColor",
        shield: "JS_SetShieldColor",
        axe: "JS_SetAxeColor",
        bow: "JS_SetBowColor",
        wand: "JS_SetWandColor",
      };
      callUnity(methodMap[target], hex);
    },
  };
}

// 무기 해제 훅
export function useWeaponActions() {
  const store = useAppearanceStore();

  return {
    clearLeft: () => store.clearWeapon("left"),
    clearRight: () => store.clearWeapon("right"),
    clearAll: () => store.clearWeapon("both"),
  };
}

// 손별 무기 훅
export function useHandWeapon(hand: HandType) {
  const store = useAppearanceStore();
  const spriteCounts = store.spriteCounts;
  const handState = hand === "left" ? store.leftHandWeapon : store.rightHandWeapon;

  const getTotal = () => {
    if (!handState.weaponType || !spriteCounts) return 0;
    const countKey = `${handState.weaponType}Count` as keyof SpriteCounts;
    return (spriteCounts[countKey] as number) ?? 0;
  };

  return {
    hand,
    weaponType: handState.weaponType,
    index: handState.index,
    total: getTotal(),
    name: store.getHandWeaponName(hand),
    setWeaponType: (type: WeaponPartType | null) => store.setHandWeaponType(hand, type),
    next: () => store.nextHandWeapon(hand),
    prev: () => store.prevHandWeapon(hand),
    clear: () => store.clearHandWeapon(hand),
  };
}
