/**
 * 맵 JSON 파일들을 읽어서 통합 JSON 생성
 *
 * 폴더 구조:
 *   public/data/world/maps/
 *   ├── metadata.json         # 지형, 리전, 스폰타입 메타데이터
 *   ├── starter/              # 시작 지역
 *   │   ├── starting_village.json
 *   │   ├── training_ground.json
 *   │   └── market_square.json
 *   ├── greenwood/            # 녹림 지역
 *   │   ├── forest_entrance.json
 *   │   └── deep_forest.json
 *   ├── ancient/              # 고대 지역
 *   │   └── ancient_ruins.json
 *   ├── combat/               # 전투 지역
 *   │   └── arena.json
 *   └── maps.json             # ← 생성됨 (통합 파일)
 *
 * 사용법: npx tsx scripts/generate-maps.ts
 */

import fs from "fs";
import path from "path";

// 경로 설정
const MAPS_DIR = "public/data/world/maps";
const OUTPUT_FILE = "public/data/world/maps.json";

// 리전 목록 (처리 순서)
const REGIONS = ["starter", "greenwood", "wetland", "ancient", "combat"];

// ============ 타입 정의 ============

interface Zone {
  id: string;
  nameKo: string;
  type: string;
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

interface SpawnSchedule {
  preset?: string;
  dayOfWeek?: number[];
  hourRange?: [number, number];
  timezone?: string;
}

interface SpawnCondition {
  period?: string[];
  weather?: string[];
}

interface SpawnAnnouncement {
  spawn?: string;
  defeat?: string;
}

interface SpawnInfo {
  monsterId: string;
  spawnType: "always" | "boss" | "rare" | "event" | "conditional";
  spawnRate?: number;
  spawnChance?: number;
  maxCount: number;
  zoneId?: string;
  respawnTime?: number;
  schedule?: SpawnSchedule;
  conditions?: SpawnCondition;
  announcement?: SpawnAnnouncement;
}

interface MapSource {
  id: string;
  region: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  icon: string;
  terrain: string;
  minLevel: number;
  maxPlayers: number;
  isPvp: boolean;
  isSafeZone: boolean;
  connectedMaps: string[];
  zones: Zone[];
  spawns: SpawnInfo[];
  npcs?: string[];
  pvpRules?: Record<string, unknown>;
}

interface OutputMap {
  id: string;
  region: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  icon: string;
  terrain: string;
  minLevel: number;
  maxPlayers: number;
  isPvp: boolean;
  isSafeZone: boolean;
  connectedMaps: string[];
  zones: Zone[];
  spawns: SpawnInfo[];
  npcs: string[];
  pvpRules?: Record<string, unknown>;
}

interface TerrainType {
  id: string;
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

interface RegionInfo {
  id: string;
  nameKo: string;
  nameEn: string;
  levelRange: [number, number];
  description: string;
}

interface Metadata {
  terrainTypes: Record<string, TerrainType>;
  regions: Record<string, RegionInfo>;
  spawnTypes: Record<string, unknown>;
  bossSchedulePresets: Record<string, unknown>;
  zoneTypes: Record<string, unknown>;
}

// ============ 메인 함수 ============

async function main(): Promise<void> {
  console.log("🗺️  맵 데이터 생성 시작...\n");

  // 메타데이터 로드
  const metadataPath = path.join(MAPS_DIR, "metadata.json");
  if (!fs.existsSync(metadataPath)) {
    console.error("❌ metadata.json 파일을 찾을 수 없습니다.");
    process.exit(1);
  }

  const metadata: Metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  console.log(`📋 메타데이터 로드 완료`);
  console.log(`   - 지형 타입: ${Object.keys(metadata.terrainTypes).length}개`);
  console.log(`   - 리전: ${Object.keys(metadata.regions).length}개`);
  console.log(`   - 스폰 타입: ${Object.keys(metadata.spawnTypes).length}개\n`);

  const maps: OutputMap[] = [];
  const summary = {
    total: 0,
    byRegion: {} as Record<string, number>,
    byTerrain: {} as Record<string, number>,
    safeZones: 0,
    combatZones: 0,
    pvpZones: 0,
    totalZones: 0,
    totalSpawns: 0,
    bossSpawns: 0,
  };

  // 리전별로 처리
  for (const region of REGIONS) {
    const regionDir = path.join(MAPS_DIR, region);
    if (!fs.existsSync(regionDir)) {
      console.log(`⚠️  ${region} 폴더가 없습니다. 건너뜁니다.`);
      continue;
    }

    console.log(`📁 ${region} 리전 처리 중...`);

    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));
    let regionMapCount = 0;

    for (const file of files) {
      const filePath = path.join(regionDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const mapSource: MapSource = JSON.parse(content);

        // 유효성 검사
        if (!mapSource.id || !mapSource.nameKo) {
          console.log(`   ⚠️  ${file}: id 또는 nameKo가 없습니다. 건너뜁니다.`);
          continue;
        }

        // 맵 변환
        const outputMap: OutputMap = {
          id: mapSource.id,
          region: mapSource.region || region,
          nameKo: mapSource.nameKo,
          nameEn: mapSource.nameEn,
          descriptionKo: mapSource.descriptionKo,
          descriptionEn: mapSource.descriptionEn,
          icon: mapSource.icon,
          terrain: mapSource.terrain,
          minLevel: mapSource.minLevel,
          maxPlayers: mapSource.maxPlayers,
          isPvp: mapSource.isPvp,
          isSafeZone: mapSource.isSafeZone,
          connectedMaps: mapSource.connectedMaps,
          zones: mapSource.zones || [],
          spawns: mapSource.spawns || [],
          npcs: mapSource.npcs || [],
        };

        if (mapSource.pvpRules) {
          outputMap.pvpRules = mapSource.pvpRules;
        }

        maps.push(outputMap);
        regionMapCount++;

        // 통계 업데이트
        summary.total++;
        summary.byRegion[region] = (summary.byRegion[region] || 0) + 1;
        summary.byTerrain[mapSource.terrain] =
          (summary.byTerrain[mapSource.terrain] || 0) + 1;

        if (mapSource.isSafeZone) summary.safeZones++;
        else summary.combatZones++;
        if (mapSource.isPvp) summary.pvpZones++;

        summary.totalZones += mapSource.zones?.length || 0;
        summary.totalSpawns += mapSource.spawns?.length || 0;
        summary.bossSpawns +=
          mapSource.spawns?.filter((s) => s.spawnType === "boss").length || 0;

        console.log(
          `   ✓ ${file}: ${mapSource.nameKo} (${mapSource.zones?.length || 0}개 구역, ${mapSource.spawns?.length || 0}개 스폰)`
        );
      } catch (err) {
        console.error(`   ❌ ${file} 로드 실패:`, err);
      }
    }

    console.log(`   → ${regionMapCount}개 맵 처리됨\n`);
  }

  // 연결 유효성 검사
  console.log("🔗 맵 연결 유효성 검사 중...");
  const mapIds = new Set(maps.map((m) => m.id));
  let connectionErrors = 0;

  for (const map of maps) {
    for (const connectedId of map.connectedMaps) {
      if (!mapIds.has(connectedId)) {
        console.log(
          `   ⚠️  ${map.id}의 연결맵 '${connectedId}'가 존재하지 않습니다.`
        );
        connectionErrors++;
      }
    }
  }

  if (connectionErrors === 0) {
    console.log("   ✓ 모든 맵 연결이 유효합니다.\n");
  } else {
    console.log(`   ⚠️  ${connectionErrors}개의 연결 문제가 있습니다.\n`);
  }

  // 출력 파일 생성
  const output = {
    version: "2.0.0",
    generatedAt: new Date().toISOString(),
    maps,
    summary,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  // 결과 출력
  console.log("═".repeat(50));
  console.log("✅ 생성 완료!");
  console.log(`   📍 총 ${summary.total}개 맵`);
  console.log(`   🏠 안전 지역: ${summary.safeZones}개`);
  console.log(`   ⚔️  전투 지역: ${summary.combatZones}개`);
  console.log(`   🎯 PvP 지역: ${summary.pvpZones}개`);
  console.log(`   📦 총 구역: ${summary.totalZones}개`);
  console.log(`   👹 총 스폰: ${summary.totalSpawns}개`);
  console.log(`   👑 보스 스폰: ${summary.bossSpawns}개`);
  console.log("");
  console.log("   리전별:");
  for (const [region, count] of Object.entries(summary.byRegion)) {
    const regionInfo = metadata.regions[region];
    console.log(`     - ${regionInfo?.nameKo || region}: ${count}개`);
  }
  console.log("");
  console.log("   지형별:");
  for (const [terrain, count] of Object.entries(summary.byTerrain)) {
    const terrainInfo = metadata.terrainTypes[terrain];
    console.log(`     - ${terrainInfo?.nameKo || terrain}: ${count}개`);
  }
  console.log("");
  console.log(`📄 출력 파일: ${OUTPUT_FILE}`);
}

main().catch(console.error);
