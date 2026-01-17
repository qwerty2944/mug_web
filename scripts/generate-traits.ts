/**
 * 특성 JSON 파일을 읽어서 통합 JSON 생성
 *
 * 폴더 구조:
 *   public/data/traits/
 *   └── traits.json       # 모든 특성 정의
 *
 * 출력:
 *   public/data/traits/traits-generated.json (정규화된 특성 데이터)
 *
 * 사용법: npx tsx scripts/generate-traits.ts
 */

import fs from "fs";
import path from "path";

// 경로 설정
const TRAITS_DIR = "public/data/traits";
const SOURCE_FILE = path.join(TRAITS_DIR, "traits.json");
const OUTPUT_FILE = path.join(TRAITS_DIR, "traits-generated.json");

interface TraitItem {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  effects?: Record<string, unknown>;
  requirements?: unknown[];
  conflicts?: unknown[];
  hidden?: boolean;
}

interface TraitSource {
  traits: TraitItem[];
}

function main() {
  console.log("=== 특성 JSON 생성 시작 ===\n");

  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`  ✗ ${SOURCE_FILE} 파일이 없습니다.`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(SOURCE_FILE, "utf8");
    const source: TraitSource = JSON.parse(content);

    if (!source.traits || !Array.isArray(source.traits)) {
      console.error("  ✗ traits 배열이 없습니다.");
      process.exit(1);
    }

    // 카테고리별/희귀도별 통계
    const byCategory: Record<string, number> = {};
    const byRarity: Record<string, number> = {};

    for (const trait of source.traits) {
      byCategory[trait.category] = (byCategory[trait.category] || 0) + 1;
      byRarity[trait.rarity] = (byRarity[trait.rarity] || 0) + 1;
    }

    // 통합 파일 생성
    const output = {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      totalCount: source.traits.length,
      statistics: {
        byCategory,
        byRarity,
      },
      traits: source.traits,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

    console.log(`  ✓ traits.json: ${source.traits.length}개 특성`);
    console.log(`\n=== 생성 완료 ===`);
    console.log(`  카테고리별:`);
    for (const [cat, count] of Object.entries(byCategory)) {
      console.log(`    ${cat}: ${count}개`);
    }
    console.log(`  희귀도별:`);
    for (const [rarity, count] of Object.entries(byRarity)) {
      console.log(`    ${rarity}: ${count}개`);
    }
    console.log(`  총: ${source.traits.length}개`);
    console.log(`\n  출력: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("  ✗ 처리 실패:", error);
    process.exit(1);
  }
}

main();
