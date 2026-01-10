import type {
  GameMap,
  SpawnInfo,
  SpawnSchedule,
  BossSpawnStatus,
  TerrainInfo,
  TerrainType,
} from "../types";

// ============ 보스 스케줄 체크 ============

/**
 * 현재 시간이 스케줄 범위 내인지 확인
 */
export function isWithinSchedule(
  schedule: SpawnSchedule,
  now: Date = new Date()
): boolean {
  const timezone = schedule.timezone || "Asia/Seoul";

  // 한국 시간으로 변환
  const koreaTime = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );

  const dayOfWeek = koreaTime.getDay();
  const hour = koreaTime.getHours();

  // 요일 체크
  if (schedule.dayOfWeek && !schedule.dayOfWeek.includes(dayOfWeek)) {
    return false;
  }

  // 시간 체크
  if (schedule.hourRange) {
    const [startHour, endHour] = schedule.hourRange;
    if (hour < startHour || hour >= endHour) {
      return false;
    }
  }

  return true;
}

/**
 * 다음 스폰 시간 계산
 */
export function getNextSpawnTime(
  schedule: SpawnSchedule,
  now: Date = new Date()
): Date | null {
  if (!schedule.dayOfWeek || schedule.dayOfWeek.length === 0) {
    return null;
  }

  const timezone = schedule.timezone || "Asia/Seoul";
  const koreaTime = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );

  const currentDay = koreaTime.getDay();
  const currentHour = koreaTime.getHours();
  const startHour = schedule.hourRange?.[0] || 0;

  // 오늘 스폰 가능한지 체크
  if (
    schedule.dayOfWeek.includes(currentDay) &&
    currentHour < startHour
  ) {
    const nextSpawn = new Date(koreaTime);
    nextSpawn.setHours(startHour, 0, 0, 0);
    return nextSpawn;
  }

  // 다음 스폰 요일 찾기
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (schedule.dayOfWeek.includes(nextDay)) {
      const nextSpawn = new Date(koreaTime);
      nextSpawn.setDate(nextSpawn.getDate() + i);
      nextSpawn.setHours(startHour, 0, 0, 0);
      return nextSpawn;
    }
  }

  return null;
}

/**
 * 보스 스폰 상태 확인
 */
export function getBossSpawnStatus(
  spawn: SpawnInfo,
  mapId: string,
  lastDefeatedAt?: Date | null
): BossSpawnStatus {
  const schedule = spawn.schedule || {};
  const isActive = isWithinSchedule(schedule);

  // 리스폰 시간 체크
  let canSpawn = isActive;
  if (isActive && lastDefeatedAt && spawn.respawnTime) {
    const respawnAt = new Date(
      lastDefeatedAt.getTime() + spawn.respawnTime * 1000
    );
    if (new Date() < respawnAt) {
      canSpawn = false;
    }
  }

  return {
    monsterId: spawn.monsterId,
    mapId,
    zoneId: spawn.zoneId || "",
    isActive: canSpawn,
    nextSpawnTime: canSpawn ? null : getNextSpawnTime(schedule),
    lastDefeatedAt: lastDefeatedAt || null,
    schedule,
  };
}

// ============ 조건부 스폰 체크 ============

type Period = "night" | "dusk" | "dawn" | "day";
type Weather = "sunny" | "cloudy" | "rainy" | "stormy" | "foggy";

/**
 * 스폰 조건 충족 여부 확인
 */
export function meetsSpawnConditions(
  spawn: SpawnInfo,
  currentPeriod?: Period,
  currentWeather?: Weather
): boolean {
  if (!spawn.conditions) {
    return true;
  }

  // 시간대 조건 체크
  if (spawn.conditions.period && currentPeriod) {
    if (!spawn.conditions.period.includes(currentPeriod)) {
      return false;
    }
  }

  // 날씨 조건 체크
  if (spawn.conditions.weather && currentWeather) {
    if (!spawn.conditions.weather.includes(currentWeather)) {
      return false;
    }
  }

  return true;
}

// ============ 맵 헬퍼 함수 ============

/**
 * 현재 활성화된 스폰 목록 가져오기
 */
export function getActiveSpawns(
  map: GameMap,
  currentPeriod?: Period,
  currentWeather?: Weather,
  bossDefeats?: Map<string, Date>
): SpawnInfo[] {
  return map.spawns.filter((spawn) => {
    switch (spawn.spawnType) {
      case "always":
        return true;

      case "conditional":
        return meetsSpawnConditions(spawn, currentPeriod, currentWeather);

      case "boss": {
        if (!spawn.schedule) return false;
        const lastDefeated = bossDefeats?.get(spawn.monsterId);
        const status = getBossSpawnStatus(spawn, map.id, lastDefeated);
        return status.isActive;
      }

      case "rare":
        // 희귀 몬스터는 확률에 따라 별도 처리
        return true;

      case "event":
        // 이벤트 몬스터는 이벤트 시스템에서 처리
        return false;

      default:
        return false;
    }
  });
}

/**
 * 맵의 보스 스폰 정보 가져오기
 */
export function getMapBossSpawns(map: GameMap): SpawnInfo[] {
  return map.spawns.filter((spawn) => spawn.spawnType === "boss");
}

/**
 * 특정 구역의 스폰 정보 가져오기
 */
export function getSpawnsByZone(map: GameMap, zoneId: string): SpawnInfo[] {
  return map.spawns.filter((spawn) => spawn.zoneId === zoneId);
}

// ============ 지형 헬퍼 함수 ============

/**
 * 지형 속성 보너스 가져오기
 */
export function getTerrainElementBonus(
  terrainInfo: TerrainInfo | undefined
): { element: string; multiplier: number } | null {
  return terrainInfo?.elementBonus || null;
}

/**
 * 지형 디버프 가져오기
 */
export function getTerrainDebuff(
  terrainInfo: TerrainInfo | undefined
): { type: string; effect: string } | null {
  return terrainInfo?.debuff || null;
}

// ============ 맵 연결 헬퍼 ============

/**
 * 연결된 맵 중 이동 가능한 맵 필터링
 */
export function getAccessibleConnectedMaps(
  map: GameMap,
  allMaps: GameMap[],
  playerLevel: number
): GameMap[] {
  return map.connectedMaps
    .map((id) => allMaps.find((m) => m.id === id))
    .filter((m): m is GameMap => m !== undefined && m.minLevel <= playerLevel);
}

/**
 * 두 맵 사이의 경로 찾기 (BFS)
 */
export function findPath(
  fromMapId: string,
  toMapId: string,
  allMaps: GameMap[],
  playerLevel: number
): string[] | null {
  if (fromMapId === toMapId) return [fromMapId];

  const mapById = new Map(allMaps.map((m) => [m.id, m]));
  const visited = new Set<string>();
  const queue: { mapId: string; path: string[] }[] = [
    { mapId: fromMapId, path: [fromMapId] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.mapId)) continue;
    visited.add(current.mapId);

    const currentMap = mapById.get(current.mapId);
    if (!currentMap) continue;

    for (const connectedId of currentMap.connectedMaps) {
      const connectedMap = mapById.get(connectedId);
      if (!connectedMap || connectedMap.minLevel > playerLevel) continue;

      const newPath = [...current.path, connectedId];

      if (connectedId === toMapId) {
        return newPath;
      }

      queue.push({ mapId: connectedId, path: newPath });
    }
  }

  return null;
}

// ============ 스케줄 포맷팅 ============

const DAY_NAMES_KO = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 스케줄을 읽기 쉬운 형태로 변환
 */
export function formatSchedule(schedule: SpawnSchedule): string {
  const parts: string[] = [];

  if (schedule.dayOfWeek && schedule.dayOfWeek.length > 0) {
    if (schedule.dayOfWeek.length === 7) {
      parts.push("매일");
    } else {
      const days = schedule.dayOfWeek.map((d) => DAY_NAMES_KO[d]).join(", ");
      parts.push(`${days}요일`);
    }
  }

  if (schedule.hourRange) {
    const [start, end] = schedule.hourRange;
    parts.push(`${start}:00~${end}:00`);
  }

  return parts.join(" ") || "항상";
}

/**
 * 다음 스폰까지 남은 시간 포맷팅
 */
export function formatTimeUntilSpawn(nextSpawnTime: Date | null): string {
  if (!nextSpawnTime) return "곧 스폰";

  const now = new Date();
  const diff = nextSpawnTime.getTime() - now.getTime();

  if (diff <= 0) return "스폰 가능";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}일 후`;
  }

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 후`;
  }

  return `${minutes}분 후`;
}
