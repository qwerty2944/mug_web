/**
 * 종족 JSON 파일들을 읽어서 통합 JSON 생성
 *
 * 폴더 구조:
 *   public/data/appearance/races/
 *   ├── humans/*.json
 *   ├── elves/*.json
 *   ├── dwarves/*.json
 *   ├── orcs/*.json
 *   ├── undead/*.json
 *   ├── others/*.json
 *   └── appearance/         (외형 데이터 - 별도 처리)
 *
 * 출력:
 *   public/data/appearance/races/races.json
 *
 * 사용법: npx tsx scripts/generate-races.ts
 */

import fs from "fs";
import path from "path";

// 경로 설정
const RACES_DIR = "public/data/appearance/races";
const OUTPUT_FILE = "public/data/appearance/races/races.json";

// 종족 카테고리 (appearance 제외)
const RACE_FOLDERS = ["humans", "elves", "dwarves", "orcs", "undead", "others"];

interface Race {
  id: string;
  category: string;
  nameKo: string;
  nameEn: string;
  description: string;
  lore?: string;
  traits?: {
    innate?: string[];
    optional?: string[];
  };
  statModifiers?: Record<string, number>;
  appearance?: Record<string, unknown>;
  resistances?: Record<string, number>;
  abilities?: Record<string, unknown>;
  startingLocation?: string;
  languages?: string[];
  lifespan?: {
    adult?: number;
    middle?: number;
    old?: number;
    max?: number;
  };
  playable?: boolean;
}

// 메인 함수
async function main(): Promise<void> {
  console.log("🔧 종족 데이터 생성 시작...\n");

  const allRaces: Race[] = [];
  const summary = {
    total: 0,
    byCategory: {} as Record<string, number>,
    playable: 0,
    nonPlayable: 0,
  };

  // 각 종족 폴더 처리
  for (const folder of RACE_FOLDERS) {
    const fullDir = path.join(RACES_DIR, folder);
    if (!fs.existsSync(fullDir)) {
      console.log(`  ⚠️ ${folder}/ 폴더 없음`);
      continue;
    }

    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".json"));
    if (files.length === 0) {
      console.log(`  ⚠️ ${folder}/ 파일 없음`);
      continue;
    }

    console.log(`📁 ${folder}/ 처리 중...`);

    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const race: Race = JSON.parse(content);

        // playable 기본값 설정
        if (race.playable === undefined) {
          race.playable = true;
        }

        allRaces.push(race);
        console.log(`    ${file}: ${race.nameKo} (${race.nameEn})`);

        // 통계 업데이트
        const category = race.category || folder;
        summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
        if (race.playable) {
          summary.playable++;
        } else {
          summary.nonPlayable++;
        }
      } catch (err) {
        console.error(`    ❌ ${file} 로드 실패:`, err);
      }
    }
    console.log();
  }

  // 통계 업데이트
  summary.total = allRaces.length;

  // 출력 JSON 생성
  const output = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    races: allRaces,
    summary,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log("═".repeat(50));
  console.log(`✅ 생성 완료: ${OUTPUT_FILE}`);
  console.log(`   총 ${summary.total}개 종족`);
  console.log(`   플레이 가능: ${summary.playable}개`);
  console.log(`   NPC 전용: ${summary.nonPlayable}개`);
  console.log(`   카테고리별:`, summary.byCategory);
}

main().catch(console.error);
