/**
 * 몬스터 JSON 파일들을 읽어서 통합 JSON 생성
 *
 * 폴더 구조:
 *   public/data/monsters/
 *   ├── amorphous/     # 무정형 (슬라임 등)
 *   ├── beasts/        # 야수 (늑대, 다람쥐 등)
 *   ├── constructs/    # 구조물 (허수아비, 골렘 등)
 *   ├── humanoids/     # 인간형 (도적 등)
 *   ├── insects/       # 곤충 (거미 등)
 *   ├── plants/        # 식물
 *   ├── spirits/       # 정령
 *   ├── undead/        # 언데드
 *   └── metadata.json
 *
 * 출력:
 *   public/data/monsters/monsters.json
 *
 * 사용법: npx tsx scripts/generate-monsters.ts
 */

import fs from "fs";
import path from "path";

// 경로 설정
const MONSTERS_DIR = "public/data/monsters";

interface MonsterSource {
  type: string;
  category: string;
  monsters: Record<string, unknown>[];
}

// 몬스터 타입별 폴더
const MONSTER_TYPES = [
  "amorphous",
  "beasts",
  "constructs",
  "humanoids",
  "insects",
  "plants",
  "spirits",
  "undead",
];

function processMonsters(): {
  items: Record<string, unknown>[];
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byMapId: Record<string, number>;
} {
  const items: Record<string, unknown>[] = [];
  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byMapId: Record<string, number> = {};

  for (const monsterType of MONSTER_TYPES) {
    const typeDir = path.join(MONSTERS_DIR, monsterType);

    if (!fs.existsSync(typeDir)) {
      console.log(`  ⚠️ ${monsterType}/ 폴더 없음`);
      continue;
    }

    console.log(`  📂 ${monsterType}/`);

    const files = fs.readdirSync(typeDir).filter(
      (f) => f.endsWith(".json") && f !== "metadata.json"
    );

    for (const file of files) {
      const filePath = path.join(typeDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const source: MonsterSource = JSON.parse(content);

        if (!source.monsters || !Array.isArray(source.monsters)) continue;

        console.log(`    ${file}: ${source.monsters.length}개 (${source.category})`);

        for (const monster of source.monsters) {
          const monsterWithType = {
            ...monster,
            type: source.type,
            category: source.category,
          };
          items.push(monsterWithType);

          // 통계
          byType[source.type] = (byType[source.type] || 0) + 1;
          byCategory[source.category] = (byCategory[source.category] || 0) + 1;

          // mapIds 배열 처리
          const mapIds = (monster as { mapIds?: string[] }).mapIds || ["unknown"];
          for (const mapId of mapIds) {
            byMapId[mapId] = (byMapId[mapId] || 0) + 1;
          }
        }
      } catch (err) {
        console.error(`    ❌ ${file} 로드 실패:`, err);
      }
    }
  }

  return { items, byType, byCategory, byMapId };
}

// 기존 metadata 로드
function loadMetadata(): Record<string, unknown> {
  const metadataPath = path.join(MONSTERS_DIR, "metadata.json");
  if (fs.existsSync(metadataPath)) {
    try {
      const content = fs.readFileSync(metadataPath, "utf8");
      return JSON.parse(content);
    } catch {
      console.log("  ⚠️ metadata.json 로드 실패, 기본값 사용");
    }
  }
  return {};
}

// 메인 함수
async function main(): Promise<void> {
  console.log("🔧 몬스터 데이터 생성 시작...\n");

  console.log("📁 몬스터 폴더 처리 중...");
  const result = processMonsters();
  const metadata = loadMetadata();

  if (result.items.length > 0) {
    const output = {
      version: "2.0.0",
      generatedAt: new Date().toISOString(),
      metadata,
      monsters: result.items,
      summary: {
        total: result.items.length,
        byType: result.byType,
        byCategory: result.byCategory,
        byMapId: result.byMapId,
      },
    };

    const outputPath = path.join(MONSTERS_DIR, "monsters.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n  ✅ monsters.json: ${result.items.length}개 몬스터\n`);
  }

  console.log("═".repeat(50));
  console.log(`✅ 생성 완료!`);
  console.log(`   총 몬스터: ${result.items.length}개`);
  console.log(`   타입별:`, result.byType);
  console.log(`   카테고리별:`, result.byCategory);
}

main().catch(console.error);
