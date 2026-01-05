"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth";
import {
  useGameStore,
  useChatStore,
  useRealtimeChat,
  ChatBox,
  PlayerList,
  MapSelector,
} from "@/features/game";
import {
  useProfile,
  getMainCharacter,
  getStaminaPercent,
} from "@/entities/user";
import {
  useMaps,
  getMapById,
  getMapDisplayName,
} from "@/entities/map";
import { useThemeStore } from "@/shared/config";
import { ThemeSettingsModal } from "@/shared/ui";

export default function GamePage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { session, signOut } = useAuthStore();
  const { currentMap, setCurrentMap, isConnected, setMyCharacterName, myCharacterName } =
    useGameStore();

  // React Query로 서버 상태 관리
  const { data: profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const { data: maps = [] } = useMaps();

  // 로컬 UI 상태
  const [mapId, setMapId] = useState("town_square");
  const [showThemeModal, setShowThemeModal] = useState(false);

  const mainCharacter = getMainCharacter(profile);
  const staminaPercent = getStaminaPercent(profile);

  // 캐릭터 정보 로드
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    if (profile && !profileLoading) {
      if (!profile.characters?.length) {
        router.push("/character-create");
        return;
      }

      const main = getMainCharacter(profile);
      if (main) {
        setMyCharacterName(main.name);
      }
    }
  }, [session, profile, profileLoading, router, setMyCharacterName]);

  // 맵 로드 후 현재 맵 설정
  useEffect(() => {
    if (maps.length > 0 && !currentMap) {
      const startMap = getMapById(maps, "town_square");
      if (startMap) {
        setCurrentMap({
          id: startMap.id,
          name: getMapDisplayName(startMap),
          description: startMap.descriptionKo || "",
        });
      }
    }
  }, [maps, currentMap, setCurrentMap]);

  const { sendMessage } = useRealtimeChat({
    mapId,
    userId: session?.user?.id || "",
    characterName: myCharacterName,
  });

  const handleMapChange = (newMapId: string) => {
    const newMap = getMapById(maps, newMapId);
    if (newMap) {
      setMapId(newMapId);
      setCurrentMap({
        id: newMap.id,
        name: getMapDisplayName(newMap),
        description: newMap.descriptionKo || "",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (profileLoading || !profile) {
    return (
      <div
        className="h-dvh w-full flex items-center justify-center"
        style={{ background: theme.colors.bg }}
      >
        <div className="text-center">
          <div
            className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: theme.colors.primary, borderTopColor: "transparent" }}
          />
          <p className="font-mono" style={{ color: theme.colors.textMuted }}>
            게임 로딩 중...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id || !myCharacterName) {
    return null;
  }

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden" style={{ background: theme.colors.bg }}>
      {/* 피로도 게이지 (상단 바) */}
      <div className="flex-none h-1.5" style={{ background: theme.colors.bgDark }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${staminaPercent}%`,
            background:
              staminaPercent > 50
                ? theme.colors.success
                : staminaPercent > 20
                ? theme.colors.warning
                : theme.colors.error,
          }}
        />
      </div>

      {/* 헤더 */}
      <header
        className="flex-none px-3 py-2 border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        {/* 피로도 텍스트 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: theme.colors.textMuted }}>
            <span>피로도</span>
            <span style={{ color: staminaPercent <= 20 ? theme.colors.error : theme.colors.textDim }}>
              {profile.stamina} / {profile.maxStamina}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* 테마 버튼 */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1 text-xs font-mono transition-colors"
              style={{ color: theme.colors.textMuted }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: theme.colors.primary }}
              />
              테마
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono transition-colors"
              style={{ color: theme.colors.textMuted }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 메인 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {getMapById(maps, mapId)?.icon || "🏠"}
            </span>
            <div>
              <h1 className="text-lg font-bold font-mono" style={{ color: theme.colors.text }}>
                {currentMap?.name || "시작 마을"}
              </h1>
              <p className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                {currentMap?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 상태창 링크 */}
            <Link
              href="/game/status"
              className="flex items-center gap-2 px-3 py-1.5 transition-colors"
              style={{
                background: theme.colors.bgDark,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
              }}
            >
              <span className="text-sm">👤</span>
              <span className="text-sm font-mono font-medium">{myCharacterName}</span>
              <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                Lv.{profile.level}
              </span>
            </Link>
            {/* 재화 표시 */}
            <div className="hidden sm:flex items-center gap-3 text-sm font-mono">
              <span style={{ color: theme.colors.warning }}>💰 {profile.gold.toLocaleString()}</span>
              <span style={{ color: theme.colors.primary }}>💎 {profile.gems.toLocaleString()}</span>
            </div>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: isConnected ? theme.colors.success : theme.colors.error }}
            />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-3 gap-3">
        {/* 채팅 영역 (메인) */}
        <div className="flex-1 min-h-0 lg:min-w-0">
          <ChatBox
            userId={session.user.id}
            onSend={sendMessage}
            isConnected={isConnected}
          />
        </div>

        {/* 사이드바 */}
        <div className="flex-none lg:w-64 flex flex-col gap-3">
          {/* 접속 유저 */}
          <PlayerList currentUserId={session.user.id} />

          {/* 맵 이동 */}
          <MapSelector
            currentMapId={mapId}
            onMapChange={handleMapChange}
            playerLevel={profile.level}
          />
        </div>
      </div>

      {/* 테마 설정 모달 */}
      <ThemeSettingsModal open={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </div>
  );
}
