/**
 * NPC JSON 파일들을 읽어서 통합 JSON 생성
 *
 * 폴더 구조:
 *   public/data/npcs/
 *   ├── healers.json      # 치료사 NPC
 *   ├── merchants.json    # 상인 NPC
 *   ├── trainers.json     # 훈련사 NPC
 *   └── quests.json       # 퀘스트 NPC
 *
 * 출력:
 *   public/data/npcs/npcs.json (모든 NPC 통합)
 *
 * 사용법: npx tsx scripts/generate-npcs.ts
 */

import fs from "fs";
import path from "path";

// 경로 설정
const NPCS_DIR = "public/data/npcs";
const OUTPUT_FILE = path.join(NPCS_DIR, "npcs.json");

// NPC 타입별 소스 파일
const SOURCE_FILES = [
  "healers.json",
  "merchants.json",
  "trainers.json",
  "quests.json",
];

interface NpcSource {
  type: string;
  description?: string;
  npcs: NpcItem[];
}

interface NpcItem {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string;
  mapId: string;
  description: string;
  dialogues?: Record<string, string>;
  services?: Record<string, unknown>;
  [key: string]: unknown;
}

interface OutputNpc extends NpcItem {
  type: string;
}

function main() {
  console.log("=== NPC JSON 생성 시작 ===\n");

  const allNpcs: OutputNpc[] = [];
  const stats: Record<string, number> = {};

  for (const file of SOURCE_FILES) {
    const filePath = path.join(NPCS_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ ${file} 없음, 건너뜀`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const source: NpcSource = JSON.parse(content);

      if (!source.npcs || !Array.isArray(source.npcs)) {
        console.log(`  ⚠️ ${file}: npcs 배열 없음`);
        continue;
      }

      const npcType = source.type || file.replace(".json", "");
      console.log(`  ✓ ${file}: ${source.npcs.length}개 (${npcType})`);

      for (const npc of source.npcs) {
        allNpcs.push({
          ...npc,
          type: npcType,
        });
      }

      stats[npcType] = source.npcs.length;
    } catch (error) {
      console.error(`  ✗ ${file} 처리 실패:`, error);
    }
  }

  // 통합 파일 생성
  const output = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    totalCount: allNpcs.length,
    statistics: stats,
    npcs: allNpcs,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

  console.log(`\n=== 생성 완료 ===`);
  for (const [type, count] of Object.entries(stats)) {
    console.log(`  ${type}: ${count}개`);
  }
  console.log(`  총: ${allNpcs.length}개`);
  console.log(`\n  출력: ${OUTPUT_FILE}`);
}

main();
