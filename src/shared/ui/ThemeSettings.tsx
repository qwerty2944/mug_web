"use client";

import { useState } from "react";
import { useThemeStore, THEMES, type Theme } from "@/shared/config";

interface ThemeSettingsProps {
  onClose?: () => void;
}

export function ThemeSettings({ onClose }: ThemeSettingsProps) {
  const { themeId, setTheme, theme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    setTheme(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 font-mono text-sm transition-colors"
        style={{
          color: theme.colors.textDim,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.bgDark,
        }}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ background: theme.colors.primary }}
        />
        <span>{theme.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 z-50 mt-2 w-56 shadow-lg"
            style={{
              background: theme.colors.bg,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="px-3 py-2 font-mono text-xs border-b"
              style={{
                color: theme.colors.textDim,
                borderColor: theme.colors.borderDim,
              }}
            >
              [ 테마 선택 ]
            </div>
            {Object.values(THEMES).map((t: Theme) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
                style={{
                  color: themeId === t.id ? t.colors.primary : theme.colors.text,
                  background: themeId === t.id ? t.colors.bgLight : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (themeId !== t.id) {
                    e.currentTarget.style.background = theme.colors.bgLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (themeId !== t.id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ background: t.colors.primary }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-medium">{t.name}</div>
                  <div
                    className="font-mono text-xs truncate"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {t.description}
                  </div>
                </div>
                {themeId === t.id && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                    style={{ color: t.colors.primary }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 모달 버전
export function ThemeSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { themeId, setTheme, theme } = useThemeStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-sm shadow-2xl"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            background: theme.colors.bgLight,
            borderColor: theme.colors.border,
          }}
        >
          <span className="font-mono font-bold" style={{ color: theme.colors.text }}>
            테마 설정
          </span>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: theme.colors.textMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.colors.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.colors.textMuted)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 테마 목록 */}
        <div className="p-4 space-y-2">
          {Object.values(THEMES).map((t: Theme) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all"
              style={{
                color: theme.colors.text,
                background: themeId === t.id ? t.colors.bgLight : "transparent",
                border: `2px solid ${themeId === t.id ? t.colors.primary : theme.colors.borderDim}`,
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ background: t.colors.primary }}
              />
              <div className="flex-1 text-left">
                <div className="font-mono font-medium">{t.name}</div>
                <div className="font-mono text-xs" style={{ color: theme.colors.textMuted }}>
                  {t.description}
                </div>
              </div>
              {themeId === t.id && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                  style={{ color: t.colors.primary }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
