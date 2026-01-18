"use client";

import { useEffect, useState, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuthStore } from "@/features/auth";
import { useAppearanceStore } from "@/features/character";
import {
  useProfile,
  getMainCharacter,
} from "@/entities/user";
import { usePersonalInventory } from "@/entities/inventory";
import { useItems } from "@/entities/item";
import { useAbilities } from "@/entities/ability";
import { useEquipmentStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import { calculateDerivedStats } from "@/entities/character";
import type { ProfileAppearance } from "@/entities/character";
import {
  getDodgeChance,
  getBlockChance,
  getCriticalChance,
  getCriticalMultiplier,
} from "@/features/combat";
import { useRealtimeGameTime, getElementTimeMultiplier } from "@/entities/game-time";
import { useRealtimeWeather, getWeatherElementMultiplier } from "@/entities/weather";
import { useMaps } from "@/entities/map";
import {
  useCharacterTraitsWithDetails,
  calculateAggregatedEffects,
  type Trait,
} from "@/entities/trait";
import type { ElementBonusData } from "./ElementBonusItem";
import {
  ELEMENTS,
  TERRAIN_BONUSES,
  type ElementId,
} from "../constants/tooltips";
import {
  StatusTab,
  TraitsTab,
  AbilitiesTab,
  EquipmentTab,
  InventoryTab,
} from "./tabs";

// 스프라이트 데이터 타입
interface SpriteItem {
  id: string;
  index: number;
  sprite: string;
}

interface SpriteData {
  eyes?: SpriteItem[];
  hairs?: SpriteItem[];
  facehairs?: SpriteItem[];
  bodies?: SpriteItem[];
}

// ID를 인덱스로 변환하는 훅
function useAppearanceIndexes(appearance: ProfileAppearance | null | undefined) {
  const [spriteData, setSpriteData] = useState<SpriteData>({});
  const [loaded, setLoaded] = useState(false);

  // 스프라이트 데이터 로드
  useEffect(() => {
    async function loadSpriteData() {
      try {
        const [eyeRes, hairRes, facehairRes, bodyRes] = await Promise.all([
          fetch("/data/sprites/appearance/eye.json"),
          fetch("/data/sprites/appearance/hair.json"),
          fetch("/data/sprites/appearance/facehair.json"),
          fetch("/data/sprites/appearance/body.json"),
        ]);
        const [eyeData, hairData, facehairData, bodyData] = await Promise.all([
          eyeRes.json(),
          hairRes.json(),
          facehairRes.json(),
          bodyRes.json(),
        ]);
        setSpriteData({
          eyes: eyeData.eyes || [],
          hairs: hairData.hairs || [],
          facehairs: facehairData.facehairs || [],
          bodies: bodyData.bodies || [],
        });
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load sprite data:", err);
      }
    }
    loadSpriteData();
  }, []);

  // ID → 인덱스 변환
  const indexes = useMemo(() => {
    if (!loaded || !appearance) {
      return { eyeIndex: -1, hairIndex: -1, facehairIndex: -1, bodyIndex: 12 };
    }

    const eyeItem = spriteData.eyes?.find(e => e.id === appearance.eyeId);
    const hairItem = spriteData.hairs?.find(h => h.id === appearance.hairId);
    const facehairItem = spriteData.facehairs?.find(f => f.id === appearance.facehairId);
    // 기본 body는 Human_1 (index 12)
    const bodyIndex = 12;

    return {
      eyeIndex: eyeItem?.index ?? -1,
      hairIndex: hairItem?.index ?? -1,
      facehairIndex: facehairItem?.index ?? -1,
      bodyIndex,
    };
  }, [loaded, appearance, spriteData]);

  return { indexes, loaded };
}

// 탭 설정
const TAB_CONFIG = [
  { id: "status", label: "상태" },
  { id: "traits", label: "특성" },
  { id: "abilities", label: "어빌리티" },
  { id: "equipment", label: "장비" },
  { id: "inventory", label: "인벤토리" },
] as const;

type TabType = (typeof TAB_CONFIG)[number]["id"];

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
}

export function StatusModal({ open, onClose }: StatusModalProps) {
  const { theme } = useThemeStore();
  const { session } = useAuthStore();
  const { isUnityLoaded, spriteCounts, loadAppearance } = useAppearanceStore();
  const [activeTab, setActiveTab] = useState<TabType>("status");

  // React Query로 서버 상태 관리
  const { data: profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const { data: inventoryData } = usePersonalInventory(session?.user?.id);
  const inventoryItems = inventoryData?.items ?? [];
  const inventoryMaxSlots = inventoryData?.maxSlots ?? 20;
  const { data: allItems = [] } = useItems();
  const { data: abilities = [] } = useAbilities();

  // 장비 스토어
  const equipmentStore = useEquipmentStore();

  // 시간대/날씨/맵 데이터
  const { gameTime } = useRealtimeGameTime();
  const { weather } = useRealtimeWeather();
  const { data: maps } = useMaps();

  // 특성 데이터
  const { data: characterTraitsData = [] } = useCharacterTraitsWithDetails(session?.user?.id);

  const mainCharacter = getMainCharacter(profile);

  // ID → 인덱스 변환 훅
  const { indexes: appearanceIndexes, loaded: spriteDataLoaded } = useAppearanceIndexes(profile?.appearance);

  // 파생 스탯 계산 (부상 포함)
  const derivedStats = useMemo(() => {
    if (!mainCharacter?.stats) return null;
    return calculateDerivedStats(
      mainCharacter.stats,
      equipmentStore.getTotalStats(),
      profile?.level ?? 1,
      profile?.injuries ?? []
    );
  }, [mainCharacter?.stats, equipmentStore, profile?.level, profile?.injuries]);

  // 전투 스탯 계산
  const combatStats = useMemo(() => {
    if (!mainCharacter?.stats || !derivedStats) return null;
    const stats = mainCharacter.stats;
    return {
      dodgeChance: getDodgeChance(stats.dex, derivedStats.totalDodgeChance ?? 0),
      blockChance: getBlockChance(stats.con, derivedStats.totalBlockChance ?? 0),
      physicalCritChance: getCriticalChance(stats.lck, stats.dex),
      magicalCritChance: getCriticalChance(stats.lck, stats.int),
      critMultiplier: getCriticalMultiplier(stats.lck),
      physicalAttack: derivedStats.totalPhysicalAttack ?? 0,
      physicalDefense: derivedStats.totalPhysicalDefense ?? 0,
      magicAttack: derivedStats.totalMagicAttack ?? 0,
      magicDefense: derivedStats.totalMagicDefense ?? 0,
    };
  }, [mainCharacter?.stats, derivedStats]);

  // 현재 맵 지형 정보
  const currentMap = useMemo(() => {
    if (!maps || !profile?.currentMapId) return null;
    return maps.find((m) => m.id === profile.currentMapId);
  }, [maps, profile?.currentMapId]);

  // 속성 보너스 계산 (시간대/날씨/지형)
  const elementBonuses = useMemo((): ElementBonusData[] => {
    const period = gameTime?.period ?? "day";
    const currentWeather = weather?.currentWeather ?? "sunny";
    const terrain = currentMap?.terrain;

    return ELEMENTS.map((el) => {
      // 기본 보너스 (캐릭터/장비)
      const baseBonus = 0; // TODO: derivedStats.totalElementBoost[el.id] if exists

      // 시간대 보너스
      const timeMultiplier = getElementTimeMultiplier(el.id as ElementId, period);
      const timeBonus = Math.round((timeMultiplier - 1) * 100);

      // 날씨 보너스
      const weatherMultiplier = getWeatherElementMultiplier(el.id as ElementId, currentWeather);
      const weatherBonus = Math.round((weatherMultiplier - 1) * 100);

      // 지형 보너스
      let terrainBonus = 0;
      if (terrain && TERRAIN_BONUSES[terrain]?.element === el.id) {
        terrainBonus = Math.round((TERRAIN_BONUSES[terrain].multiplier - 1) * 100);
      }

      // 총합
      const totalBonus = baseBonus + timeBonus + weatherBonus + terrainBonus;

      return {
        id: el.id,
        nameKo: el.nameKo,
        icon: el.icon,
        baseBonus,
        timeBonus,
        weatherBonus,
        terrainBonus,
        totalBonus,
      };
    });
  }, [gameTime?.period, weather?.currentWeather, currentMap?.terrain]);

  // 특성 데이터 변환 (TraitList는 Trait[] 타입 필요)
  const characterTraits = useMemo(() => {
    return characterTraitsData
      .map((ct) => ct.trait)
      .filter((t): t is Trait => t !== undefined);
  }, [characterTraitsData]);

  // 특성 효과 집계
  const traitEffects = useMemo(() => {
    if (!characterTraits.length) return null;
    return calculateAggregatedEffects(characterTraits);
  }, [characterTraits]);

  // Unity 스프라이트 로드 완료 후 캐릭터 외형 적용
  useEffect(() => {
    if (open && isUnityLoaded && spriteCounts && profile?.appearance && spriteDataLoaded) {
      // ID 기반 appearance를 인덱스 기반으로 변환
      const appearance = {
        bodyIndex: appearanceIndexes.bodyIndex,
        eyeIndex: appearanceIndexes.eyeIndex,
        hairIndex: appearanceIndexes.hairIndex,
        facehairIndex: appearanceIndexes.facehairIndex,
        clothIndex: -1,
        armorIndex: -1,
        pantIndex: -1,
        helmetIndex: -1,
        backIndex: -1,
      };
      // 색상 정보 변환 (ProfileAppearance → CharacterColors)
      const colors = {
        body: "#FFFFFF",
        eye: profile.appearance.leftEyeColor || "#4A3728",
        hair: profile.appearance.hairColor || "#8B4513",
        facehair: profile.appearance.faceHairColor || "#8B4513",
        cloth: "#FFFFFF",
        armor: "#FFFFFF",
        pant: "#FFFFFF",
      };
      loadAppearance(appearance, colors);
    }
  }, [open, isUnityLoaded, spriteCounts, profile?.appearance, spriteDataLoaded, appearanceIndexes, loadAppearance]);

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="flex flex-col h-full min-h-0">
          {/* 헤더 + 탭 리스트 */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b"
            style={{
              background: theme.colors.bgLight,
              borderColor: theme.colors.border,
            }}
          >
            <Tabs.List className="flex gap-1 flex-wrap">
              {TAB_CONFIG.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Tabs.Trigger
                    key={tab.id}
                    value={tab.id}
                    className="px-3 py-2 text-sm font-mono font-medium transition-colors"
                    style={{
                      background: isActive ? theme.colors.primary : theme.colors.bgDark,
                      color: isActive ? theme.colors.bg : theme.colors.textMuted,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {tab.label}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
            <button
              onClick={onClose}
              className="p-2 transition-colors"
              style={{ color: theme.colors.textMuted }}
            >
              ✕
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {profileLoading ? (
              <div className="flex items-center justify-center h-full">
                <div
                  className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                  style={{ borderColor: theme.colors.primary, borderTopColor: "transparent" }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 grid-rows-1 h-full">
                <Tabs.Content value="status" forceMount className="col-start-1 row-start-1 p-4 overflow-y-auto data-[state=inactive]:hidden">
                  <StatusTab
                    theme={theme}
                    profile={profile}
                    mainCharacter={mainCharacter}
                    derivedStats={derivedStats}
                    combatStats={combatStats}
                    elementBonuses={elementBonuses}
                  />
                </Tabs.Content>

                <Tabs.Content value="traits" forceMount className="col-start-1 row-start-1 p-4 overflow-y-auto data-[state=inactive]:hidden">
                  <TraitsTab
                    theme={theme}
                    characterTraits={characterTraits}
                    traitEffects={traitEffects}
                  />
                </Tabs.Content>

                <Tabs.Content value="abilities" forceMount className="col-start-1 row-start-1 p-4 overflow-y-auto data-[state=inactive]:hidden">
                  <AbilitiesTab
                    theme={theme}
                    learnedSkills={equipmentStore.learnedSkills}
                    abilities={abilities}
                  />
                </Tabs.Content>

                <Tabs.Content value="equipment" forceMount className="col-start-1 row-start-1 p-4 overflow-y-auto data-[state=inactive]:hidden">
                  <EquipmentTab theme={theme} />
                </Tabs.Content>

                <Tabs.Content value="inventory" forceMount className="col-start-1 row-start-1 p-4 overflow-y-auto data-[state=inactive]:hidden">
                  <InventoryTab
                    theme={theme}
                    inventoryItems={inventoryItems}
                    allItems={allItems}
                    inventoryMaxSlots={inventoryMaxSlots}
                  />
                </Tabs.Content>
              </div>
            )}
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}
