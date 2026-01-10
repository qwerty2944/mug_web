"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DynamicUnityCanvas, useAppearanceStore } from "@/features/character";

interface SpriteItem {
  id: string;
  index: number;
  sprite: string;
  ko: string;
  en?: string;
  style?: string;
  race?: string;
  type?: string;
}

type CategoryData = {
  label: string;
  items: SpriteItem[];
  unityMethod: string;
  allowNone?: boolean;
  weaponType?: string;
  hand?: "left" | "right";
};

// 스프라이트 배열을 아이템 배열로 변환
function spritesToItems(sprites: string[]): SpriteItem[] {
  return sprites.map((sprite, index) => ({
    id: sprite.toLowerCase(),
    index,
    sprite,
    ko: sprite.replace(/_/g, " "),
  }));
}

export default function SpriteTestPage() {
  const router = useRouter();
  const { callUnity, characterState, clearAll } = useAppearanceStore();
  const [categories, setCategories] = useState<Record<string, CategoryData>>({});
  const [loading, setLoading] = useState(true);

  // 페이지 진입 시 Unity 상태 초기화 (장비 + 외형)
  useEffect(() => {
    clearAll();
    // 외형도 기본값으로 초기화
    callUnity("JS_SetBody", "0");
    callUnity("JS_SetHair", "-1");
    callUnity("JS_SetFacehair", "-1");
  }, [clearAll, callUnity]);

  useEffect(() => {
    async function loadMappings() {
      try {
        const [
          eyeRes, hairRes, facehairRes, bodyRes,
          swordRes, axeRes, bowRes, shieldRes, spearRes, wandRes, daggerRes,
          helmetRes, armorRes, clothRes, pantRes, backRes,
        ] = await Promise.all([
          fetch("/data/sprites/appearance/eye.json"),
          fetch("/data/sprites/appearance/hair.json"),
          fetch("/data/sprites/appearance/facehair.json"),
          fetch("/data/sprites/appearance/body.json"),
          fetch("/data/sprites/equipment/weapons/sword.json"),
          fetch("/data/sprites/equipment/weapons/axe.json"),
          fetch("/data/sprites/equipment/weapons/bow.json"),
          fetch("/data/sprites/equipment/weapons/shield.json"),
          fetch("/data/sprites/equipment/weapons/spear.json"),
          fetch("/data/sprites/equipment/weapons/wand.json"),
          fetch("/data/sprites/equipment/weapons/dagger.json"),
          fetch("/data/sprites/equipment/armor/helmet.json"),
          fetch("/data/sprites/equipment/armor/armor.json"),
          fetch("/data/sprites/equipment/armor/cloth.json"),
          fetch("/data/sprites/equipment/armor/pant.json"),
          fetch("/data/sprites/equipment/armor/back.json"),
        ]);

        const [
          eyeData, hairData, facehairData, bodyData,
          swordData, axeData, bowData, shieldData, spearData, wandData, daggerData,
          helmetData, armorData, clothData, pantData, backData,
        ] = await Promise.all([
          eyeRes.json(), hairRes.json(), facehairRes.json(), bodyRes.json(),
          swordRes.json(), axeRes.json(), bowRes.json(), shieldRes.json(),
          spearRes.json(), wandRes.json(), daggerRes.json(),
          helmetRes.json(), armorRes.json(), clothRes.json(), pantRes.json(), backRes.json(),
        ]);

        setCategories({
          // 외형 - items 배열 사용
          body: { label: "신체", items: bodyData.bodies || spritesToItems(bodyData.sprites || []), unityMethod: "JS_SetBody" },
          eye: { label: "눈", items: eyeData.eyes || spritesToItems(eyeData.sprites || []), unityMethod: "JS_SetEye" },
          hair: { label: "머리", items: hairData.hairs || spritesToItems(hairData.sprites || []), unityMethod: "JS_SetHair", allowNone: true },
          facehair: { label: "수염/장식", items: facehairData.facehairs || spritesToItems(facehairData.sprites || []), unityMethod: "JS_SetFacehair", allowNone: true },
          // 무기 - sprites 배열에서 변환
          sword: { label: "검", items: spritesToItems(swordData.sprites || []), unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Sword", hand: "right" },
          axe: { label: "도끼", items: spritesToItems(axeData.sprites || []), unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Axe", hand: "right" },
          bow: { label: "활", items: spritesToItems(bowData.sprites || []), unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Bow", hand: "right" },
          shield: { label: "방패", items: spritesToItems(shieldData.sprites || []), unityMethod: "JS_SetLeftWeapon", allowNone: true, weaponType: "Shield", hand: "left" },
          spear: { label: "창", items: spritesToItems(spearData.sprites || []), unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Spear", hand: "right" },
          wand: { label: "지팡이", items: spritesToItems(wandData.sprites || []), unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Wand", hand: "right" },
          dagger: { label: "단검", items: spritesToItems(daggerData.sprites || []), unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Dagger", hand: "right" },
          // 방어구 - sprites 배열에서 변환
          helmet: { label: "투구", items: spritesToItems(helmetData.sprites || []), unityMethod: "JS_SetHelmet", allowNone: true },
          armor: { label: "갑옷", items: spritesToItems(armorData.sprites || []), unityMethod: "JS_SetArmor", allowNone: true },
          cloth: { label: "옷", items: spritesToItems(clothData.sprites || []), unityMethod: "JS_SetCloth", allowNone: true },
          pant: { label: "바지", items: spritesToItems(pantData.sprites || []), unityMethod: "JS_SetPant", allowNone: true },
          back: { label: "등", items: spritesToItems(backData.sprites || []), unityMethod: "JS_SetBack", allowNone: true },
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to load mappings:", err);
        setLoading(false);
      }
    }

    loadMappings();
  }, []);

  const handleSelect = (category: string, index: number) => {
    const data = categories[category];
    if (!data) return;

    if (data.weaponType) {
      const param = index === -1 ? `${data.weaponType},-1` : `${data.weaponType},${index}`;
      callUnity(data.unityMethod, param);
    } else {
      callUnity(data.unityMethod, index.toString());
    }
  };

  const getCurrentIndex = (category: string): number => {
    if (!characterState) return -1;
    const indexKey = `${category}Index` as keyof typeof characterState;
    return (characterState[indexKey] as number) ?? -1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>매핑 데이터 로딩 중...</p>
      </div>
    );
  }

  const appearanceCategories = ["body", "eye", "hair", "facehair"];
  const weaponCategories = ["sword", "axe", "bow", "shield", "spear", "wand", "dagger"];
  const armorCategories = ["helmet", "armor", "cloth", "pant", "back"];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md aspect-square">
            <DynamicUnityCanvas />
          </div>
        </div>

        <div className="w-96 bg-gray-800 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">스프라이트 테스트</h1>
            <button
              onClick={() => router.push("/test")}
              className="text-sm text-gray-400 hover:text-white px-3 py-2"
            >
              ← 목록
            </button>
          </div>

          {/* 외형 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">외형</h2>
            <div className="space-y-3">
              {appearanceCategories.map((cat) => {
                const data = categories[cat];
                if (!data) return null;
                const currentIndex = getCurrentIndex(cat);

                return (
                  <div key={cat}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {data.label} ({data.items.length}개)
                    </label>
                    <select
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      value={currentIndex}
                      onChange={(e) => handleSelect(cat, parseInt(e.target.value))}
                    >
                      {data.allowNone && <option value={-1}>없음</option>}
                      {data.items.map((item) => (
                        <option key={item.index} value={item.index}>
                          {item.ko} [{item.index}]
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 무기 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">무기</h2>
            <div className="space-y-3">
              {weaponCategories.map((cat) => {
                const data = categories[cat];
                if (!data) return null;
                const currentIndex = getCurrentIndex(cat);

                return (
                  <div key={cat}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {data.label} ({data.items.length}개) {data.hand === "left" ? "🛡️" : "⚔️"}
                    </label>
                    <select
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      value={currentIndex}
                      onChange={(e) => handleSelect(cat, parseInt(e.target.value))}
                    >
                      {data.allowNone && <option value={-1}>없음</option>}
                      {data.items.map((item) => (
                        <option key={item.index} value={item.index}>
                          {item.ko} [{item.index}]
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 방어구 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">방어구</h2>
            <div className="space-y-3">
              {armorCategories.map((cat) => {
                const data = categories[cat];
                if (!data) return null;
                const currentIndex = getCurrentIndex(cat);

                return (
                  <div key={cat}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {data.label} ({data.items.length}개)
                    </label>
                    <select
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      value={currentIndex}
                      onChange={(e) => handleSelect(cat, parseInt(e.target.value))}
                    >
                      {data.allowNone && <option value={-1}>없음</option>}
                      {data.items.map((item) => (
                        <option key={item.index} value={item.index}>
                          {item.ko} [{item.index}]
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 현재 상태 디버그 */}
          <section className="mt-4 p-3 bg-gray-900 rounded text-xs font-mono">
            <h3 className="text-gray-400 mb-2">현재 상태</h3>
            <pre className="text-gray-500 overflow-auto max-h-40">
              {JSON.stringify(characterState, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
