"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import {
  useGameStore,
  useRealtimeChat,
  ChatBox,
  PlayerList,
  MapSelector,
  AVAILABLE_MAPS,
} from "@/features/game";
import { supabase } from "@/shared/api";

export default function GamePage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { currentMap, setCurrentMap, isConnected, setMyCharacterName, myCharacterName } =
    useGameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [mapId, setMapId] = useState("starting_village");

  // 캐릭터 정보 로드
  useEffect(() => {
    async function loadCharacter() {
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }

      try {
        // 프로필에서 캐릭터 정보 가져오기
        const { data, error } = await supabase
          .from("profiles")
          .select("characters")
          .eq("id", session.user.id)
          .single();

        if (error || !data?.characters?.length) {
          // 캐릭터가 없으면 생성 페이지로
          router.push("/character-create");
          return;
        }

        // 메인 캐릭터 찾기
        const mainCharacter = data.characters.find((c: any) => c.isMain) || data.characters[0];
        setMyCharacterName(mainCharacter.name);

        // 초기 맵 설정
        const startMap = AVAILABLE_MAPS.find((m) => m.id === "starting_village");
        if (startMap) {
          setCurrentMap({
            id: startMap.id,
            name: startMap.name,
            description: startMap.description || "",
          });
        }
      } catch (err) {
        console.error("Failed to load character:", err);
        router.push("/character-create");
      } finally {
        setIsLoading(false);
      }
    }

    loadCharacter();
  }, [session, router, setCurrentMap, setMyCharacterName]);

  // Realtime 채팅 연결
  const { sendMessage } = useRealtimeChat({
    mapId,
    userId: session?.user?.id || "",
    characterName: myCharacterName,
  });

  // 맵 변경
  const handleMapChange = (newMapId: string) => {
    const newMap = AVAILABLE_MAPS.find((m) => m.id === newMapId);
    if (newMap) {
      setMapId(newMapId);
      setCurrentMap({
        id: newMap.id,
        name: newMap.name,
        description: newMap.description || "",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-dvh w-full bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">게임 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id || !myCharacterName) {
    return null;
  }

  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="flex-none p-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {AVAILABLE_MAPS.find((m) => m.id === mapId)?.icon || "🏠"}
          </span>
          <div>
            <h1 className="text-lg font-bold">{currentMap?.name || "시작 마을"}</h1>
            <p className="text-xs text-gray-500">{currentMap?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            👤 {myCharacterName}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
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
          <MapSelector currentMapId={mapId} onMapChange={handleMapChange} />
        </div>
      </div>
    </div>
  );
}
