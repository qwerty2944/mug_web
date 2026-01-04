"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "../model";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatBoxProps {
  userId: string;
  onSend: (message: string) => void;
  isConnected: boolean;
}

export function ChatBox({ userId, onSend, isConnected }: ChatBoxProps) {
  const { messages, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* 헤더 */}
      <div className="flex-none px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">💬 채팅</span>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            isConnected
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isConnected ? "연결됨" : "연결 중..."}
        </span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 min-h-0">
        {isLoading ? (
          <div className="text-center text-gray-500 text-sm py-4">
            메시지 로딩 중...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            아직 메시지가 없습니다.
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
