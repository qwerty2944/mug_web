// CharacterPanel 위젯이 요구하는 인터페이스
// features와 widgets 모두 이 타입을 사용

export type PartType =
  | "body" | "eye" | "hair" | "facehair" | "cloth"
  | "armor" | "pant" | "helmet" | "back"
  // 무기 파츠 (스프라이트 + 색상 시스템)
  | "sword" | "shield" | "axe" | "bow" | "wand";

// 무기 파츠 타입
export type WeaponPartType = "sword" | "shield" | "axe" | "bow" | "wand";

export interface PartInfo {
  label: string;
  current: number;
  total: number;
  name: string;
  hasColor: boolean;
  isRequired: boolean; // 필수 파츠 여부 (body, eye는 true)
  next: () => void;
  prev: () => void;
  clear: () => void; // 명시적으로 없음(-1) 상태로 설정 (필수 파츠는 동작 안함)
  setColor: (hex: string) => void;
}

export interface AnimationInfo {
  state: string;
  index: number;
  total: number;
  name: string;
  states: string[];
  next: () => void;
  prev: () => void;
  changeState: (state: string) => void;
}

export interface ColorInfo {
  color: string;
  setColor: (color: string) => void;
  applyTo: (target: "hair" | "facehair" | "cloth" | "body" | "armor") => void;
}

// 무기 색상 정보
export interface WeaponColorInfo {
  color: string;
  setColor: (color: string) => void;
  applyTo: (target: WeaponPartType) => void;
}

export interface CharacterActions {
  randomize: () => void;
  randomizeAppearance: () => void;
  randomizeEquipment: () => void;
  clearAll: () => void;
  resetColors: () => void;
}

// 무기 해제 액션
export interface WeaponActions {
  clearLeft: () => void;
  clearRight: () => void;
  clearAll: () => void;
}

// 손별 무기 정보 (왼손/오른손)
export type HandType = "left" | "right";

export interface HandWeaponInfo {
  hand: HandType;
  weaponType: WeaponPartType | null;
  index: number;
  total: number;
  name: string; // 원본 파일명
  setWeaponType: (type: WeaponPartType | null) => void;
  next: () => void;
  prev: () => void;
  clear: () => void;
}

// 위젯에 주입할 훅 인터페이스
export interface CharacterPanelHooks {
  usePart: (type: PartType) => PartInfo;
  useAnimation: () => AnimationInfo;
  useColor: () => ColorInfo;
  useWeaponColor: () => WeaponColorInfo;
  useWeaponActions: () => WeaponActions;
  useActions: () => CharacterActions;
  useHandWeapon?: (hand: HandType) => HandWeaponInfo; // 새로운 손별 무기 훅
  partTypes: PartType[];
  weaponPartTypes: WeaponPartType[];
}
