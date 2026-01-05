import { supabase } from "@/shared/api";
import type { ChatMessage } from "../types";

// ============ 채팅 API ============

/**
 * 최근 메시지 조회 (RPC)
 */
export async function fetchRecentMessages(
  mapId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  const { data, error } = await supabase.rpc("get_recent_messages", {
    p_map_id: mapId,
    p_limit: limit,
  });

  if (error) throw error;

  return (data || []).map((msg: any) => ({
    id: msg.id.toString(),
    mapId: msg.map_id,
    senderId: msg.sender_id,
    senderName: msg.sender_name,
    messageType: msg.message_type,
    recipientId: msg.recipient_id,
    recipientName: msg.recipient_name,
    content: msg.content,
    createdAt: msg.created_at,
  }));
}

/**
 * 메시지 저장
 */
export async function saveMessage(message: {
  mapId: string;
  senderId: string;
  senderName: string;
  messageType: string;
  recipientName?: string;
  content: string;
}): Promise<void> {
  const { error } = await supabase.from("chat_messages").insert({
    map_id: message.mapId,
    sender_id: message.senderId,
    sender_name: message.senderName,
    message_type: message.messageType,
    recipient_name: message.recipientName,
    content: message.content,
  });

  if (error) throw error;
}
