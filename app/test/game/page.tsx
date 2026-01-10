"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DynamicUnityCanvas, useAppearanceStore } from "@/features/character";

// ===== 타입 정의 =====
interface EquipmentItem {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  rarity: string;
  spriteId: string;
  stats?: Record<string, unknown>;
  requirements?: Record<string, number>;
}

interface EquipmentCategory {
  items: EquipmentItem[];
  spriteMapping: string;
  weaponType?: string;
}

interface Race {
  id: string;
  category: string;
  nameKo: string;
  nameEn: string;
  appearance: {
    body: {
      availableIndices: number[];
      spriteNames: string[];
    };
    eye: {
      availableIndices: number[];
      colors: {
        available: string[];
        default: string;
        values: Record<string, string>;
      };
    };
    hair: {
      availableIndices: number[] | "all";
      colors: {
        available: string[];
        default: string;
        values: Record<string, string>;
      };
    };
    facehair?: {
      availableIndices: number[];
    };
  };
}

interface SpriteMapping {
  sprites: string[];
  nameToIndex: Record<string, number>;
  spriteMap: Record<string, string>;
  idToIndex?: Record<string, number>;
}

interface AppearanceItem {
  id: string;
  index: number;
  sprite: string;
  ko: string;
  race?: string;
}

// DB 저장 형식
interface EquipmentState {
  rightHandId: string | null;
  leftHandId: string | null;
  helmetId: string | null;
  armorId: string | null;
  clothId: string | null;
  pantsId: string | null;
  backId: string | null;
}

interface AppearanceState {
  raceId: string | null;
  hairId: string | null;
  eyeId: string | null;
  facehairId: string | null;
  hairColor: string;
  leftEyeColor: string;
  rightEyeColor: string;
  faceHairColor: string;
}

// Unity가 이해하는 형식 (스프라이트 인덱스 기반)
interface UnityEquipmentState {
  rightHand: { weaponType: string; spriteIndex: number; spriteName: string } | null;
  leftHand: { weaponType: string; spriteIndex: number; spriteName: string } | null;
  helmet: { spriteIndex: number; spriteName: string } | null;
  armor: { spriteIndex: number; spriteName: string } | null;
  cloth: { spriteIndex: number; spriteName: string } | null;
  pants: { spriteIndex: number; spriteName: string } | null;
  back: { spriteIndex: number; spriteName: string } | null;
}

interface UnityAppearanceState {
  bodyIndex: number;
  eyeIndex: number;
  hairIndex: number;
  facehairIndex: number;
  hairColor: string;
  leftEyeColor: string;
  rightEyeColor: string;
  faceHairColor: string;
}

// ===== 슬롯 설정 =====
const WEAPON_CATEGORIES = [
  { key: "sword", label: "검", weaponType: "Sword" },
  { key: "axe", label: "도끼", weaponType: "Axe" },
  { key: "bow", label: "활", weaponType: "Bow" },
  { key: "spear", label: "창", weaponType: "Spear" },
  { key: "wand", label: "지팡이", weaponType: "Wand" },
  { key: "dagger", label: "단검", weaponType: "Dagger" },
];

const EQUIPMENT_SLOTS: { slot: keyof EquipmentState; label: string; category: string; weaponType?: string; hand?: "left" | "right" }[] = [
  { slot: "rightHandId", label: "오른손 (무기)", category: "sword", weaponType: "Sword", hand: "right" },
  { slot: "leftHandId", label: "왼손 (방패)", category: "shield", weaponType: "Shield", hand: "left" },
  { slot: "helmetId", label: "머리", category: "helmet" },
  { slot: "armorId", label: "갑옷", category: "armor" },
  { slot: "clothId", label: "옷", category: "cloth" },
  { slot: "pantsId", label: "다리", category: "pant" },
  { slot: "backId", label: "등", category: "back" },
];

export default function GameTestPage() {
  const router = useRouter();
  const { callUnity, clearAll } = useAppearanceStore();

  // 데이터 로딩 상태
  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");

  // 장비 데이터
  const [equipmentData, setEquipmentData] = useState<Record<string, EquipmentCategory>>({});
  const [spriteMappings, setSpriteMappings] = useState<Record<string, SpriteMapping>>({});

  // 외형 데이터
  const [appearanceData, setAppearanceData] = useState<{
    body: AppearanceItem[];
    eye: AppearanceItem[];
    hair: AppearanceItem[];
    facehair: AppearanceItem[];
  }>({ body: [], eye: [], hair: [], facehair: [] });

  // DB 저장 형식 상태
  const [equipment, setEquipment] = useState<EquipmentState>({
    rightHandId: null,
    leftHandId: null,
    helmetId: null,
    armorId: null,
    clothId: null,
    pantsId: null,
    backId: null,
  });

  // 무기 카테고리 선택
  const [selectedWeaponCategory, setSelectedWeaponCategory] = useState("sword");

  const [appearance, setAppearance] = useState<AppearanceState>({
    raceId: null,
    hairId: null,
    eyeId: null,
    facehairId: null,
    hairColor: "#E5E4E2",
    leftEyeColor: "#4169E1",
    rightEyeColor: "#4169E1",
    faceHairColor: "#8B4513",
  });

  // Unity 상태 (스프라이트 인덱스 기반)
  const [unityEquipment, setUnityEquipment] = useState<UnityEquipmentState>({
    rightHand: null,
    leftHand: null,
    helmet: null,
    armor: null,
    cloth: null,
    pants: null,
    back: null,
  });

  const [unityAppearance, setUnityAppearance] = useState<UnityAppearanceState>({
    bodyIndex: 0,
    eyeIndex: -1,
    hairIndex: -1,
    facehairIndex: -1,
    hairColor: "#E5E4E2",
    leftEyeColor: "#4169E1",
    rightEyeColor: "#4169E1",
    faceHairColor: "#8B4513",
  });

  // 페이지 진입 시 Unity 상태 초기화
  useEffect(() => {
    clearAll();
    callUnity("JS_SetBody", "0");
    callUnity("JS_SetHair", "-1");
    callUnity("JS_SetFacehair", "-1");
  }, [clearAll, callUnity]);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        // 종족 데이터 로드
        const racesRes = await fetch("/data/appearance/races/races.json");
        const racesData = await racesRes.json();
        setRaces(racesData.races || []);
        if (racesData.races?.length > 0) {
          setSelectedRaceId(racesData.races[0].id);
        }

        // 외형 스프라이트 데이터 로드
        const [bodyRes, eyeRes, hairRes, facehairRes] = await Promise.all([
          fetch("/data/sprites/appearance/body.json"),
          fetch("/data/sprites/appearance/eye.json"),
          fetch("/data/sprites/appearance/hair.json"),
          fetch("/data/sprites/appearance/facehair.json"),
        ]);
        const [bodyData, eyeData, hairData, facehairData] = await Promise.all([
          bodyRes.json(),
          eyeRes.json(),
          hairRes.json(),
          facehairRes.json(),
        ]);
        setAppearanceData({
          body: bodyData.bodies || [],
          eye: eyeData.eyes || [],
          hair: hairData.hairs || [],
          facehair: facehairData.facehairs || [],
        });

        // 장비 데이터 로드 (무기 + 방어구)
        const [
          swordsRes, axesRes, bowsRes, spearsRes, wandsRes, daggersRes, shieldsRes,
          helmetsRes, armorsRes, clothsRes, pantsRes, backsRes
        ] = await Promise.all([
          fetch("/data/items/equipment/weapons/swords.json"),
          fetch("/data/items/equipment/weapons/axes.json"),
          fetch("/data/items/equipment/weapons/bows.json"),
          fetch("/data/items/equipment/weapons/spears.json"),
          fetch("/data/items/equipment/weapons/wands.json"),
          fetch("/data/items/equipment/weapons/daggers.json"),
          fetch("/data/items/equipment/weapons/shields.json"),
          fetch("/data/items/equipment/wearables/helmets.json"),
          fetch("/data/items/equipment/wearables/armors.json"),
          fetch("/data/items/equipment/wearables/clothes.json"),
          fetch("/data/items/equipment/wearables/pants.json"),
          fetch("/data/items/equipment/wearables/backs.json"),
        ]);
        const [
          swordsData, axesData, bowsData, spearsData, wandsData, daggersData, shieldsData,
          helmetsData, armorsData, clothsData, pantsData, backsData
        ] = await Promise.all([
          swordsRes.json(), axesRes.json(), bowsRes.json(), spearsRes.json(),
          wandsRes.json(), daggersRes.json(), shieldsRes.json(),
          helmetsRes.json(), armorsRes.json(), clothsRes.json(), pantsRes.json(), backsRes.json(),
        ]);

        setEquipmentData({
          sword: { items: swordsData.items || [], spriteMapping: swordsData.spriteMapping, weaponType: "Sword" },
          axe: { items: axesData.items || [], spriteMapping: axesData.spriteMapping, weaponType: "Axe" },
          bow: { items: bowsData.items || [], spriteMapping: bowsData.spriteMapping, weaponType: "Bow" },
          spear: { items: spearsData.items || [], spriteMapping: spearsData.spriteMapping, weaponType: "Spear" },
          wand: { items: wandsData.items || [], spriteMapping: wandsData.spriteMapping, weaponType: "Wand" },
          dagger: { items: daggersData.items || [], spriteMapping: daggersData.spriteMapping, weaponType: "Dagger" },
          shield: { items: shieldsData.items || [], spriteMapping: shieldsData.spriteMapping, weaponType: "Shield" },
          helmet: { items: helmetsData.items || [], spriteMapping: helmetsData.spriteMapping },
          armor: { items: armorsData.items || [], spriteMapping: armorsData.spriteMapping },
          cloth: { items: clothsData.items || [], spriteMapping: clothsData.spriteMapping },
          pant: { items: pantsData.items || [], spriteMapping: pantsData.spriteMapping },
          back: { items: backsData.items || [], spriteMapping: backsData.spriteMapping },
        });

        // 스프라이트 매핑 로드
        const [
          swordSpriteRes, axeSpriteRes, bowSpriteRes, spearSpriteRes, wandSpriteRes, daggerSpriteRes, shieldSpriteRes,
          helmetSpriteRes, armorSpriteRes, clothSpriteRes, pantSpriteRes, backSpriteRes
        ] = await Promise.all([
          fetch("/data/sprites/equipment/weapons/sword.json"),
          fetch("/data/sprites/equipment/weapons/axe.json"),
          fetch("/data/sprites/equipment/weapons/bow.json"),
          fetch("/data/sprites/equipment/weapons/spear.json"),
          fetch("/data/sprites/equipment/weapons/wand.json"),
          fetch("/data/sprites/equipment/weapons/dagger.json"),
          fetch("/data/sprites/equipment/weapons/shield.json"),
          fetch("/data/sprites/equipment/armor/helmet.json"),
          fetch("/data/sprites/equipment/armor/armor.json"),
          fetch("/data/sprites/equipment/armor/cloth.json"),
          fetch("/data/sprites/equipment/armor/pant.json"),
          fetch("/data/sprites/equipment/armor/back.json"),
        ]);
        const [
          swordSprite, axeSprite, bowSprite, spearSprite, wandSprite, daggerSprite, shieldSprite,
          helmetSprite, armorSprite, clothSprite, pantSprite, backSprite
        ] = await Promise.all([
          swordSpriteRes.json(), axeSpriteRes.json(), bowSpriteRes.json(),
          spearSpriteRes.json(), wandSpriteRes.json(), daggerSpriteRes.json(), shieldSpriteRes.json(),
          helmetSpriteRes.json(), armorSpriteRes.json(), clothSpriteRes.json(), pantSpriteRes.json(), backSpriteRes.json(),
        ]);

        setSpriteMappings({
          sword: swordSprite,
          axe: axeSprite,
          bow: bowSprite,
          spear: spearSprite,
          wand: wandSprite,
          dagger: daggerSprite,
          shield: shieldSprite,
          helmet: helmetSprite,
          armor: armorSprite,
          cloth: clothSprite,
          pant: pantSprite,
          back: backSprite,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load data:", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 선택된 종족
  const selectedRace = useMemo(() => {
    return races.find(r => r.id === selectedRaceId);
  }, [races, selectedRaceId]);

  // 종족별 필터링된 신체 목록
  const filteredBodies = useMemo(() => {
    if (!selectedRace) return appearanceData.body;
    const availableIndices = selectedRace.appearance.body.availableIndices;
    return appearanceData.body.filter(b => availableIndices.includes(b.index));
  }, [selectedRace, appearanceData.body]);

  // 종족별 필터링된 눈 목록
  const filteredEyes = useMemo(() => {
    if (!selectedRace) return appearanceData.eye;
    const availableIndices = selectedRace.appearance.eye.availableIndices;
    return appearanceData.eye.filter(e => availableIndices.includes(e.index));
  }, [selectedRace, appearanceData.eye]);

  // 스프라이트 ID → Unity 인덱스 및 스프라이트 이름 변환
  const getSpriteInfo = useCallback((category: string, spriteId: string): { index: number; name: string } => {
    const mapping = spriteMappings[category];
    if (!mapping) return { index: -1, name: "" };

    const lowerId = spriteId.toLowerCase();

    // 1. spriteMap이 있으면 사용 (sword.json 등)
    if (mapping.spriteMap?.[lowerId]) {
      const actualName = mapping.spriteMap[lowerId];
      return {
        index: mapping.nameToIndex?.[actualName] ?? -1,
        name: actualName
      };
    }

    // 2. spriteMap이 없으면 대소문자 무시하고 nameToIndex에서 직접 찾기
    const matchingKey = Object.keys(mapping.nameToIndex || {}).find(
      (key) => key.toLowerCase() === lowerId
    );
    if (matchingKey) {
      return {
        index: mapping.nameToIndex[matchingKey],
        name: matchingKey
      };
    }

    return { index: -1, name: "" };
  }, [spriteMappings]);

  // 기존 호환용
  const getSpriteIndex = useCallback((category: string, spriteId: string): number => {
    return getSpriteInfo(category, spriteId).index;
  }, [getSpriteInfo]);

  // 장비 선택 핸들러
  const handleEquipmentSelect = useCallback((slot: keyof EquipmentState, itemId: string | null, category: string) => {
    setEquipment(prev => ({ ...prev, [slot]: itemId }));

    // Unity 호출
    const slotConfig = EQUIPMENT_SLOTS.find(s => s.slot === slot);
    if (!slotConfig) return;

    const methodMap: Record<string, string> = {
      helmetId: "JS_SetHelmet",
      armorId: "JS_SetArmor",
      clothId: "JS_SetCloth",
      pantsId: "JS_SetPant",
      backId: "JS_SetBack",
    };

    // Unity 슬롯 키 매핑
    const unitySlotMap: Record<string, keyof UnityEquipmentState> = {
      rightHandId: "rightHand",
      leftHandId: "leftHand",
      helmetId: "helmet",
      armorId: "armor",
      clothId: "cloth",
      pantsId: "pants",
      backId: "back",
    };

    if (itemId === null) {
      // 장비 해제
      setUnityEquipment(prev => ({ ...prev, [unitySlotMap[slot]]: null }));
      if (slotConfig.weaponType) {
        const weaponType = equipmentData[category]?.weaponType || slotConfig.weaponType;
        callUnity(slotConfig.hand === "left" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon", `${weaponType},-1`);
      } else {
        callUnity(methodMap[slot] || "", "-1");
      }
    } else {
      // 아이템 찾기
      const item = equipmentData[category]?.items.find(i => i.id === itemId);
      if (!item) return;

      const spriteInfo = getSpriteInfo(category, item.spriteId);
      if (spriteInfo.index === -1) {
        console.warn(`Sprite not found for ${item.spriteId} in category ${category}`);
        return;
      }

      // Unity 상태 업데이트
      if (slotConfig.weaponType) {
        const weaponType = equipmentData[category]?.weaponType || slotConfig.weaponType;
        setUnityEquipment(prev => ({
          ...prev,
          [unitySlotMap[slot]]: { weaponType, spriteIndex: spriteInfo.index, spriteName: spriteInfo.name }
        }));
        callUnity(slotConfig.hand === "left" ? "JS_SetLeftWeapon" : "JS_SetRightWeapon", `${weaponType},${spriteInfo.index}`);
      } else {
        setUnityEquipment(prev => ({
          ...prev,
          [unitySlotMap[slot]]: { spriteIndex: spriteInfo.index, spriteName: spriteInfo.name }
        }));
        callUnity(methodMap[slot] || "", spriteInfo.index.toString());
      }
    }
  }, [callUnity, equipmentData, getSpriteInfo]);

  // 무기 카테고리 변경 핸들러
  const handleWeaponCategoryChange = useCallback((category: string) => {
    setSelectedWeaponCategory(category);
    // 무기 해제
    setEquipment(prev => ({ ...prev, rightHandId: null }));
    const weaponType = equipmentData[category]?.weaponType || "Sword";
    callUnity("JS_SetRightWeapon", `${weaponType},-1`);
  }, [callUnity, equipmentData]);

  // 외형 선택 핸들러 (ID 기반)
  const handleAppearanceSelect = useCallback((type: "eye" | "hair" | "facehair", id: string | null) => {
    if (type === "eye") {
      const eyeItem = appearanceData.eye.find(e => e.id === id);
      const index = eyeItem ? eyeItem.index : -1;
      setAppearance(prev => ({ ...prev, eyeId: id }));
      setUnityAppearance(prev => ({ ...prev, eyeIndex: index }));
      callUnity("JS_SetEye", index.toString());
    } else if (type === "hair") {
      const hairItem = appearanceData.hair.find(h => h.id === id);
      const index = hairItem ? hairItem.index : -1;
      setAppearance(prev => ({ ...prev, hairId: id }));
      setUnityAppearance(prev => ({ ...prev, hairIndex: index }));
      callUnity("JS_SetHair", index.toString());
    } else if (type === "facehair") {
      const facehairItem = appearanceData.facehair.find(f => f.id === id);
      const index = facehairItem ? facehairItem.index : -1;
      setAppearance(prev => ({ ...prev, facehairId: id }));
      setUnityAppearance(prev => ({ ...prev, facehairIndex: index }));
      callUnity("JS_SetFacehair", index.toString());
    }
  }, [callUnity, appearanceData]);

  // 색상 선택 핸들러
  const handleColorSelect = useCallback((type: "hair" | "leftEye" | "rightEye" | "facehair", color: string) => {
    if (type === "hair") {
      setAppearance(prev => ({ ...prev, hairColor: color }));
      setUnityAppearance(prev => ({ ...prev, hairColor: color }));
      callUnity("JS_SetHairColor", color);
    } else if (type === "leftEye") {
      setAppearance(prev => ({ ...prev, leftEyeColor: color }));
      setUnityAppearance(prev => ({ ...prev, leftEyeColor: color }));
      callUnity("JS_SetLeftEyeColor", color);
    } else if (type === "rightEye") {
      setAppearance(prev => ({ ...prev, rightEyeColor: color }));
      setUnityAppearance(prev => ({ ...prev, rightEyeColor: color }));
      callUnity("JS_SetRightEyeColor", color);
    } else if (type === "facehair") {
      setAppearance(prev => ({ ...prev, faceHairColor: color }));
      setUnityAppearance(prev => ({ ...prev, faceHairColor: color }));
      callUnity("JS_SetFacehairColor", color);
    }
  }, [callUnity]);

  // 양쪽 눈 색상 동시 변경
  const handleBothEyeColorSelect = useCallback((color: string) => {
    setAppearance(prev => ({ ...prev, leftEyeColor: color, rightEyeColor: color }));
    setUnityAppearance(prev => ({ ...prev, leftEyeColor: color, rightEyeColor: color }));
    callUnity("JS_SetEyeColor", color);
  }, [callUnity]);

  // 종족 변경 핸들러
  const handleRaceChange = useCallback((raceId: string) => {
    setSelectedRaceId(raceId);

    // raceId 저장
    setAppearance(prev => ({ ...prev, raceId }));

    // 해당 종족의 첫 번째 신체로 Unity 초기화
    const race = races.find(r => r.id === raceId);
    if (race && race.appearance.body.availableIndices.length > 0) {
      const firstBodyIndex = race.appearance.body.availableIndices[0];
      setUnityAppearance(prev => ({ ...prev, bodyIndex: firstBodyIndex }));
      callUnity("JS_SetBody", firstBodyIndex.toString());

      // 색상도 종족 기본값으로
      if (race.appearance.hair?.colors?.values) {
        const defaultHairColor = race.appearance.hair.colors.values[race.appearance.hair.colors.default];
        if (defaultHairColor) {
          setAppearance(prev => ({ ...prev, hairColor: defaultHairColor }));
          setUnityAppearance(prev => ({ ...prev, hairColor: defaultHairColor }));
          callUnity("JS_SetHairColor", defaultHairColor);
        }
      }
      if (race.appearance.eye?.colors?.values) {
        const defaultEyeColor = race.appearance.eye.colors.values[race.appearance.eye.colors.default];
        if (defaultEyeColor) {
          setAppearance(prev => ({ ...prev, leftEyeColor: defaultEyeColor, rightEyeColor: defaultEyeColor }));
          setUnityAppearance(prev => ({ ...prev, leftEyeColor: defaultEyeColor, rightEyeColor: defaultEyeColor }));
          callUnity("JS_SetEyeColor", defaultEyeColor);
        }
      }
    }
  }, [races, callUnity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Unity 캔버스 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md aspect-square">
            <DynamicUnityCanvas />
          </div>
        </div>

        {/* 설정 패널 */}
        <div className="w-[420px] bg-gray-800 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">게임 테스트 (ID 기반)</h1>
            <button
              onClick={() => router.push("/test")}
              className="text-sm text-gray-400 hover:text-white px-3 py-2"
            >
              ← 목록
            </button>
          </div>

          {/* 종족 선택 */}
          <section className="mb-6 p-3 bg-gray-700 rounded-lg">
            <h2 className="text-sm font-semibold text-yellow-400 mb-2">종족 선택</h2>
            <select
              className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm"
              value={selectedRaceId}
              onChange={(e) => handleRaceChange(e.target.value)}
            >
              {races.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.nameKo} ({race.nameEn})
                </option>
              ))}
            </select>
          </section>

          {/* 외형 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              외형 (Appearance)
            </h2>
            <div className="space-y-3">
              {/* 눈 (ID 기반) */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  눈 ({filteredEyes.length}개)
                </label>
                <select
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  value={appearance.eyeId || ""}
                  onChange={(e) => handleAppearanceSelect("eye", e.target.value || null)}
                >
                  <option value="">선택 안함</option>
                  {filteredEyes.map((eye) => (
                    <option key={eye.id} value={eye.id}>
                      {eye.ko} [{eye.id}] (Unity: {eye.sprite}, idx:{eye.index})
                    </option>
                  ))}
                </select>
              </div>

              {/* 머리카락 (ID 기반) */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  머리 ({appearanceData.hair.length}개)
                </label>
                <select
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  value={appearance.hairId || ""}
                  onChange={(e) => handleAppearanceSelect("hair", e.target.value || null)}
                >
                  <option value="">없음</option>
                  {appearanceData.hair.map((hair) => (
                    <option key={hair.id} value={hair.id}>
                      {hair.ko} [{hair.id}] (Unity: {hair.sprite}, idx:{hair.index})
                    </option>
                  ))}
                </select>
              </div>

              {/* 수염 (ID 기반) */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  수염/장식 ({appearanceData.facehair.length}개)
                </label>
                <select
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  value={appearance.facehairId || ""}
                  onChange={(e) => handleAppearanceSelect("facehair", e.target.value || null)}
                >
                  <option value="">없음</option>
                  {appearanceData.facehair.map((fh) => (
                    <option key={fh.id} value={fh.id}>
                      {fh.ko} [{fh.id}] (Unity: {fh.sprite}, idx:{fh.index})
                    </option>
                  ))}
                </select>
              </div>

              {/* 색상 */}
              {selectedRace && (
                <div className="space-y-2 mt-2">
                  {/* 머리 색상 */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">머리 색상</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedRace.appearance.hair?.colors?.available?.map((colorKey) => {
                        const colorValue = selectedRace.appearance.hair.colors.values[colorKey];
                        return (
                          <button
                            key={colorKey}
                            onClick={() => handleColorSelect("hair", colorValue)}
                            className={`w-6 h-6 rounded border-2 ${appearance.hairColor === colorValue ? "border-yellow-400" : "border-gray-500"}`}
                            style={{ backgroundColor: colorValue }}
                            title={colorKey}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 눈 색상 (양쪽 동시) */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">눈 색상 (양쪽)</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedRace.appearance.eye?.colors?.available?.map((colorKey) => {
                        const colorValue = selectedRace.appearance.eye.colors.values[colorKey];
                        const isSelected = appearance.leftEyeColor === colorValue && appearance.rightEyeColor === colorValue;
                        return (
                          <button
                            key={colorKey}
                            onClick={() => handleBothEyeColorSelect(colorValue)}
                            className={`w-6 h-6 rounded border-2 ${isSelected ? "border-yellow-400" : "border-gray-500"}`}
                            style={{ backgroundColor: colorValue }}
                            title={colorKey}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 개별 눈 색상 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">왼쪽 눈</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedRace.appearance.eye?.colors?.available?.map((colorKey) => {
                          const colorValue = selectedRace.appearance.eye.colors.values[colorKey];
                          return (
                            <button
                              key={colorKey}
                              onClick={() => handleColorSelect("leftEye", colorValue)}
                              className={`w-5 h-5 rounded border-2 ${appearance.leftEyeColor === colorValue ? "border-yellow-400" : "border-gray-500"}`}
                              style={{ backgroundColor: colorValue }}
                              title={colorKey}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">오른쪽 눈</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedRace.appearance.eye?.colors?.available?.map((colorKey) => {
                          const colorValue = selectedRace.appearance.eye.colors.values[colorKey];
                          return (
                            <button
                              key={colorKey}
                              onClick={() => handleColorSelect("rightEye", colorValue)}
                              className={`w-5 h-5 rounded border-2 ${appearance.rightEyeColor === colorValue ? "border-yellow-400" : "border-gray-500"}`}
                              style={{ backgroundColor: colorValue }}
                              title={colorKey}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 수염 색상 */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">수염 색상</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedRace.appearance.hair?.colors?.available?.map((colorKey) => {
                        const colorValue = selectedRace.appearance.hair.colors.values[colorKey];
                        return (
                          <button
                            key={colorKey}
                            onClick={() => handleColorSelect("facehair", colorValue)}
                            className={`w-6 h-6 rounded border-2 ${appearance.faceHairColor === colorValue ? "border-yellow-400" : "border-gray-500"}`}
                            style={{ backgroundColor: colorValue }}
                            title={colorKey}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 무기 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              무기 (Weapons)
            </h2>
            <div className="space-y-3">
              {/* 무기 종류 선택 탭 */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">무기 종류</label>
                <div className="flex flex-wrap gap-1">
                  {WEAPON_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => handleWeaponCategoryChange(cat.key)}
                      className={`px-2 py-1 rounded text-xs ${
                        selectedWeaponCategory === cat.key
                          ? "bg-yellow-500 text-gray-900"
                          : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 오른손 무기 */}
              {equipmentData[selectedWeaponCategory] && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    오른손 - {WEAPON_CATEGORIES.find(c => c.key === selectedWeaponCategory)?.label} ({equipmentData[selectedWeaponCategory].items.length}개)
                  </label>
                  <select
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    value={equipment.rightHandId || ""}
                    onChange={(e) => handleEquipmentSelect("rightHandId", e.target.value || null, selectedWeaponCategory)}
                  >
                    <option value="">없음</option>
                    {equipmentData[selectedWeaponCategory].items.map((item) => {
                      const spriteInfo = getSpriteInfo(selectedWeaponCategory, item.spriteId);
                      return (
                        <option key={item.id} value={item.id}>
                          {item.nameKo} [{item.id}] (Unity: {spriteInfo.name || item.spriteId}, idx:{spriteInfo.index})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* 왼손 방패 */}
              {equipmentData.shield && equipmentData.shield.items.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    왼손 - 방패 ({equipmentData.shield.items.length}개)
                  </label>
                  <select
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    value={equipment.leftHandId || ""}
                    onChange={(e) => handleEquipmentSelect("leftHandId", e.target.value || null, "shield")}
                  >
                    <option value="">없음</option>
                    {equipmentData.shield.items.map((item) => {
                      const spriteInfo = getSpriteInfo("shield", item.spriteId);
                      return (
                        <option key={item.id} value={item.id}>
                          {item.nameKo} [{item.id}] (Unity: {spriteInfo.name || item.spriteId}, idx:{spriteInfo.index})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* 방어구 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              방어구 (Armor)
            </h2>
            <div className="space-y-3">
              {EQUIPMENT_SLOTS.filter(s => !s.weaponType).map((slotConfig) => {
                const categoryData = equipmentData[slotConfig.category];
                if (!categoryData || categoryData.items.length === 0) return null;

                return (
                  <div key={slotConfig.slot}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {slotConfig.label} ({categoryData.items.length}개)
                    </label>
                    <select
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      value={equipment[slotConfig.slot] || ""}
                      onChange={(e) => handleEquipmentSelect(
                        slotConfig.slot,
                        e.target.value || null,
                        slotConfig.category
                      )}
                    >
                      <option value="">없음</option>
                      {categoryData.items.map((item) => {
                        const spriteInfo = getSpriteInfo(slotConfig.category, item.spriteId);
                        return (
                          <option key={item.id} value={item.id}>
                            {item.nameKo} [{item.id}] (Unity: {spriteInfo.name || item.spriteId}, idx:{spriteInfo.index})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Unity 형식 JSON */}
          <section className="mt-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Unity 형식 (스프라이트 인덱스)</h3>

            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Unity Appearance</label>
              <pre className="p-2 bg-gray-900 rounded text-xs font-mono text-blue-300 overflow-auto max-h-32">
                {JSON.stringify(unityAppearance, null, 2)}
              </pre>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Unity Equipment</label>
              <pre className="p-2 bg-gray-900 rounded text-xs font-mono text-blue-300 overflow-auto max-h-32">
                {JSON.stringify(unityEquipment, null, 2)}
              </pre>
            </div>
          </section>

          {/* DB 저장 형식 JSON */}
          <section className="mt-4">
            <h3 className="text-sm font-semibold text-green-400 mb-2">DB 저장 형식 (아이템 ID)</h3>

            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">appearance (profiles.appearance)</label>
              <pre className="p-2 bg-gray-900 rounded text-xs font-mono text-green-300 overflow-auto max-h-32">
                {JSON.stringify(appearance, null, 2)}
              </pre>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">equipment (profiles.equipment)</label>
              <pre className="p-2 bg-gray-900 rounded text-xs font-mono text-green-300 overflow-auto max-h-32">
                {JSON.stringify(equipment, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
