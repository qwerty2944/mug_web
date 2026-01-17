"use client";

import { create } from "zustand";
import {
  THEMES,
  DEFAULT_THEME,
  getThemeByTerrain,
  type Theme,
} from "@/shared/config/themes";
import type { TerrainType } from "@/entities/map";

interface ThemeState {
  themeId: string;
  theme: Theme;
  currentTerrain: TerrainType | null;
  setThemeByTerrain: (terrain: TerrainType) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeId: DEFAULT_THEME,
  theme: THEMES[DEFAULT_THEME],
  currentTerrain: null,

  /**
   * 지형에 맞는 테마 자동 설정
   */
  setThemeByTerrain: (terrain: TerrainType) => {
    const theme = getThemeByTerrain(terrain);
    set({ themeId: theme.id, theme, currentTerrain: terrain });

    if (typeof window !== "undefined") {
      updateCSSVariables(theme);
    }
  },

  /**
   * 초기 테마 설정 (기본 마을 테마)
   */
  initTheme: () => {
    if (typeof window === "undefined") return;

    const theme = THEMES[DEFAULT_THEME];
    set({ themeId: DEFAULT_THEME, theme });
    updateCSSVariables(theme);
  },
}));

function updateCSSVariables(theme: Theme) {
  const root = document.documentElement;

  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty("--theme-primary-dim", theme.colors.primaryDim);
  root.style.setProperty("--theme-primary-muted", theme.colors.primaryMuted);
  root.style.setProperty("--theme-text", theme.colors.text);
  root.style.setProperty("--theme-text-dim", theme.colors.textDim);
  root.style.setProperty("--theme-text-muted", theme.colors.textMuted);
  root.style.setProperty("--theme-bg", theme.colors.bg);
  root.style.setProperty("--theme-bg-dark", theme.colors.bgDark);
  root.style.setProperty("--theme-bg-light", theme.colors.bgLight);
  root.style.setProperty("--theme-border", theme.colors.border);
  root.style.setProperty("--theme-border-dim", theme.colors.borderDim);
  root.style.setProperty("--theme-success", theme.colors.success);
  root.style.setProperty("--theme-error", theme.colors.error);
  root.style.setProperty("--theme-warning", theme.colors.warning);
}
