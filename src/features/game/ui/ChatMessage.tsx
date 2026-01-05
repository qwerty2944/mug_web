"use client";

import type { ChatMessage as ChatMessageType } from "@/application/stores";
import { useThemeStore } from "@/shared/config";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const { theme } = useThemeStore();
  const { messageType, senderName, recipientName, content, createdAt } = message;

  const time = new Date(createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 시스템 메시지
  if (messageType === "system") {
    return (
      <div className="text-center py-1">
        <span
          className="text-xs px-2 py-0.5 font-mono"
          style={{
            background: `${theme.colors.warning}20`,
            color: theme.colors.warning,
          }}
        >
          🔔 {content}
        </span>
      </div>
    );
  }

  // 귓말
  if (messageType === "whisper") {
    const isReceived = !isOwn;
    return (
      <div className="py-1 font-mono" style={{ color: isReceived ? "#f472b6" : "#c084fc" }}>
        <span className="text-xs opacity-60">[{time}]</span>{" "}
        <span className="text-xs">
          {isReceived ? (
            <>🔒 {senderName} → 나</>
          ) : (
            <>🔒 나 → {recipientName}</>
          )}
        </span>
        <span className="ml-1">{content}</span>
      </div>
    );
  }

  // 일반 메시지
  return (
    <div className="py-1 font-mono" style={{ color: theme.colors.text }}>
      <span className="text-xs" style={{ color: theme.colors.textMuted }}>[{time}]</span>{" "}
      <span
        className="font-medium"
        style={{ color: isOwn ? theme.colors.primary : theme.colors.success }}
      >
        {senderName}
      </span>
      <span style={{ color: theme.colors.textMuted }}>:</span>{" "}
      <span>{content}</span>
    </div>
  );
}
