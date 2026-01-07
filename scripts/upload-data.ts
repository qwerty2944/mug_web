/**
 * Supabase Storage에 게임 데이터 JSON 업로드
 * 사용법: npm run upload-data
 *
 * 환경변수:
 * - NEXT_PUBLIC_SUPABASE_URL (필수)
 * - SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// .env.local 수동 로드
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join("=");
        }
      }
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("환경변수 필요: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = "game-data";
const STORAGE_PATH = "mappings";

const DATA_FILES = [
  "items.json",
  "monsters.json",
  "skills.json",
  "maps.json",
  "spells.json",
  "religions.json",
];

async function uploadFile(fileName: string) {
  const localPath = path.join(process.cwd(), "public", "data", fileName);

  if (!fs.existsSync(localPath)) {
    console.log(`  [SKIP] ${fileName} - 파일 없음`);
    return;
  }

  const fileContent = fs.readFileSync(localPath);
  const storagePath = `${STORAGE_PATH}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileContent, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    console.error(`  [ERROR] ${fileName}:`, error.message);
  } else {
    console.log(`  [OK] ${fileName} 업로드 완료`);
  }
}

async function main() {
  console.log(`\n📦 Supabase Storage 업로드 (${BUCKET_NAME}/${STORAGE_PATH}/)\n`);

  for (const file of DATA_FILES) {
    await uploadFile(file);
  }

  console.log("\n✅ 완료\n");
}

main();
