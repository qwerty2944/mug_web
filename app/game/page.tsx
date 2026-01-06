"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthStore } from "@/features/auth";
import {
  useGameStore,
  useRealtimeChat,
  ChatBox,
  PlayerList,
  MapSelector,
  WorldMapModal,
  MonsterList,
  BattlePanel,
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
import type { Monster } from "@/entities/monster";
import { useProficiencies } from "@/entities/proficiency";
import type { ProficiencyType } from "@/entities/proficiency";
import { useBattleStore, usePvpStore } from "@/application/stores";
import { useStartBattle, useEndBattle } from "@/features/combat";
import { useUpdateLocation } from "@/features/game";
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

  // 로컬 UI 상태 - 프로필에서 마지막 위치 로드
  const [mapId, setMapId] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);

  // 전투 관련
  const { battle } = useBattleStore();
  const { start: startBattle } = useStartBattle({ userId: session?.user?.id });
  const { data: proficiencies } = useProficiencies(session?.user?.id);

  // 맵 이동 (피로도 소모)
  const updateLocation = useUpdateLocation();

  // PvP 관련
  const { declineNotice, setDeclineNotice } = usePvpStore();

  // 결투 거절 알림 표시
  useEffect(() => {
    if (declineNotice) {
      toast(`${declineNotice.targetName}님이 결투를 거절했습니다.`, {
        icon: "⚔️",
        duration: 3000,
      });
      setDeclineNotice(null);
    }
  }, [declineNotice, setDeclineNotice]);

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

  // 프로필에서 마지막 위치 로드
  useEffect(() => {
    if (profile && maps.length > 0 && mapId === null) {
      const savedMapId = profile.currentMapId || "town_square";
      const savedMap = getMapById(maps, savedMapId);
      if (savedMap) {
        setMapId(savedMapId);
        setCurrentMap({
          id: savedMap.id,
          name: getMapDisplayName(savedMap),
          description: savedMap.descriptionKo || "",
        });
      } else {
        // 저장된 맵이 없으면 기본 위치로
        const defaultMap = getMapById(maps, "town_square");
        if (defaultMap) {
          setMapId("town_square");
          setCurrentMap({
            id: defaultMap.id,
            name: getMapDisplayName(defaultMap),
            description: defaultMap.descriptionKo || "",
          });
        }
      }
    }
  }, [profile, maps, mapId, setCurrentMap]);

  const { sendMessage } = useRealtimeChat({
    mapId: mapId || "town_square",
    userId: session?.user?.id || "",
    characterName: myCharacterName,
  });

  const handleMapChange = async (newMapId: string) => {
    const newMap = getMapById(maps, newMapId);
    if (newMap && session?.user?.id && myCharacterName) {
      try {
        // 피로도 소모 + 위치 업데이트
        await updateLocation.mutateAsync({
          userId: session.user.id,
          characterName: myCharacterName,
          mapId: newMapId,
        });

        // 로컬 상태 업데이트
        setMapId(newMapId);
        setCurrentMap({
          id: newMap.id,
          name: getMapDisplayName(newMap),
          description: newMap.descriptionKo || "",
        });
      } catch (error) {
        console.error("Failed to move:", error);
        // 피로도 부족 등의 에러는 useUpdateLocation에서 toast 처리됨
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // 전투 종료 (경험치/골드/레벨업 처리)
  const { endBattle } = useEndBattle({
    userId: session?.user?.id,
    onVictory: (rewards) => {
      console.log("[Battle] Victory! Rewards:", rewards);
    },
    onDefeat: () => {
      console.log("[Battle] Defeat...");
    },
    onFled: () => {
      console.log("[Battle] Fled!");
    },
  });

  // 전투 시작
  const handleSelectMonster = useCallback(
    (monster: Monster) => {
      if (!profile || battle.isInBattle) return;

      // 기본 HP 계산 (레벨 기반)
      const playerHp = 50 + profile.level * 10;
      // 기본 MP 계산 (레벨 + INT 기반)
      const baseInt = mainCharacter?.stats?.int ?? 10;
      const playerMp = 30 + profile.level * 5 + Math.floor(baseInt * 0.5);

      startBattle(monster, playerHp, playerHp, playerMp, playerMp);
    },
    [profile, battle.isInBattle, startBattle, mainCharacter]
  );

  // 전투 승리 - endBattle이 보상 지급 처리
  const handleVictory = useCallback(() => {
    endBattle();
  }, [endBattle]);

  // 전투 패배
  const handleDefeat = useCallback(() => {
    endBattle();
  }, [endBattle]);

  // 도주
  const handleFlee = useCallback(() => {
    endBattle();
  }, [endBattle]);

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
              {getMapById(maps, mapId || "town_square")?.icon || "🏠"}
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

          {/* 몬스터 목록 */}
          <MonsterList
            mapId={mapId || "town_square"}
            playerLevel={profile.level}
            onSelectMonster={handleSelectMonster}
            disabled={battle.isInBattle}
          />

          {/* 월드맵 버튼 */}
          <button
            onClick={() => setShowWorldMap(true)}
            className="w-full px-3 py-2 text-sm font-mono font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              background: theme.colors.bgLight,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
            }}
          >
            <span>🗺️</span>
            <span>월드맵</span>
          </button>

          {/* 맵 이동 */}
          <MapSelector
            currentMapId={mapId || "town_square"}
            onMapChange={handleMapChange}
            playerLevel={profile.level}
          />
        </div>
      </div>

      {/* 전투 패널 */}
      {battle.isInBattle && mainCharacter?.stats && (
        <BattlePanel
          characterStats={mainCharacter.stats}
          proficiencies={proficiencies || ({} as Record<ProficiencyType, number>)}
          onFlee={handleFlee}
          onVictory={handleVictory}
          onDefeat={handleDefeat}
        />
      )}

      {/* 테마 설정 모달 */}
      <ThemeSettingsModal open={showThemeModal} onClose={() => setShowThemeModal(false)} />

      {/* 월드맵 모달 */}
      <WorldMapModal
        open={showWorldMap}
        onClose={() => setShowWorldMap(false)}
        currentMapId={mapId || "town_square"}
        onMapSelect={handleMapChange}
        playerLevel={profile.level}
      />
    </div>
  );
}
