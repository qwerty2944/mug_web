"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/application/stores";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useThemeStore } from "@/shared/config";

interface ChatBoxProps {
  userId: string;
  onSend: (message: string) => void;
  isConnected: boolean;
}

export function ChatBox({ userId, onSend, isConnected }: ChatBoxProps) {
  const { theme } = useThemeStore();
  const { messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="flex-none px-3 py-2 flex items-center justify-between border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <span className="text-sm font-mono font-medium" style={{ color: theme.colors.text }}>
          💬 채팅
        </span>
        <span
          className="text-xs px-2 py-0.5 font-mono"
          style={{
            background: isConnected ? `${theme.colors.success}20` : `${theme.colors.error}20`,
            color: isConnected ? theme.colors.success : theme.colors.error,
          }}
        >
          {isConnected ? "연결됨" : "연결 중..."}
        </span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-sm py-4 font-mono" style={{ color: theme.colors.textMuted }}>
            {isConnected ? "아직 메시지가 없습니다." : "연결 중..."}
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === userId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <ChatInput onSend={onSend} disabled={!isConnected} />
    </div>
  );
}
