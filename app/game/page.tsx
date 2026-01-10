"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  NpcList,
  HealerDialog,
  InjuryDisplay,
} from "@/features/game";
import { useNpcsByMap, type Npc } from "@/entities/npc";
import {
  useProfile,
  getMainCharacter,
  getFatiguePercent,
  getMaxFatigueFromProfile,
  getCurrentFatigue,
} from "@/entities/user";
import {
  useMaps,
  getMapById,
  getMapDisplayName,
} from "@/entities/map";
import type { Monster } from "@/entities/monster";
import { useProficiencies } from "@/entities/proficiency";
import type { ProficiencyType } from "@/entities/proficiency";
import { GameTimeClock, AtmosphericText, useRealtimeGameTime, getPeriodOverlayStyle } from "@/entities/game-time";
import { WeatherDisplay } from "@/entities/weather";
import { useBattleStore, usePvpStore } from "@/application/stores";
import { useStartBattle, useEndBattle } from "@/features/combat";
import { useUpdateLocation } from "@/features/game";
import { useThemeStore } from "@/shared/config";
import { ThemeSettingsModal } from "@/shared/ui";
import { StatusModal } from "@/widgets/status-modal";

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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<Npc | null>(null);

  // NPC 조회
  const { data: npcs = [] } = useNpcsByMap(mapId || "starting_village");

  // 전투 관련
  const { battle } = useBattleStore();
  const { start: startBattle } = useStartBattle({ userId: session?.user?.id });
  const { data: proficiencies } = useProficiencies(session?.user?.id);

  // 맵 이동 (피로도 소모)
  const updateLocation = useUpdateLocation();

  // PvP 관련
  const { declineNotice, setDeclineNotice } = usePvpStore();

  // 시간대별 명도 오버레이
  const { gameTime } = useRealtimeGameTime();
  const periodOverlay = getPeriodOverlayStyle(gameTime?.period || "day");

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
  const fatiguePercent = getFatiguePercent(profile);

  // 캐릭터 정보 로드
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    if (profile && !profileLoading) {
      if (!profile.character) {
        router.push("/character-create");
        return;
      }

      setMyCharacterName(profile.character.name);
    }
  }, [session, profile, profileLoading, router, setMyCharacterName]);

  // 프로필에서 마지막 위치 로드 (초기 로드 시)
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

  // 서버에서 맵 변경 시 동기화 (패배 후 귀환 등)
  // 주의: mapId를 의존성에서 제거하여 사용자 이동 시 경쟁 조건 방지
  useEffect(() => {
    if (profile && maps.length > 0 && profile.currentMapId) {
      const serverMapId = profile.currentMapId;
      const serverMap = getMapById(maps, serverMapId);
      if (serverMap) {
        setMapId(serverMapId);
        setCurrentMap({
          id: serverMap.id,
          name: getMapDisplayName(serverMap),
          description: serverMap.descriptionKo || "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.currentMapId, maps, setCurrentMap]);

  const { sendMessage } = useRealtimeChat({
    mapId: mapId || "town_square",
    userId: session?.user?.id || "",
    characterName: myCharacterName,
  });

  const handleMapChange = async (newMapId: string) => {
    const newMap = getMapById(maps, newMapId);
    if (newMap && session?.user?.id && myCharacterName) {
      // 먼저 로컬 상태 업데이트 (동기화 useEffect 경쟁 조건 방지)
      setMapId(newMapId);
      setCurrentMap({
        id: newMap.id,
        name: getMapDisplayName(newMap),
        description: newMap.descriptionKo || "",
      });

      try {
        // 피로도 소모 + 위치 업데이트
        await updateLocation.mutateAsync({
          userId: session.user.id,
          characterName: myCharacterName,
          mapId: newMapId,
        });
      } catch (error) {
        console.error("Failed to move:", error);
        // 피로도 부족 등의 에러 시 이전 위치로 롤백
        const prevMapId = profile?.currentMapId || "town_square";
        const prevMap = getMapById(maps, prevMapId);
        if (prevMap) {
          setMapId(prevMapId);
          setCurrentMap({
            id: prevMap.id,
            name: getMapDisplayName(prevMap),
            description: prevMap.descriptionKo || "",
          });
        }
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

      // 최대 HP 계산 (CON 기반: 50 + CON * 5 + level * 10)
      const baseCon = mainCharacter?.stats?.con ?? 10;
      const maxHp = 50 + baseCon * 5 + profile.level * 10;

      // 최대 MP 계산 (WIS * 3 + INT + 20)
      const baseInt = mainCharacter?.stats?.int ?? 10;
      const baseWis = mainCharacter?.stats?.wis ?? 10;
      const maxMp = 20 + baseWis * 3 + baseInt;

      // 저장된 HP/MP 사용 (null이면 최대값)
      const playerHp = profile.currentHp ?? maxHp;
      const playerMp = profile.currentMp ?? maxMp;

      startBattle(monster, playerHp, maxHp, playerMp, maxMp);
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

  // NPC 선택 핸들러
  const handleSelectNpc = useCallback(
    (npcId: string) => {
      const npc = npcs.find((n) => n.id === npcId);
      if (npc) {
        setSelectedNpc(npc);
      }
    },
    [npcs]
  );

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
            width: `${fatiguePercent}%`,
            background:
              fatiguePercent > 50
                ? theme.colors.success
                : fatiguePercent > 20
                ? theme.colors.warning
                : theme.colors.error,
          }}
        />
      </div>

      {/* 헤더 */}
      <header
        className="flex-none px-2 sm:px-3 py-2 border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        {/* 상단 바: 피로도 + 시간/날씨 + 설정 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* 왼쪽: 피로도 */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono min-w-0">
            <span style={{ color: theme.colors.textMuted }}>피로도</span>
            <span
              className="font-medium"
              style={{ color: fatiguePercent <= 20 ? theme.colors.error : theme.colors.textDim }}
            >
              {getCurrentFatigue(profile)}/{getMaxFatigueFromProfile(profile)}
            </span>
          </div>

          {/* 중앙: 시간 + 날씨 (모바일에서 아이콘만) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <GameTimeClock compact />
            <WeatherDisplay compact />
          </div>

          {/* 오른쪽: 테마 + 로그아웃 */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1 text-[10px] sm:text-xs font-mono transition-colors p-1"
              style={{ color: theme.colors.textMuted }}
              title="테마 설정"
            >
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                style={{ background: theme.colors.primary }}
              />
              <span className="hidden sm:inline">테마</span>
            </button>
            <button
              onClick={handleSignOut}
              className="text-[10px] sm:text-xs font-mono transition-colors p-1"
              style={{ color: theme.colors.textMuted }}
              title="로그아웃"
            >
              <span className="sm:hidden">🚪</span>
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>

        {/* 메인 헤더: 맵 정보 + 캐릭터 */}
        <div className="flex items-center justify-between gap-2">
          {/* 왼쪽: 맵 아이콘 + 정보 */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg sm:text-xl flex-shrink-0">
              {getMapById(maps, mapId || "town_square")?.icon || "🏠"}
            </span>
            <div className="min-w-0 flex-1">
              <h1
                className="text-sm sm:text-lg font-bold font-mono truncate"
                style={{ color: theme.colors.text }}
              >
                {currentMap?.name || "시작 마을"}
              </h1>
              <p
                className="text-[10px] sm:text-xs font-mono truncate hidden sm:block"
                style={{ color: theme.colors.textMuted }}
              >
                {currentMap?.description}
              </p>
              <AtmosphericText mapId={mapId || "starting_village"} className="mt-0.5 sm:mt-1 hidden md:block" />
            </div>
          </div>

          {/* 오른쪽: 캐릭터 정보 + 접속 상태 */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* 상태창 버튼 */}
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 transition-colors"
              style={{
                background: theme.colors.bgDark,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
              }}
            >
              <span className="text-xs sm:text-sm">👤</span>
              <span className="text-xs sm:text-sm font-mono font-medium max-w-[60px] sm:max-w-none truncate">
                {myCharacterName}
              </span>
              <span
                className="text-[10px] sm:text-xs font-mono"
                style={{ color: theme.colors.textMuted }}
              >
                Lv.{profile.level}
              </span>
              {/* 부상 표시 */}
              {profile.injuries.length > 0 && (
                <InjuryDisplay injuries={profile.injuries} compact />
              )}
            </button>
            {/* 재화 표시 (태블릿 이상) */}
            <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm font-mono">
              <span style={{ color: theme.colors.warning }}>💰 {profile.gold.toLocaleString()}</span>
              <span style={{ color: theme.colors.primary }}>💎 {profile.gems.toLocaleString()}</span>
            </div>
            {/* 접속 상태 */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: isConnected ? theme.colors.success : theme.colors.error }}
              title={isConnected ? "접속됨" : "연결 끊김"}
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
        <div className="flex-none lg:w-64 flex flex-col gap-3 min-h-0 max-h-[50vh] lg:max-h-full overflow-y-auto">
          {/* 접속 유저 */}
          <PlayerList currentUserId={session.user.id} />

          {/* 몬스터 목록 */}
          <MonsterList
            mapId={mapId || "town_square"}
            playerLevel={profile.level}
            onSelectMonster={handleSelectMonster}
            disabled={battle.isInBattle}
          />

          {/* NPC 목록 */}
          <NpcList
            mapId={mapId || "starting_village"}
            onSelectNpc={handleSelectNpc}
            disabled={battle.isInBattle}
          />

          {/* 월드맵 버튼 */}
          <button
            onClick={() => setShowWorldMap(true)}
            className="w-full flex-shrink-0 px-3 py-2 text-sm font-mono font-medium transition-colors flex items-center justify-center gap-2"
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
          proficiencies={proficiencies}
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

      {/* 치료사 NPC 다이얼로그 */}
      {selectedNpc && selectedNpc.type === "healer" && (
        <HealerDialog
          npc={selectedNpc}
          injuries={profile.injuries}
          playerGold={profile.gold}
          userId={session.user.id}
          onClose={() => setSelectedNpc(null)}
        />
      )}

      {/* 상태창 모달 */}
      <StatusModal open={showStatusModal} onClose={() => setShowStatusModal(false)} />

      {/* 시간대별 명도 오버레이 */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: periodOverlay.background,
          opacity: periodOverlay.opacity,
          zIndex: 10,
        }}
      />
    </div>
  );
}
