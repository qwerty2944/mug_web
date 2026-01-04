"use client";

import type { ChatMessage as ChatMessageType } from "../model";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const { messageType, senderName, recipientName, content, createdAt } = message;

  const time = new Date(createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 시스템 메시지
  if (messageType === "system") {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
          🔔 {content}
        </span>
      </div>
    );
  }

  // 귓말
  if (messageType === "whisper") {
    const isReceived = !isOwn;
    return (
      <div className={`py-1 ${isReceived ? "text-pink-400" : "text-purple-400"}`}>
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
    <div className={`py-1 ${isOwn ? "text-blue-300" : "text-gray-200"}`}>
      <span className="text-xs text-gray-500">[{time}]</span>{" "}
      <span className={`font-medium ${isOwn ? "text-blue-400" : "text-green-400"}`}>
        {senderName}
      </span>
      <span className="text-gray-400">:</span>{" "}
      <span>{content}</span>
    </div>
  );
}
