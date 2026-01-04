// ============ 테마 정의 ============

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    // 주요 색상
    primary: string;      // 메인 강조색
    primaryDim: string;   // 어두운 메인색
    primaryMuted: string; // 뮤트된 메인색

    // 텍스트
    text: string;         // 기본 텍스트
    textDim: string;      // 어두운 텍스트
    textMuted: string;    // 뮤트된 텍스트

    // 배경
    bg: string;           // 기본 배경
    bgDark: string;       // 어두운 배경
    bgLight: string;      // 밝은 배경

    // 보더
    border: string;       // 기본 보더
    borderDim: string;    // 어두운 보더

    // 상태
    success: string;
    error: string;
    warning: string;
  };
}

export const THEMES: Record<string, Theme> = {
  amber: {
    id: "amber",
    name: "골드",
    description: "클래식 MUD 스타일",
    colors: {
      primary: "#f59e0b",      // amber-500
      primaryDim: "#92400e",   // amber-800
      primaryMuted: "#78350f", // amber-900
      text: "#fef3c7",         // amber-100
      textDim: "#d97706",      // amber-600
      textMuted: "#b45309",    // amber-700
      bg: "rgba(0,0,0,0.8)",
      bgDark: "rgba(0,0,0,0.5)",
      bgLight: "rgba(146,64,14,0.3)", // amber-800/30
      border: "#78350f",       // amber-900
      borderDim: "rgba(120,53,15,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },
  green: {
    id: "green",
    name: "터미널",
    description: "해커 터미널 스타일",
    colors: {
      primary: "#22c55e",      // green-500
      primaryDim: "#166534",   // green-800
      primaryMuted: "#14532d", // green-900
      text: "#dcfce7",         // green-100
      textDim: "#16a34a",      // green-600
      textMuted: "#15803d",    // green-700
      bg: "rgba(0,0,0,0.9)",
      bgDark: "rgba(0,0,0,0.5)",
      bgLight: "rgba(22,101,52,0.3)",
      border: "#14532d",
      borderDim: "rgba(20,83,45,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },
  cyan: {
    id: "cyan",
    name: "사이버",
    description: "사이버펑크 스타일",
    colors: {
      primary: "#06b6d4",      // cyan-500
      primaryDim: "#155e75",   // cyan-800
      primaryMuted: "#164e63", // cyan-900
      text: "#cffafe",         // cyan-100
      textDim: "#0891b2",      // cyan-600
      textMuted: "#0e7490",    // cyan-700
      bg: "rgba(0,0,0,0.85)",
      bgDark: "rgba(0,0,0,0.5)",
      bgLight: "rgba(21,94,117,0.3)",
      border: "#164e63",
      borderDim: "rgba(22,78,99,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },
  purple: {
    id: "purple",
    name: "마법",
    description: "신비로운 마법 스타일",
    colors: {
      primary: "#a855f7",      // purple-500
      primaryDim: "#6b21a8",   // purple-800
      primaryMuted: "#581c87", // purple-900
      text: "#f3e8ff",         // purple-100
      textDim: "#9333ea",      // purple-600
      textMuted: "#7e22ce",    // purple-700
      bg: "rgba(0,0,0,0.85)",
      bgDark: "rgba(0,0,0,0.5)",
      bgLight: "rgba(107,33,168,0.3)",
      border: "#581c87",
      borderDim: "rgba(88,28,135,0.5)",
      success: "#22c55e",
      error: "#ef4444",
      warning: "#eab308",
    },
  },
  red: {
    id: "red",
    name: "지옥",
    description: "다크 지옥 스타일",
    colors: {
      primary: "#ef4444",      // red-500
      primaryDim: "#991b1b",   // red-800
      primaryMuted: "#7f1d1d", // red-900
      text: "#fee2e2",         // red-100
      textDim: "#dc2626",      // red-600
      textMuted: "#b91c1c",    // red-700
      bg: "rgba(0,0,0,0.9)",
      bgDark: "rgba(0,0,0,0.5)",
      bgLight: "rgba(153,27,27,0.3)",
      border: "#7f1d1d",
      borderDim: "rgba(127,29,29,0.5)",
      success: "#22c55e",
      error: "#fca5a5",
      warning: "#eab308",
    },
  },
};

export const DEFAULT_THEME = "amber";
export const THEME_STORAGE_KEY = "mud-theme";
