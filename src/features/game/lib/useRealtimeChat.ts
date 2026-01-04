"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/shared/api";
import { useGameStore, useChatStore, parseChatCommand } from "../model";
import type { ChatMessage, OnlineUser } from "../model";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeChatProps {
  mapId: string;
  userId: string;
  characterName: string;
}

export function useRealtimeChat({
  mapId,
  userId,
  characterName,
}: UseRealtimeChatProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const { setOnlineUsers, setConnected } = useGameStore();
  const { addMessage, addMessages, setLoading, lastWhisperFrom, clearMessages } =
    useChatStore();

  // 채팅 히스토리 로드
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_recent_messages", {
        p_map_id: mapId,
        p_limit: 50,
      });

      if (error) throw error;

      if (data) {
        const messages: ChatMessage[] = data.map((msg: any) => ({
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

        // 시간순 정렬 (오래된 것 먼저)
        messages.reverse();
        addMessages(messages);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoading(false);
    }
  }, [mapId, addMessages, setLoading]);

  // 유저 위치 등록
  const registerLocation = useCallback(async () => {
    try {
      await supabase.rpc("upsert_user_location", {
        p_user_id: userId,
        p_character_name: characterName,
        p_map_id: mapId,
      });
    } catch (error) {
      console.error("Failed to register location:", error);
    }
  }, [userId, characterName, mapId]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (input: string) => {
      const parsed = parseChatCommand(input, lastWhisperFrom);
      if (!parsed) return;

      const channel = channelRef.current;
      if (!channel) return;

      const messageId = `${userId}-${Date.now()}`;
      const message: ChatMessage = {
        id: messageId,
        mapId,
        senderId: userId,
        senderName: characterName,
        messageType: parsed.type,
        recipientName: parsed.recipient,
        content: parsed.content,
        createdAt: new Date().toISOString(),
      };

      // 로컬에 먼저 추가 (즉시 표시)
      addMessage(message);

      // 브로드캐스트 전송 (다른 유저에게)
      if (parsed.type === "normal") {
        channel.send({
          type: "broadcast",
          event: "chat_message",
          payload: message,
        });
      } else if (parsed.type === "whisper" && parsed.recipient) {
        channel.send({
          type: "broadcast",
          event: "whisper",
          payload: message,
        });
      }

      // DB에 저장 (비동기)
      supabase
        .from("chat_messages")
        .insert({
          map_id: mapId,
          sender_id: userId,
          sender_name: characterName,
          message_type: parsed.type,
          recipient_name: parsed.recipient,
          content: parsed.content,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to save message:", error);
        });
    },
    [mapId, userId, characterName, lastWhisperFrom]
  );

  // 시스템 메시지 추가
  const addSystemMessage = useCallback(
    (content: string) => {
      addMessage({
        id: `system-${Date.now()}`,
        mapId,
        senderId: "system",
        senderName: "시스템",
        messageType: "system",
        content,
        createdAt: new Date().toISOString(),
      });
    },
    [mapId, addMessage]
  );

  // Realtime 채널 연결
  useEffect(() => {
    if (!mapId || !userId || !characterName) return;

    // 기존 채널 정리
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    clearMessages();

    const channel = supabase.channel(`map:${mapId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: userId },
      },
    });

    // 일반 채팅 메시지
    channel.on("broadcast", { event: "chat_message" }, ({ payload }) => {
      addMessage(payload as ChatMessage);
    });

    // 귓말
    channel.on("broadcast", { event: "whisper" }, ({ payload }) => {
      const msg = payload as ChatMessage;
      // 본인에게 온 귓말이거나 본인이 보낸 귓말만 표시
      if (msg.recipientName === characterName || msg.senderId === userId) {
        addMessage(msg);
      }
    });

    // Presence 이벤트
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users: OnlineUser[] = Object.entries(state).map(
        ([key, presences]) => ({
          userId: key,
          characterName: (presences[0] as any)?.characterName || "Unknown",
        })
      );
      setOnlineUsers(users);
    });

    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      const name = (newPresences[0] as any)?.characterName;
      if (name && key !== userId) {
        addSystemMessage(`${name}님이 입장했습니다.`);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      const name = (leftPresences[0] as any)?.characterName;
      if (name && key !== userId) {
        addSystemMessage(`${name}님이 퇴장했습니다.`);
      }
    });

    // 구독 시작
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setConnected(true);

        // Presence 트래킹
        await channel.track({
          oderId: userId,
          characterName,
          online_at: new Date().toISOString(),
        });

        // 위치 등록 및 히스토리 로드
        await registerLocation();
        await loadHistory();

        addSystemMessage(`${mapId === "starting_village" ? "시작 마을" : mapId}에 입장했습니다.`);
      }
    });

    channelRef.current = channel;

    // 클린업
    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      setConnected(false);
      channelRef.current = null;
    };
  }, [
    mapId,
    userId,
    characterName,
    addMessage,
    addSystemMessage,
    setOnlineUsers,
    setConnected,
    registerLocation,
    loadHistory,
    clearMessages,
  ]);

  return {
    sendMessage,
    addSystemMessage,
  };
}
