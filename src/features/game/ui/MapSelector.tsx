"use client";

interface MapOption {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface MapSelectorProps {
  currentMapId: string;
  onMapChange: (mapId: string) => void;
}

const AVAILABLE_MAPS: MapOption[] = [
  {
    id: "starting_village",
    name: "시작 마을",
    icon: "🏠",
    description: "평화로운 마을",
  },
  {
    id: "forest",
    name: "숲",
    icon: "🌲",
    description: "마을 외곽의 숲",
  },
  {
    id: "dungeon_1",
    name: "던전 1층",
    icon: "⚔️",
    description: "위험한 던전",
  },
];

export function MapSelector({ currentMapId, onMapChange }: MapSelectorProps) {
  const otherMaps = AVAILABLE_MAPS.filter((m) => m.id !== currentMapId);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">🗺️ 이동</span>
      </div>

      {/* 맵 목록 */}
      <div className="p-2 space-y-2">
        {otherMaps.map((map) => (
          <button
            key={map.id}
            onClick={() => onMapChange(map.id)}
            className="w-full flex items-center gap-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-left"
          >
            <span className="text-xl">{map.icon}</span>
            <div>
              <div className="text-sm font-medium text-white">{map.name}</div>
              {map.description && (
                <div className="text-xs text-gray-500">{map.description}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { AVAILABLE_MAPS };
