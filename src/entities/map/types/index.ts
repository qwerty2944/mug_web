// ============ 지형 타입 ============

export type TerrainType =
  | "village"
  | "forest"
  | "deep_forest"
  | "ruins"
  | "arena"
  | "cave"
  | "swamp"
  | "volcano"
  | "glacier"
  | "storm_plains"
  | "temple"
  | "crypt"
  | "market"
  | "training";

export interface TerrainInfo {
  id: TerrainType;
  nameKo: string;
  nameEn: string;
  icon: string;
  elementBonus: {
    element: string;
    multiplier: number;
  } | null;
  debuff: {
    type: string;
    effect: string;
  } | null;
  description: string;
}

// ============ 리전 타입 ============

export type RegionId = "starter" | "greenwood" | "ancient" | "combat";

export interface RegionInfo {
  id: RegionId;
  nameKo: string;
  nameEn: string;
  levelRange: [number, number];
  description: string;
}

// ============ 구역(Zone) 타입 ============

export type ZoneType =
  | "spawn_point"
  | "boss_area"
  | "safe_zone"
  | "event_area"
  | "treasure"
  | "portal";

export interface Zone {
  id: string;
  nameKo: string;
  type: ZoneType;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isDefault?: boolean;
  portalTo?: string;
  eventTriggers?: string[];
  description?: string;
}

// ============ 스폰 타입 ============

export type SpawnType = "always" | "boss" | "rare" | "event" | "conditional";

export interface SpawnSchedule {
  preset?: string;
  dayOfWeek?: number[];  // 0=일요일, 6=토요일
  hourRange?: [number, number];  // [시작시, 종료시]
  timezone?: string;  // 기본 "Asia/Seoul"
}

export interface SpawnCondition {
  period?: ("night" | "dusk" | "dawn" | "day")[];
  weather?: ("sunny" | "cloudy" | "rainy" | "stormy" | "foggy")[];
}

export interface SpawnAnnouncement {
  spawn?: string;
  defeat?: string;
}

export interface SpawnInfo {
  monsterId: string;
  spawnType: SpawnType;
  spawnRate?: number;  // 분당 스폰률 (always, conditional)
  spawnChance?: number;  // 스폰 확률 (rare)
  maxCount: number;
  zoneId?: string;
  respawnTime?: number;  // 초 단위
  schedule?: SpawnSchedule;  // 보스 스케줄
  conditions?: SpawnCondition;  // 조건부 스폰
  announcement?: SpawnAnnouncement;  // 보스 알림
}

// ============ PvP 규칙 타입 ============

export interface PvpRewards {
  winner: {
    honorPoints: number;
    gold: number;
  };
  loser: {
    honorPoints: number;
    gold: number;
  };
}

export interface PvpRules {
  minLevel: number;
  levelMatchRange: number;
  rewards: PvpRewards;
  penalties: {
    death: null | {
      expLoss?: number;
      goldLoss?: number;
    };
  };
}

// ============ 맵 타입 ============

export interface GameMap {
  id: string;
  region: RegionId;
  nameKo: string;
  nameEn: string;
  descriptionKo: string | null;
  descriptionEn: string | null;
  icon: string;
  terrain: TerrainType;
  minLevel: number;
  maxPlayers: number;
  isPvp: boolean;
  isSafeZone: boolean;
  connectedMaps: string[];
  zones: Zone[];
  spawns: SpawnInfo[];
  npcs: string[];
  pvpRules?: PvpRules;
}

// ============ 메타데이터 타입 ============

export interface MapMetadata {
  terrainTypes: Record<TerrainType, TerrainInfo>;
  regions: Record<RegionId, RegionInfo>;
  spawnTypes: Record<SpawnType, {
    id: SpawnType;
    nameKo: string;
    nameEn: string;
    description: string;
  }>;
  bossSchedulePresets: Record<string, SpawnSchedule & {
    id: string;
    nameKo: string;
    description: string;
  }>;
  zoneTypes: Record<ZoneType, {
    id: ZoneType;
    nameKo: string;
    description: string;
  }>;
}

// ============ 보스 스폰 상태 타입 ============

export interface BossSpawnStatus {
  monsterId: string;
  mapId: string;
  zoneId: string;
  isActive: boolean;
  nextSpawnTime: Date | null;
  lastDefeatedAt: Date | null;
  schedule: SpawnSchedule;
}

// ============ 헬퍼 함수 타입 ============

export interface MapWithSpawnStatus extends GameMap {
  activeSpawns: SpawnInfo[];
  upcomingBosses: BossSpawnStatus[];
}
