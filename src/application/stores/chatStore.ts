import { create } from "zustand";
import type { ChatMessage, MessageType } from "@/entities/chat";

// Re-export for backward compatibility
export type { ChatMessage, MessageType };

interface ChatState {
  // 상태
  messages: ChatMessage[];
  lastWhisperFrom: string | null; // 마지막 귓말 보낸 사람 (답장용)

  // 액션
  addMessage: (message: ChatMessage) => void;
  addMessages: (messages: ChatMessage[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLastWhisperFrom: (name: string | null) => void;
  clearMessages: () => void;
  // 캐싱
  loadFromCache: (mapId: string) => ChatMessage[];
  saveToCache: (mapId: string) => void;
}

// ============ 상수 ============

const MAX_MESSAGES = 100; // 최대 메시지 수
const CACHE_KEY_PREFIX = "chat_cache_";
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30분

// ============ 캐시 유틸리티 ============

interface CachedData {
  messages: ChatMessage[];
  timestamp: number;
}

function getCacheKey(mapId: string): string {
  return `${CACHE_KEY_PREFIX}${mapId}`;
}

function getFromStorage(mapId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const key = getCacheKey(mapId);
    const cached = sessionStorage.getItem(key);
    if (!cached) return [];

    const data: CachedData = JSON.parse(cached);

    // 만료 체크
    if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
      sessionStorage.removeItem(key);
      return [];
    }

    return data.messages;
  } catch {
    return [];
  }
}

function saveToStorage(mapId: string, messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    const key = getCacheKey(mapId);
    const data: CachedData = {
      messages: messages.slice(0, MAX_MESSAGES),
      timestamp: Date.now(),
    };
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // 스토리지 용량 초과 시 무시
  }
}

// ============ 스토어 ============

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  lastWhisperFrom: null,

  addMessage: (message) => {
    const { messages } = get();

    // 중복 체크
    if (messages.some(m => m.id === message.id)) return;

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

    // 중복 제거 후 병합
    const existingIds = new Set(messages.map(m => m.id));
    const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
    const combined = [...uniqueNew, ...messages];

    // 시간순 정렬 후 최대 메시지 수 제한
    combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const limited = combined.slice(-MAX_MESSAGES);

    set({ messages: limited });
  },

  setMessages: (messages) => set({ messages }),

  setLastWhisperFrom: (name) => set({ lastWhisperFrom: name }),

  clearMessages: () => set({ messages: [], lastWhisperFrom: null }),

  // 캐시에서 로드 (즉시 표시용)
  loadFromCache: (mapId) => {
    const cached = getFromStorage(mapId);
    if (cached.length > 0) {
      set({ messages: cached });
    }
    return cached;
  },

  // 캐시에 저장
  saveToCache: (mapId) => {
    const { messages } = get();
    // system 메시지 제외하고 저장 (입장/퇴장 메시지 제외)
    const toCache = messages.filter(m => m.messageType !== "system");
    saveToStorage(mapId, toCache);
  },
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
