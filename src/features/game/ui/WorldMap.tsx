"use client";

import { useMemo } from "react";
import { useMaps, getMapById, type GameMap } from "@/entities/map";
import { useMonstersByMap } from "@/entities/monster";
import { useThemeStore } from "@/shared/config";

interface WorldMapProps {
  currentMapId: string;
  onMapSelect: (mapId: string) => void;
  playerLevel: number;
}

export function WorldMap({ currentMapId, onMapSelect, playerLevel }: WorldMapProps) {
  const { theme } = useThemeStore();
  const { data: maps = [] } = useMaps();

  // 현재 맵에서 이동 가능한 맵 ID 목록
  const currentMap = getMapById(maps, currentMapId);
  const connectedMapIds = useMemo(() => {
    return currentMap?.connectedMaps || [];
  }, [currentMap]);

  const canEnterMap = (map: GameMap) => playerLevel >= map.minLevel;
  const isConnected = (mapId: string) => connectedMapIds.includes(mapId);

  return (
    <div
      className="w-full overflow-hidden font-mono text-sm"
      style={{
        background: theme.colors.bgDark,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-2 border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <span className="font-medium" style={{ color: theme.colors.text }}>
          🗺️ 월드맵
        </span>
      </div>

      {/* 텍스트 기반 맵 */}
      <div className="p-3 space-y-1">
        {/* 마을 광장 (최상위) */}
        <MapNode
          mapId="town_square"
          maps={maps}
          currentMapId={currentMapId}
          connectedMapIds={connectedMapIds}
          playerLevel={playerLevel}
          onSelect={onMapSelect}
          indent={0}
        />

        {/* 연결선 */}
        <div style={{ color: theme.colors.border }}>
          {"    ├── 🛒 "}
          <MapLink
            mapId="shop_district"
            maps={maps}
            currentMapId={currentMapId}
            connectedMapIds={connectedMapIds}
            playerLevel={playerLevel}
            onSelect={onMapSelect}
          />
        </div>

        <div style={{ color: theme.colors.border }}>
          {"    ├── 🎯 "}
          <MapLink
            mapId="training_ground"
            maps={maps}
            currentMapId={currentMapId}
            connectedMapIds={connectedMapIds}
            playerLevel={playerLevel}
            onSelect={onMapSelect}
          />
        </div>

        <div style={{ color: theme.colors.border }}>
          {"    │       └── "}
          <MapLink
            mapId="forest_entrance"
            maps={maps}
            currentMapId={currentMapId}
            connectedMapIds={connectedMapIds}
            playerLevel={playerLevel}
            onSelect={onMapSelect}
          />
        </div>

        <div style={{ color: theme.colors.border }}>
          {"    │              └── "}
          <MapLink
            mapId="deep_forest"
            maps={maps}
            currentMapId={currentMapId}
            connectedMapIds={connectedMapIds}
            playerLevel={playerLevel}
            onSelect={onMapSelect}
          />
        </div>

        <div style={{ color: theme.colors.border }}>
          {"    │"}
        </div>

        <div style={{ color: theme.colors.border }}>
          {"    └── 🌲 "}
          <MapLink
            mapId="forest_entrance"
            maps={maps}
            currentMapId={currentMapId}
            connectedMapIds={connectedMapIds}
            playerLevel={playerLevel}
            onSelect={onMapSelect}
          />
          <span style={{ color: theme.colors.textMuted }}> (직접 연결)</span>
        </div>
      </div>

      {/* 범례 */}
      <div
        className="px-3 py-2 border-t flex flex-wrap gap-3 text-xs"
        style={{ borderColor: theme.colors.border }}
      >
        <span style={{ color: theme.colors.primary }}>● 현재 위치</span>
        <span style={{ color: theme.colors.success }}>● 이동 가능</span>
        <span style={{ color: theme.colors.textMuted }}>● 이동 불가</span>
        <span style={{ color: theme.colors.error }}>🔒 레벨 제한</span>
      </div>
    </div>
  );
}

// 맵 노드 컴포넌트
interface MapNodeProps {
  mapId: string;
  maps: GameMap[];
  currentMapId: string;
  connectedMapIds: string[];
  playerLevel: number;
  onSelect: (mapId: string) => void;
  indent: number;
}

function MapNode({
  mapId,
  maps,
  currentMapId,
  connectedMapIds,
  playerLevel,
  onSelect,
}: MapNodeProps) {
  const { theme } = useThemeStore();
  const map = getMapById(maps, mapId);
  if (!map) return null;

  const isCurrent = mapId === currentMapId;
  const canMove = connectedMapIds.includes(mapId) && playerLevel >= map.minLevel;
  const isLocked = playerLevel < map.minLevel;

  return (
    <div className="flex items-center gap-2">
      <span>{map.icon}</span>
      <button
        onClick={() => canMove && onSelect(mapId)}
        disabled={!canMove || isCurrent}
        className="transition-colors"
        style={{
          color: isCurrent
            ? theme.colors.primary
            : canMove
            ? theme.colors.success
            : theme.colors.textMuted,
          cursor: canMove && !isCurrent ? "pointer" : "default",
          textDecoration: canMove && !isCurrent ? "underline" : "none",
        }}
      >
        {map.nameKo}
      </button>
      {isCurrent && (
        <span className="text-xs px-1" style={{ color: theme.colors.primary }}>
          [현재]
        </span>
      )}
      {map.isSafeZone && (
        <span className="text-xs" style={{ color: theme.colors.success }}>
          (안전)
        </span>
      )}
      {isLocked && (
        <span className="text-xs" style={{ color: theme.colors.error }}>
          🔒 Lv.{map.minLevel}+
        </span>
      )}
      <MonsterInfo mapId={mapId} />
    </div>
  );
}

// 맵 링크 컴포넌트 (인라인용)
interface MapLinkProps {
  mapId: string;
  maps: GameMap[];
  currentMapId: string;
  connectedMapIds: string[];
  playerLevel: number;
  onSelect: (mapId: string) => void;
}

function MapLink({
  mapId,
  maps,
  currentMapId,
  connectedMapIds,
  playerLevel,
  onSelect,
}: MapLinkProps) {
  const { theme } = useThemeStore();
  const map = getMapById(maps, mapId);
  if (!map) return null;

  const isCurrent = mapId === currentMapId;
  const canMove = connectedMapIds.includes(mapId) && playerLevel >= map.minLevel;
  const isLocked = playerLevel < map.minLevel;

  return (
    <>
      <button
        onClick={() => canMove && onSelect(mapId)}
        disabled={!canMove || isCurrent}
        className="transition-colors"
        style={{
          color: isCurrent
            ? theme.colors.primary
            : canMove
            ? theme.colors.success
            : theme.colors.textMuted,
          cursor: canMove && !isCurrent ? "pointer" : "default",
          textDecoration: canMove && !isCurrent ? "underline" : "none",
        }}
      >
        {map.nameKo}
      </button>
      {isCurrent && (
        <span className="text-xs px-1" style={{ color: theme.colors.primary }}>
          [현재]
        </span>
      )}
      {map.isSafeZone && (
        <span className="text-xs" style={{ color: theme.colors.success }}>
          (안전)
        </span>
      )}
      {isLocked && (
        <span className="text-xs" style={{ color: theme.colors.error }}>
          🔒 Lv.{map.minLevel}+
        </span>
      )}
      <MonsterInfo mapId={mapId} />
    </>
  );
}

// 몬스터 정보 표시
function MonsterInfo({ mapId }: { mapId: string }) {
  const { theme } = useThemeStore();
  const { data: monsters = [] } = useMonstersByMap(mapId);

  if (monsters.length === 0) return null;

  return (
    <span className="text-xs" style={{ color: theme.colors.warning }}>
      - {monsters.map((m) => `${m.nameKo} Lv.${m.level}`).join(", ")}
    </span>
  );
}
