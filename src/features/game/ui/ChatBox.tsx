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
  whisperCharges?: number;
  crystalTier?: string | null;
}

export function ChatBox({ userId, onSend, isConnected, whisperCharges = 0, crystalTier }: ChatBoxProps) {
  const { theme } = useThemeStore();
  const { messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasWhisperAbility = whisperCharges > 0;

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
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-medium" style={{ color: theme.colors.text }}>
            💬 채팅
          </span>
          {/* 크리스탈 충전량 표시 */}
          <span
            className="text-xs px-2 py-0.5 font-mono"
            style={{
              background: hasWhisperAbility ? `${theme.colors.primary}20` : `${theme.colors.textMuted}20`,
              color: hasWhisperAbility ? theme.colors.primary : theme.colors.textMuted,
            }}
            title={hasWhisperAbility ? `귓속말 ${whisperCharges}회 가능` : "통신용 크리스탈 필요"}
          >
            🔮 {whisperCharges}
          </span>
        </div>
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

      {/* 크리스탈 없음 경고 */}
      {!hasWhisperAbility && (
        <div
          className="flex-none px-3 py-2 text-xs font-mono flex items-center gap-2"
          style={{
            background: `${theme.colors.warning}15`,
            color: theme.colors.warning,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <span>⚠️</span>
          <span>통신용 크리스탈이 없습니다. 인벤토리에서 크리스탈을 사용해 귓속말을 활성화하세요.</span>
        </div>
      )}

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
