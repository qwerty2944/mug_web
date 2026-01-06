"use client";

import {
  useMaps,
  getMapById,
  getConnectedMaps,
  getMapDisplayName,
  getMapDescription,
  type GameMap,
} from "@/entities/map";
import { useThemeStore } from "@/shared/config";

interface MapSelectorProps {
  currentMapId: string;
  onMapChange: (mapId: string) => void;
  playerLevel?: number;
}

export function MapSelector({
  currentMapId,
  onMapChange,
  playerLevel = 1,
}: MapSelectorProps) {
  const { theme } = useThemeStore();
  const { data: maps = [], isLoading } = useMaps();

  // 현재 맵에서 이동 가능한 맵들
  const connectedMaps = getConnectedMaps(maps, currentMapId);
  const currentMap = getMapById(maps, currentMapId);

  // 레벨 제한 체크
  const canEnterMap = (map: GameMap) => playerLevel >= map.minLevel;

  if (isLoading) {
    return (
      <div
        className="p-4"
        style={{
          background: theme.colors.bg,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="text-sm text-center font-mono" style={{ color: theme.colors.textMuted }}>
          맵 로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden flex-shrink-0"
      style={{
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-2 flex items-center justify-between border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <span className="text-sm font-mono font-medium" style={{ color: theme.colors.text }}>
          🗺️ 이동
        </span>
        {currentMap && (
          <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
            현재: {currentMap.icon} {getMapDisplayName(currentMap)}
          </span>
        )}
      </div>

      {/* 맵 목록 */}
      <div className="p-2 space-y-2 max-h-40 overflow-y-auto flex-1 min-h-0">
        {connectedMaps.length === 0 ? (
          <div className="text-center text-sm py-2 font-mono" style={{ color: theme.colors.textMuted }}>
            이동 가능한 맵이 없습니다.
          </div>
        ) : (
          connectedMaps.map((map) => {
            const canEnter = canEnterMap(map);
            return (
              <button
                key={map.id}
                onClick={() => canEnter && onMapChange(map.id)}
                disabled={!canEnter}
                className="w-full flex items-center gap-3 px-3 py-2 transition-colors text-left"
                style={{
                  background: canEnter ? theme.colors.bgDark : `${theme.colors.bgDark}80`,
                  opacity: canEnter ? 1 : 0.5,
                  cursor: canEnter ? "pointer" : "not-allowed",
                }}
              >
                <span className="text-xl flex-shrink-0">{map.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-mono font-medium truncate"
                      style={{ color: theme.colors.text }}
                    >
                      {getMapDisplayName(map)}
                    </span>
                    {map.isPvp && (
                      <span
                        className="text-xs px-1.5 py-0.5"
                        style={{
                          background: `${theme.colors.error}20`,
                          color: theme.colors.error,
                        }}
                      >
                        PvP
                      </span>
                    )}
                    {map.isSafeZone && (
                      <span
                        className="text-xs px-1.5 py-0.5"
                        style={{
                          background: `${theme.colors.success}20`,
                          color: theme.colors.success,
                        }}
                      >
                        안전
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono truncate" style={{ color: theme.colors.textMuted }}>
                    {getMapDescription(map)}
                  </div>
                  {!canEnter && (
                    <div className="text-xs font-mono mt-0.5" style={{ color: theme.colors.error }}>
                      Lv.{map.minLevel} 이상 필요
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// 하위호환성을 위한 export
export const AVAILABLE_MAPS = [
  { id: "starting_village", name: "시작 마을", icon: "🏠", description: "평화로운 마을" },
];
