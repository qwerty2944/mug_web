import { create } from "zustand";

// ============ 타입 정의 ============

export type MessageType = "normal" | "whisper" | "system";

export interface ChatMessage {
  id: string;
  mapId: string;
  senderId: string;
  senderName: string;
  messageType: MessageType;
  recipientId?: string;
  recipientName?: string;
  content: string;
  createdAt: string;
}

interface ChatState {
  // 상태
  messages: ChatMessage[];
  isLoading: boolean;
  lastWhisperFrom: string | null; // 마지막 귓말 보낸 사람 (답장용)

  // 액션
  addMessage: (message: ChatMessage) => void;
  addMessages: (messages: ChatMessage[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setLastWhisperFrom: (name: string | null) => void;
  clearMessages: () => void;
}

// ============ 상수 ============

const MAX_MESSAGES = 100; // 최대 메시지 수

// ============ 스토어 ============

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  lastWhisperFrom: null,

  addMessage: (message) => {
    const { messages } = get();
    const newMessages = [...messages, message];

    // 최대 메시지 수 제한
    if (newMessages.length > MAX_MESSAGES) {
      newMessages.shift();
    }

    set({ messages: newMessages });

    // 귓말이면 답장용으로 저장
    if (message.messageType === "whisper" && message.recipientId) {
      set({ lastWhisperFrom: message.senderName });
    }
  },

  addMessages: (newMessages) => {
    const { messages } = get();
    const combined = [...newMessages, ...messages];

    // 최대 메시지 수 제한
    const limited = combined.slice(0, MAX_MESSAGES);

    set({ messages: limited });
  },

  setMessages: (messages) => set({ messages }),

  setLoading: (loading) => set({ isLoading: loading }),

  setLastWhisperFrom: (name) => set({ lastWhisperFrom: name }),

  clearMessages: () => set({ messages: [], lastWhisperFrom: null }),
}));

// ============ 유틸리티 ============

/**
 * 채팅 명령어 파싱
 * /w 닉네임 메시지 - 귓말
 * /r 메시지 - 마지막 귓말 상대에게 답장
 */
export function parseChatCommand(input: string, lastWhisperFrom: string | null): {
  type: MessageType;
  recipient?: string;
  content: string;
} | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 귓말 명령어: /w 닉네임 메시지
  const whisperMatch = trimmed.match(/^\/w\s+(\S+)\s+(.+)$/);
  if (whisperMatch) {
    return {
      type: "whisper",
      recipient: whisperMatch[1],
      content: whisperMatch[2],
    };
  }

  // 답장 명령어: /r 메시지
  const replyMatch = trimmed.match(/^\/r\s+(.+)$/);
  if (replyMatch && lastWhisperFrom) {
    return {
      type: "whisper",
      recipient: lastWhisperFrom,
      content: replyMatch[1],
    };
  }

  // 일반 메시지
  return {
    type: "normal",
    content: trimmed,
  };
}
