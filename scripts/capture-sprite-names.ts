import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

interface SpriteCounts {
  bodyCount: number;
  eyeCount: number;
  hairCount: number;
  clothCount: number;
  armorCount: number;
  pantCount: number;
  helmetCount: number;
  backCount: number;
  swordCount: number;
  shieldCount: number;
  bodyNames: string[];
  eyeNames: string[];
  hairNames: string[];
  clothNames: string[];
  armorNames: string[];
}

// 종족 이름 매핑 (파일명 -> 한글/영문 이름)
const raceNameMap: Record<string, { ko: string; en: string; race: string }> = {
  // Legacy Human
  Human_1: { ko: "인간 1", en: "Human 1", race: "Human" },
  Human_2: { ko: "인간 2", en: "Human 2", race: "Human" },
  Human_3: { ko: "인간 3", en: "Human 3", race: "Human" },
  Human_4: { ko: "인간 4", en: "Human 4", race: "Human" },
  Human_5: { ko: "인간 5", en: "Human 5", race: "Human" },
  // Legacy Elf
  Elf_1: { ko: "엘프 1", en: "Elf 1", race: "Elf" },
  Elf_2: { ko: "엘프 2", en: "Elf 2", race: "Elf" },
  // New Elf
  New_Elf_1: { ko: "하이엘프 1", en: "High Elf 1", race: "HighElf" },
  New_Elf_2: { ko: "하이엘프 2", en: "High Elf 2", race: "HighElf" },
  // Legacy Orc
  Orc_1: { ko: "오크 1", en: "Orc 1", race: "Orc" },
  Orc_2: { ko: "오크 2", en: "Orc 2", race: "Orc" },
  Orc_3: { ko: "오크 3", en: "Orc 3", race: "Orc" },
  Orc_4: { ko: "오크 4", en: "Orc 4", race: "Orc" },
  // Undead
  Zombie_1: { ko: "좀비 1", en: "Zombie 1", race: "Zombie" },
  Zombie_2: { ko: "좀비 2", en: "Zombie 2", race: "Zombie" },
  Zombie_3: { ko: "좀비 3", en: "Zombie 3", race: "Zombie" },
  Zombie_4: { ko: "좀비 4", en: "Zombie 4", race: "Zombie" },
  Zombie_5: { ko: "좀비 5", en: "Zombie 5", race: "Zombie" },
  Zombie_6: { ko: "좀비 6", en: "Zombie 6", race: "Zombie" },
  // Skeleton
  Skelton_1: { ko: "스켈레톤 1", en: "Skeleton 1", race: "Skeleton" },
  // Devil
  Devil_1: { ko: "데빌 1", en: "Devil 1", race: "Devil" },
};

async function main() {
  console.log("Starting Playwright to capture sprite names...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Unity 이벤트 캡처를 위한 Promise
  const spriteDataPromise = new Promise<SpriteCounts>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout waiting for Unity sprites to load"));
    }, 60000); // 60초 타임아웃

    page.exposeFunction("onSpritesLoaded", (data: SpriteCounts) => {
      clearTimeout(timeout);
      resolve(data);
    });
  });

  // 페이지에 이벤트 리스너 추가
  await page.addInitScript(() => {
    window.addEventListener("unitySpritesLoaded", (e: Event) => {
      const customEvent = e as CustomEvent<unknown>;
      (window as unknown as { onSpritesLoaded: (data: unknown) => void }).onSpritesLoaded(
        customEvent.detail
      );
    });
  });

  console.log("Navigating to Unity test page...");
  await page.goto("http://localhost:3000/character-setting", { waitUntil: "networkidle" });

  console.log("Waiting for Unity to load sprites...");
  const spriteData = await spriteDataPromise;

  console.log(`Captured ${spriteData.bodyNames?.length || 0} body names`);
  console.log("Body names:", spriteData.bodyNames);

  // 인덱스 매핑 생성
  const bodyMapping = (spriteData.bodyNames || []).map((name, index) => {
    const info = raceNameMap[name] || {
      ko: name,
      en: name,
      race: "Unknown",
    };
    return {
      index,
      fileName: name,
      ...info,
    };
  });

  const result = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    bodies: bodyMapping,
    summary: {
      total: bodyMapping.length,
      byRace: bodyMapping.reduce(
        (acc, body) => {
          acc[body.race] = (acc[body.race] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
  };

  // JSON 파일로 저장
  const outputDir = path.join(__dirname, "../public/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "body-mapping.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Saved body mapping to ${outputPath}`);

  // 전체 스프라이트 데이터도 저장
  const allSpritesPath = path.join(outputDir, "all-sprites.json");
  fs.writeFileSync(allSpritesPath, JSON.stringify(spriteData, null, 2));
  console.log(`Saved all sprites data to ${allSpritesPath}`);

  await browser.close();
  console.log("Done!");
}

main().catch(console.error);
