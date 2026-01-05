"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/shared/config";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <>{children}</>;
}
