// CharacterPanel 위젯이 요구하는 인터페이스
// features와 widgets 모두 이 타입을 사용

export type PartType =
  | "body" | "eye" | "hair" | "cloth"
  | "armor" | "pant" | "helmet" | "back";

export interface PartInfo {
  label: string;
  current: number;
  total: number;
  next: () => void;
  prev: () => void;
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
  applyTo: (target: "hair" | "cloth" | "body" | "armor") => void;
}

export interface CharacterActions {
  randomize: () => void;
  clearAll: () => void;
  resetColors: () => void;
}

// 위젯에 주입할 훅 인터페이스
export interface CharacterPanelHooks {
  usePart: (type: PartType) => PartInfo;
  useAnimation: () => AnimationInfo;
  useColor: () => ColorInfo;
  useActions: () => CharacterActions;
  partTypes: PartType[];
}
