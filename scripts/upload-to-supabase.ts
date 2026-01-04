import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://krwmncolecywlkmlviqu.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error("Error: SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
  console.error("Set it in .env.local or pass as environment variable");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadFile(localPath: string, storagePath: string) {
  const content = fs.readFileSync(localPath);

  const { data, error } = await supabase.storage
    .from("game-data")
    .upload(storagePath, content, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    console.error(`Failed to upload ${storagePath}:`, error.message);
    return false;
  }

  console.log(`Uploaded ${storagePath}`);
  return true;
}

async function main() {
  const dataDir = path.join(__dirname, "../public/data");

  // 버킷 존재 확인/생성
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === "game-data");

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket("game-data", {
      public: true,
    });
    if (error) {
      console.error("Failed to create bucket:", error.message);
      // 버킷 생성 권한 없을 수 있음, 계속 진행
    } else {
      console.log("Created bucket: game-data");
    }
  }

  // 파일 업로드
  const files = ["body-mapping.json", "all-sprites.json"];

  for (const file of files) {
    const localPath = path.join(dataDir, file);
    if (fs.existsSync(localPath)) {
      await uploadFile(localPath, `mappings/${file}`);
    } else {
      console.warn(`File not found: ${localPath}`);
    }
  }

  // Public URL 출력
  console.log("\nPublic URLs:");
  for (const file of files) {
    const { data } = supabase.storage.from("game-data").getPublicUrl(`mappings/${file}`);
    console.log(`  ${file}: ${data.publicUrl}`);
  }
}

main().catch(console.error);
