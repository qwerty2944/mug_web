// ============ 채팅 메시지 타입 ============

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
