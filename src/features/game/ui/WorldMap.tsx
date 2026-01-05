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

  const currentMap = getMapById(maps, currentMapId);
  const connectedMapIds = useMemo(() => {
    return currentMap?.connectedMaps || [];
  }, [currentMap]);

  // 연결된 맵들의 하위 맵 (2단계)
  const getSubMaps = (mapId: string) => {
    const map = getMapById(maps, mapId);
    if (!map) return [];
    return map.connectedMaps.filter(
      (id) => id !== currentMapId && !connectedMapIds.includes(id)
    );
  };

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

      {/* 트리 구조 맵 */}
      <div className="p-3 space-y-1">
        {/* 현재 위치 */}
        {currentMap && (
          <div className="flex items-center gap-2">
            <span style={{ color: theme.colors.primary }}>●</span>
            <span>{currentMap.icon}</span>
            <span style={{ color: theme.colors.primary, fontWeight: "bold" }}>
              {currentMap.nameKo}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: `${theme.colors.primary}20`,
                color: theme.colors.primary,
              }}
            >
              현재
            </span>
            {currentMap.isSafeZone && (
              <span className="text-xs" style={{ color: theme.colors.success }}>
                (안전)
              </span>
            )}
            <MonsterInfo mapId={currentMap.id} />
          </div>
        )}

        {/* 연결된 맵들 */}
        {connectedMapIds.map((mapId, index) => {
          const map = getMapById(maps, mapId);
          if (!map) return null;

          const isLast = index === connectedMapIds.length - 1;
          const subMaps = getSubMaps(mapId);
          const canEnter = playerLevel >= map.minLevel;

          return (
            <div key={mapId}>
              {/* 1단계 연결 */}
              <div className="flex items-center gap-2">
                <span style={{ color: theme.colors.border }}>
                  {isLast ? "└──" : "├──"}
                </span>
                <MapButton
                  map={map}
                  canEnter={canEnter}
                  onSelect={() => canEnter && onMapSelect(mapId)}
                />
              </div>

              {/* 2단계 연결 (하위 맵) */}
              {subMaps.map((subMapId, subIndex) => {
                const subMap = getMapById(maps, subMapId);
                if (!subMap) return null;

                const isSubLast = subIndex === subMaps.length - 1;
                const canEnterSub = playerLevel >= subMap.minLevel;
                const prefix = isLast ? "    " : "│   ";

                return (
                  <div key={subMapId} className="flex items-center gap-2">
                    <span style={{ color: theme.colors.border }}>
                      {prefix}{isSubLast ? "└──" : "├──"}
                    </span>
                    <MapButton
                      map={subMap}
                      canEnter={canEnterSub}
                      canMove={false}
                      onSelect={() => {}}
                    />
                    <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                      ({map.nameKo} 경유)
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div
        className="px-3 py-2 border-t flex flex-wrap gap-3 text-xs"
        style={{ borderColor: theme.colors.border }}
      >
        <span>
          <span style={{ color: theme.colors.primary }}>●</span> 현재
        </span>
        <span>
          <span style={{ color: theme.colors.success }}>●</span> 이동 가능
        </span>
        <span>
          <span style={{ color: theme.colors.textMuted }}>●</span> 경유 필요
        </span>
        <span>
          <span style={{ color: theme.colors.error }}>🔒</span> Lv 부족
        </span>
      </div>
    </div>
  );
}

// 맵 버튼 컴포넌트
interface MapButtonProps {
  map: GameMap;
  canEnter: boolean;
  canMove?: boolean;
  onSelect: () => void;
}

function MapButton({ map, canEnter, canMove = true, onSelect }: MapButtonProps) {
  const { theme } = useThemeStore();

  const color = !canEnter
    ? theme.colors.error
    : canMove
    ? theme.colors.success
    : theme.colors.textMuted;

  return (
    <>
      <span style={{ color }}>●</span>
      <span>{!canEnter ? "🔒" : map.icon}</span>
      <button
        onClick={onSelect}
        disabled={!canEnter || !canMove}
        className="transition-colors"
        style={{
          color,
          cursor: canEnter && canMove ? "pointer" : "default",
          textDecoration: canEnter && canMove ? "underline" : "none",
        }}
      >
        {map.nameKo}
      </button>
      {!canEnter && (
        <span className="text-xs" style={{ color: theme.colors.error }}>
          Lv.{map.minLevel}+
        </span>
      )}
      {map.isSafeZone && canEnter && (
        <span className="text-xs" style={{ color: theme.colors.success }}>
          (안전)
        </span>
      )}
      <MonsterInfo mapId={map.id} />
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
      - {monsters.map((m) => `${m.nameKo}`).join(", ")}
    </span>
  );
}
