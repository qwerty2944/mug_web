"use client";

import { useEffect, useState, useMemo } from "react";
import { useThemeStore } from "@/application/stores";
import { useRealtimeGameTime } from "../lib/useRealtimeGameTime";
import type { Period } from "../types";

interface AtmosphericMessages {
  [mapId: string]: {
    [period in Period]: string[];
  };
}

interface AtmosphericTextProps {
  mapId: string;
  className?: string;
}

/**
 * 맵과 시간대에 따른 분위기 메시지를 표시합니다.
 * 시간대가 바뀔 때마다 새로운 랜덤 메시지를 선택합니다.
 */
export function AtmosphericText({ mapId, className = "" }: AtmosphericTextProps) {
  const { theme } = useThemeStore();
  const { gameTime } = useRealtimeGameTime();
  const [messages, setMessages] = useState<AtmosphericMessages | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [fadeIn, setFadeIn] = useState(false);

  // 메시지 데이터 로드
  useEffect(() => {
    fetch("/data/world/atmospheric-messages.json")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages))
      .catch((err) => console.error("Failed to load atmospheric messages:", err));
  }, []);

  // 시간대 변경 시 메시지 업데이트
  useEffect(() => {
    if (!messages || !gameTime) return;

    const mapMessages = messages[mapId];
    const periodMessages = mapMessages?.[gameTime.period];

    if (periodMessages && periodMessages.length > 0) {
      // 페이드 아웃
      setFadeIn(false);

      // 잠시 후 새 메시지 + 페이드 인
      const timeout = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * periodMessages.length);
        setCurrentMessage(periodMessages[randomIndex]);
        setFadeIn(true);
      }, 300);

      return () => clearTimeout(timeout);
    } else {
      // 기본 메시지 (데이터가 없을 경우)
      const defaultMessages: Record<Period, string> = {
        dawn: "새벽 빛이 세계를 깨운다.",
        day: "태양이 높이 떠 있다.",
        dusk: "해가 지평선으로 기울어간다.",
        night: "달빛이 어둠을 비추고 있다.",
      };
      setCurrentMessage(defaultMessages[gameTime.period]);
      setFadeIn(true);
    }
  }, [messages, mapId, gameTime?.period]);

  if (!currentMessage) return null;

  return (
    <div
      className={`text-xs font-mono italic transition-opacity duration-500 ${className}`}
      style={{
        color: theme.colors.textMuted,
        opacity: fadeIn ? 1 : 0,
      }}
    >
      {currentMessage}
    </div>
  );
}
