/**
 * Supabase Storage 업로드 스크립트
 *
 * 현재 개발 중이므로 비활성화.
 * 프로덕션 배포 시 `npm run upload-data`로 실행.
 *
 * 사용법:
 *   npm run upload-data
 *
 * 업로드 대상:
 *   public/data/ 하위의 모든 JSON 파일
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const BUCKET_NAME = "game-data";
const SOURCE_DIR = path.join(process.cwd(), "public/data");

async function main() {
  console.log("📦 Supabase Storage 업로드");
  console.log(`   버킷: ${BUCKET_NAME}`);
  console.log(`   소스: ${SOURCE_DIR}`);
  console.log("");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ 환경 변수가 설정되지 않았습니다:");
    console.error("   NEXT_PUBLIC_SUPABASE_URL");
    console.error("   SUPABASE_SERVICE_KEY");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // JSON 파일 목록 수집
  const files = collectJsonFiles(SOURCE_DIR);
  console.log(`📁 총 ${files.length}개 파일 발견\n`);

  let successCount = 0;
  let failCount = 0;
  let currentDir = "";

  for (const file of files) {
    const relativePath = path.relative(SOURCE_DIR, file);
    const dir = path.dirname(relativePath);

    // 디렉토리 변경 시 출력
    if (dir !== currentDir) {
      currentDir = dir;
      console.log(`📂 ${dir}/`);
    }

    try {
      const content = fs.readFileSync(file);
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(relativePath, content, {
          contentType: "application/json",
          upsert: true,
        });

      if (error) throw error;

      console.log(`  ✅ ${relativePath}`);
      successCount++;
    } catch (err) {
      console.log(`  ❌ ${relativePath}: ${err}`);
      failCount++;
    }
  }

  console.log("");
  console.log(`🎉 완료: ${successCount}개 성공, ${failCount}개 실패`);
}

function collectJsonFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files.sort();
}

main().catch(console.error);
