"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { useThemeStore } from "@/shared/config";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "메시지를 입력하세요... (/w 닉네임 = 귓말)",
}: ChatInputProps) {
  const { theme } = useThemeStore();
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput("");
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div
      className="flex gap-2 p-3 border-t"
      style={{
        background: theme.colors.bgLight,
        borderColor: theme.colors.border,
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 text-sm font-mono focus:outline-none disabled:opacity-50"
        style={{
          background: theme.colors.bgDark,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
        }}
        maxLength={200}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-4 py-2 text-sm font-mono font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: disabled || !input.trim() ? theme.colors.bgDark : theme.colors.primaryDim,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
        }}
      >
        전송
      </button>
    </div>
  );
}
