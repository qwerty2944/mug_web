"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/shared/api";
import { useGameStore, useChatStore, parseChatCommand, type OnlineUser } from "@/application/stores";
import { fetchRecentMessages, saveMessage, type ChatMessage } from "@/entities/chat";
import { useMaps, getMapById } from "@/entities/map";
import { updateLocation as updateLocationApi } from "@/features/game/update-location";
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
  const mountedRef = useRef(true);

  const { setOnlineUsers, setConnected } = useGameStore();
  const { data: maps = [] } = useMaps();
  const {
    addMessage,
    addMessages,
    lastWhisperFrom,
    clearMessages,
    loadFromCache,
    saveToCache,
  } = useChatStore();

  // 채팅 히스토리 로드 (캐시 우선)
  const loadHistory = useCallback(async () => {
    // 1. 캐시에서 먼저 로드 (즉시 표시)
    loadFromCache(mapId);

    try {
      // 2. 서버에서 최신 데이터 가져오기
      const messages = await fetchRecentMessages(mapId, 50);

      // 시간순 정렬 (오래된 것 먼저)
      messages.reverse();
      addMessages(messages);

      // 3. 캐시 업데이트
      saveToCache(mapId);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }, [mapId, addMessages, loadFromCache, saveToCache]);

  // 유저 위치 업데이트
  const updateLocation = useCallback(async () => {
    try {
      await updateLocationApi({ userId, characterName, mapId });
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  }, [userId, characterName, mapId]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (input: string): Promise<boolean> => {
      const parsed = parseChatCommand(input, lastWhisperFrom);
      if (!parsed) return false;

      const channel = channelRef.current;
      if (!channel) return false;

      // TODO: 귓속말 크리스탈 체크는 나중에 다시 활성화
      // 현재 Realtime 연결 문제로 임시 비활성화

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
      saveMessage({
        mapId,
        senderId: userId,
        senderName: characterName,
        messageType: parsed.type,
        recipientName: parsed.recipient,
        content: parsed.content,
      })
        .then(() => saveToCache(mapId))
        .catch((error) => console.error("Failed to save message:", error));

      return true;
    },
    [mapId, userId, characterName, lastWhisperFrom, saveToCache, addMessage]
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
    if (!mapId || !userId || !characterName) {
      console.log("[Realtime] Skipping - missing params:", { mapId, userId, characterName });
      return;
    }

    console.log("[Realtime] Starting connection with:", { mapId, userId, characterName });
    mountedRef.current = true;

    // 기존 채널 정리
    if (channelRef.current) {
      console.log("[Realtime] Removing existing channel");
      supabase.removeChannel(channelRef.current);
    }

    clearMessages();

    // Supabase 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Realtime] Session check:", session ? "authenticated" : "anonymous");
    });

    const channel = supabase.channel(`map:${mapId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: userId },
      },
    });

    console.log("[Realtime] Channel created, subscribing...");

    // 일반 채팅 메시지
    channel.on("broadcast", { event: "chat_message" }, ({ payload }) => {
      if (mountedRef.current) {
        addMessage(payload as ChatMessage);
      }
    });

    // 귓말
    channel.on("broadcast", { event: "whisper" }, ({ payload }) => {
      if (!mountedRef.current) return;
      const msg = payload as ChatMessage;
      // 본인에게 온 귓말이거나 본인이 보낸 귓말만 표시
      if (msg.recipientName === characterName || msg.senderId === userId) {
        addMessage(msg);
      }
    });

    // Presence 이벤트
    channel.on("presence", { event: "sync" }, () => {
      if (!mountedRef.current) return;
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
      if (!mountedRef.current) return;
      const name = (newPresences[0] as any)?.characterName;
      if (name && key !== userId) {
        addSystemMessage(`${name}님이 입장했습니다.`);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      if (!mountedRef.current) return;
      const name = (leftPresences[0] as any)?.characterName;
      if (name && key !== userId) {
        addSystemMessage(`${name}님이 퇴장했습니다.`);
      }
    });

    // 구독 시작
    channel.subscribe(async (status, err) => {
      console.log("[Realtime] Channel status:", status, err);

      if (status === "SUBSCRIBED" && mountedRef.current) {
        setConnected(true);

        // Presence 트래킹
        await channel.track({
          userId: userId,
          characterName,
          online_at: new Date().toISOString(),
        });

        // 위치 업데이트 및 히스토리 로드
        await updateLocation();
        await loadHistory();

        if (mountedRef.current) {
          const mapName = getMapById(maps, mapId)?.nameKo || mapId;
          addSystemMessage(`${mapName}에 입장했습니다.`);
        }
      } else if (status === "CHANNEL_ERROR") {
        console.error("[Realtime] Channel error:", err);
        setConnected(false);
      } else if (status === "TIMED_OUT") {
        console.error("[Realtime] Channel timed out");
        setConnected(false);
      }
    });

    channelRef.current = channel;

    // 클린업
    return () => {
      mountedRef.current = false;
      // 떠나기 전 캐시 저장
      saveToCache(mapId);
      channel.untrack();
      supabase.removeChannel(channel);
      setConnected(false);
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, userId, characterName]);

  return {
    sendMessage,
    addSystemMessage,
  };
}
