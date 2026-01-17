/**
 * 상태이상 JSON 파일들을 읽어서 통합 JSON 생성
 *
 * 폴더 구조:
 *   public/data/status/
 *   ├── buffs.json         # 버프 7종
 *   ├── debuffs.json       # 디버프 8종
 *   ├── injuries.json      # 부상 3종
 *   └── metadata.json      # 메타데이터
 *
 * 출력:
 *   public/data/status/statuses.json (모든 상태 통합)
 *
 * 사용법: npx tsx scripts/generate-statuses.ts
 */

import fs from "fs";
import path from "path";

// 경로 설정
const STATUS_DIR = "public/data/status";
const OUTPUT_FILE = path.join(STATUS_DIR, "statuses.json");

interface StatusSource {
  category: string;
  statuses: Record<string, unknown>[];
}

interface StatusEntry {
  id: string;
  category: string;
  [key: string]: unknown;
}

function main() {
  console.log("=== 상태이상 JSON 생성 시작 ===\n");

  const allStatuses: StatusEntry[] = [];
  const stats = {
    buff: 0,
    debuff: 0,
    injury: 0,
  };

  // 각 카테고리 파일 처리
  const sourceFiles = ["buffs.json", "debuffs.json", "injuries.json"];

  for (const file of sourceFiles) {
    const filePath = path.join(STATUS_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ ${file} 없음, 건너뜀`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const source: StatusSource = JSON.parse(content);

      if (!source.statuses || !Array.isArray(source.statuses)) {
        console.log(`  ⚠️ ${file}: statuses 배열 없음`);
        continue;
      }

      console.log(`  ✓ ${file}: ${source.statuses.length}개 (${source.category})`);

      for (const status of source.statuses) {
        allStatuses.push(status as StatusEntry);
        const category = source.category as keyof typeof stats;
        if (category in stats) {
          stats[category]++;
        }
      }
    } catch (error) {
      console.error(`  ✗ ${file} 처리 실패:`, error);
    }
  }

  // 통합 파일 생성
  const output = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    totalCount: allStatuses.length,
    statistics: stats,
    statuses: allStatuses,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

  console.log(`\n=== 생성 완료 ===`);
  console.log(`  버프: ${stats.buff}개`);
  console.log(`  디버프: ${stats.debuff}개`);
  console.log(`  부상: ${stats.injury}개`);
  console.log(`  총: ${allStatuses.length}개`);
  console.log(`\n  출력: ${OUTPUT_FILE}`);
}

main();
