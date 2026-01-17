// ============ 테마 정의 ============

import type { TerrainType } from "@/entities/map";

export interface Theme {
  id: string;
  name: string;
  description: string;
  terrain: TerrainType;  // 연결된 지형
  colors: {
    // 주요 색상
    primary: string;
    primaryDim: string;
    primaryMuted: string;

    // 텍스트
    text: string;
    textDim: string;
    textMuted: string;

    // 배경
    bg: string;
    bgDark: string;
    bgLight: string;

    // 보더
    border: string;
    borderDim: string;

    // 상태
    success: string;
    error: string;
    warning: string;
  };
}

export const THEMES: Record<string, Theme> = {
  // ============ 마을/안전 지역 ============
  candlelight_inn: {
    id: "candlelight_inn",
    name: "촛불 여관",
    description: "따뜻한 불빛이 감도는 안식처",
    terrain: "village",
    colors: {
      primary: "#f59e0b",
      primaryDim: "#92400e",
      primaryMuted: "#78350f",
      text: "#fef3c7",
      textDim: "#d97706",
      textMuted: "#b45309",
      bg: "rgba(20,10,5,0.92)",
      bgDark: "rgba(10,5,0,0.6)",
      bgLight: "rgba(146,64,14,0.25)",
      border: "#78350f",
      borderDim: "rgba(120,53,15,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  golden_market: {
    id: "golden_market",
    name: "황금 시장",
    description: "번화한 상인들의 거리",
    terrain: "market",
    colors: {
      primary: "#eab308",
      primaryDim: "#a16207",
      primaryMuted: "#854d0e",
      text: "#fef9c3",
      textDim: "#ca8a04",
      textMuted: "#a16207",
      bg: "rgba(25,15,5,0.9)",
      bgDark: "rgba(15,8,0,0.55)",
      bgLight: "rgba(161,98,7,0.2)",
      border: "#854d0e",
      borderDim: "rgba(133,77,14,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#fbbf24",
    },
  },

  knights_ground: {
    id: "knights_ground",
    name: "기사단 훈련장",
    description: "강철과 땀이 부딪히는 수련의 장",
    terrain: "training",
    colors: {
      primary: "#64748b",
      primaryDim: "#475569",
      primaryMuted: "#334155",
      text: "#e2e8f0",
      textDim: "#94a3b8",
      textMuted: "#64748b",
      bg: "rgba(15,20,25,0.92)",
      bgDark: "rgba(5,10,15,0.6)",
      bgLight: "rgba(71,85,105,0.25)",
      border: "#334155",
      borderDim: "rgba(51,65,85,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  // ============ 숲 지역 ============
  elven_grove: {
    id: "elven_grove",
    name: "엘프 숲",
    description: "신비로운 녹색 빛이 감도는 숲",
    terrain: "forest",
    colors: {
      primary: "#22c55e",
      primaryDim: "#166534",
      primaryMuted: "#14532d",
      text: "#dcfce7",
      textDim: "#16a34a",
      textMuted: "#15803d",
      bg: "rgba(5,15,10,0.92)",
      bgDark: "rgba(0,10,5,0.6)",
      bgLight: "rgba(22,101,52,0.25)",
      border: "#14532d",
      borderDim: "rgba(20,83,45,0.5)",
      success: "#4ade80",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  darkwood: {
    id: "darkwood",
    name: "어둠의 숲",
    description: "햇빛이 닿지 않는 깊은 숲",
    terrain: "deep_forest",
    colors: {
      primary: "#059669",
      primaryDim: "#065f46",
      primaryMuted: "#064e3b",
      text: "#a7f3d0",
      textDim: "#10b981",
      textMuted: "#047857",
      bg: "rgba(3,10,8,0.95)",
      bgDark: "rgba(0,5,3,0.7)",
      bgLight: "rgba(6,95,70,0.2)",
      border: "#064e3b",
      borderDim: "rgba(6,78,59,0.5)",
      success: "#34d399",
      error: "#f87171",
      warning: "#fbbf24",
    },
  },

  // ============ 늪/독 지역 ============
  venomous_mire: {
    id: "venomous_mire",
    name: "독안개 늪",
    description: "독기가 피어오르는 저주받은 늪",
    terrain: "swamp",
    colors: {
      primary: "#84cc16",
      primaryDim: "#4d7c0f",
      primaryMuted: "#365314",
      text: "#ecfccb",
      textDim: "#a3e635",
      textMuted: "#65a30d",
      bg: "rgba(10,15,5,0.94)",
      bgDark: "rgba(5,10,0,0.65)",
      bgLight: "rgba(77,124,15,0.2)",
      border: "#365314",
      borderDim: "rgba(54,83,20,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#facc15",
    },
  },

  // ============ 신비/유적 지역 ============
  ancient_temple: {
    id: "ancient_temple",
    name: "고대 신전",
    description: "잊혀진 신들의 성역",
    terrain: "ruins",
    colors: {
      primary: "#a855f7",
      primaryDim: "#6b21a8",
      primaryMuted: "#581c87",
      text: "#f3e8ff",
      textDim: "#9333ea",
      textMuted: "#7e22ce",
      bg: "rgba(15,10,20,0.92)",
      bgDark: "rgba(8,5,12,0.6)",
      bgLight: "rgba(107,33,168,0.25)",
      border: "#581c87",
      borderDim: "rgba(88,28,135,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  arcane_sanctum: {
    id: "arcane_sanctum",
    name: "비전 성소",
    description: "마법의 힘이 응집된 성역",
    terrain: "temple",
    colors: {
      primary: "#06b6d4",
      primaryDim: "#155e75",
      primaryMuted: "#164e63",
      text: "#cffafe",
      textDim: "#0891b2",
      textMuted: "#0e7490",
      bg: "rgba(8,12,18,0.92)",
      bgDark: "rgba(4,6,12,0.6)",
      bgLight: "rgba(21,94,117,0.25)",
      border: "#164e63",
      borderDim: "rgba(22,78,99,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  // ============ 전투/위험 지역 ============
  blood_arena: {
    id: "blood_arena",
    name: "피의 결투장",
    description: "영광을 위해 피를 흘리는 곳",
    terrain: "arena",
    colors: {
      primary: "#ef4444",
      primaryDim: "#991b1b",
      primaryMuted: "#7f1d1d",
      text: "#fee2e2",
      textDim: "#dc2626",
      textMuted: "#b91c1c",
      bg: "rgba(20,8,8,0.94)",
      bgDark: "rgba(12,4,4,0.65)",
      bgLight: "rgba(153,27,27,0.25)",
      border: "#7f1d1d",
      borderDim: "rgba(127,29,29,0.5)",
      success: "#22c55e",
      error: "#fca5a5",
      warning: "#eab308",
    },
  },

  // ============ 동굴/지하 지역 ============
  shadow_cavern: {
    id: "shadow_cavern",
    name: "그림자 동굴",
    description: "끝없는 어둠이 지배하는 지하",
    terrain: "cave",
    colors: {
      primary: "#6366f1",
      primaryDim: "#4338ca",
      primaryMuted: "#3730a3",
      text: "#e0e7ff",
      textDim: "#818cf8",
      textMuted: "#6366f1",
      bg: "rgba(8,8,18,0.95)",
      bgDark: "rgba(4,4,12,0.7)",
      bgLight: "rgba(67,56,202,0.2)",
      border: "#3730a3",
      borderDim: "rgba(55,48,163,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  undead_crypt: {
    id: "undead_crypt",
    name: "망자의 지하묘",
    description: "죽은 자들이 잠들지 못하는 곳",
    terrain: "crypt",
    colors: {
      primary: "#8b5cf6",
      primaryDim: "#5b21b6",
      primaryMuted: "#4c1d95",
      text: "#ede9fe",
      textDim: "#a78bfa",
      textMuted: "#7c3aed",
      bg: "rgba(12,8,18,0.95)",
      bgDark: "rgba(6,4,12,0.7)",
      bgLight: "rgba(91,33,182,0.2)",
      border: "#4c1d95",
      borderDim: "rgba(76,29,149,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  // ============ 극한 환경 ============
  frozen_wastes: {
    id: "frozen_wastes",
    name: "얼어붙은 황무지",
    description: "모든 것이 얼어붙는 극한의 땅",
    terrain: "glacier",
    colors: {
      primary: "#38bdf8",
      primaryDim: "#0369a1",
      primaryMuted: "#075985",
      text: "#e0f2fe",
      textDim: "#0ea5e9",
      textMuted: "#0284c7",
      bg: "rgba(8,15,20,0.92)",
      bgDark: "rgba(4,10,15,0.6)",
      bgLight: "rgba(3,105,161,0.2)",
      border: "#075985",
      borderDim: "rgba(7,89,133,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },

  infernal_pit: {
    id: "infernal_pit",
    name: "지옥의 화산",
    description: "불과 유황이 끓어오르는 지옥",
    terrain: "volcano",
    colors: {
      primary: "#f97316",
      primaryDim: "#c2410c",
      primaryMuted: "#9a3412",
      text: "#ffedd5",
      textDim: "#ea580c",
      textMuted: "#c2410c",
      bg: "rgba(20,10,5,0.94)",
      bgDark: "rgba(15,5,0,0.65)",
      bgLight: "rgba(194,65,12,0.25)",
      border: "#9a3412",
      borderDim: "rgba(154,52,18,0.5)",
      success: "#22c55e",
      error: "#fca5a5",
      warning: "#fbbf24",
    },
  },

  storm_plains: {
    id: "storm_plains",
    name: "폭풍 평원",
    description: "끊임없는 번개가 치는 황야",
    terrain: "storm_plains",
    colors: {
      primary: "#facc15",
      primaryDim: "#a16207",
      primaryMuted: "#713f12",
      text: "#fef9c3",
      textDim: "#eab308",
      textMuted: "#ca8a04",
      bg: "rgba(15,15,20,0.92)",
      bgDark: "rgba(8,8,12,0.6)",
      bgLight: "rgba(161,98,7,0.2)",
      border: "#713f12",
      borderDim: "rgba(113,63,18,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#fde047",
    },
  },
};

// ============ 지형 → 테마 매핑 ============

export const TERRAIN_THEME_MAP: Record<TerrainType, string> = {
  village: "candlelight_inn",
  market: "golden_market",
  training: "knights_ground",
  forest: "elven_grove",
  deep_forest: "darkwood",
  swamp: "venomous_mire",
  ruins: "ancient_temple",
  temple: "arcane_sanctum",
  arena: "blood_arena",
  cave: "shadow_cavern",
  crypt: "undead_crypt",
  glacier: "frozen_wastes",
  volcano: "infernal_pit",
  storm_plains: "storm_plains",
};

// ============ 기본값 ============

export const DEFAULT_THEME = "candlelight_inn";
export const DEFAULT_TERRAIN: TerrainType = "village";

/**
 * 지형에 맞는 테마 반환
 */
export function getThemeByTerrain(terrain: TerrainType): Theme {
  const themeId = TERRAIN_THEME_MAP[terrain] || DEFAULT_THEME;
  return THEMES[themeId] || THEMES[DEFAULT_THEME];
}
