"use client";

import { create } from "zustand";
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "@/shared/config/themes";

interface ThemeState {
  themeId: string;
  theme: Theme;
  setTheme: (themeId: string) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeId: DEFAULT_THEME,
  theme: THEMES[DEFAULT_THEME],

  setTheme: (themeId) => {
    const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
    set({ themeId, theme });

    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
      // CSS 변수 업데이트
      updateCSSVariables(theme);
    }
  },

  initTheme: () => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const themeId = savedTheme && THEMES[savedTheme] ? savedTheme : DEFAULT_THEME;
    const theme = THEMES[themeId];

    set({ themeId, theme });
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
