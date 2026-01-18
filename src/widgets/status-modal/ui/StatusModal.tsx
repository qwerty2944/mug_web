"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/features/auth";
import { DynamicUnityCanvas, useAppearanceStore } from "@/features/character";
import {
  useProfile,
  getMainCharacter,
  getExpPercentage,
  getExpToNextLevel,
  getMaxFatigueFromProfile,
  getCurrentFatigue,
} from "@/entities/user";
import { usePersonalInventory, InventoryGrid, type InventorySlotItem } from "@/entities/inventory";
import { useItems } from "@/entities/item";
import { useAbilities } from "@/entities/ability";
import { useEquipmentStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import { SLOT_CONFIG, type EquipmentSlot } from "@/entities/item";
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
  TraitList,
  type Trait,
} from "@/entities/trait";
import { StatTooltip } from "./StatTooltip";
import { ElementBonusItem, type ElementBonusData } from "./ElementBonusItem";
import {
  STAT_TOOLTIPS,
  COMBAT_TOOLTIPS,
  ELEMENTS,
  TERRAIN_BONUSES,
  type ElementId,
} from "../constants/tooltips";

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

type TabType = "status" | "traits" | "abilities" | "equipment" | "inventory";

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
}

export function StatusModal({ open, onClose }: StatusModalProps) {
  const { theme } = useThemeStore();
  const { session } = useAuthStore();
  const { isUnityLoaded, spriteCounts, loadAppearance } = useAppearanceStore();

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

  // 로컬 UI 상태 (탭 전환)
  const [activeTab, setActiveTab] = useState<TabType>("status");

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

  const tabs: { id: TabType; label: string }[] = [
    { id: "status", label: "상태" },
    { id: "traits", label: "특성" },
    { id: "abilities", label: "어빌리티" },
    { id: "equipment", label: "장비" },
    { id: "inventory", label: "인벤토리" },
  ];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            background: theme.colors.bgLight,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-2 text-sm font-mono font-medium transition-colors"
                style={{
                  background: activeTab === tab.id ? theme.colors.primary : theme.colors.bgDark,
                  color: activeTab === tab.id ? theme.colors.bg : theme.colors.textMuted,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            ✕
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {profileLoading ? (
            <div className="flex items-center justify-center h-full">
              <div
                className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                style={{ borderColor: theme.colors.primary, borderTopColor: "transparent" }}
              />
            </div>
          ) : (
            <div className="grid">
              {/* 상태 탭 */}
              <div className={`col-start-1 row-start-1 ${activeTab === "status" ? "" : "invisible"}`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* 캐릭터 프리뷰 */}
                  <div className="lg:w-1/2 flex-shrink-0">
                    <div
                      className="overflow-hidden h-48 sm:h-56 lg:h-72"
                      style={{ background: theme.colors.bgDark }}
                    >
                      <DynamicUnityCanvas />
                    </div>
                    {mainCharacter && (
                      <div className="mt-3 text-center">
                        <h3
                          className="text-xl font-mono font-bold"
                          style={{ color: theme.colors.text }}
                        >
                          {mainCharacter.name}
                        </h3>
                      </div>
                    )}
                  </div>

                  {/* 스탯 정보 */}
                  <div className="lg:w-1/2 space-y-4">
                    {/* 레벨 & 경험치 */}
                    <div className="p-4" style={{ background: theme.colors.bgDark }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono" style={{ color: theme.colors.textMuted }}>레벨</span>
                        <span className="text-2xl font-mono font-bold" style={{ color: theme.colors.text }}>
                          Lv.{profile?.level || 1}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                          <span>경험치</span>
                          <span>{getExpToNextLevel(profile)} EXP 남음</span>
                        </div>
                        <div className="h-2 overflow-hidden" style={{ background: theme.colors.bgLight }}>
                          <div
                            className="h-full"
                            style={{
                              width: `${getExpPercentage(profile)}%`,
                              background: theme.colors.primary,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* HP/MP */}
                    {mainCharacter?.stats && derivedStats && (
                      <div className="p-4 space-y-3" style={{ background: theme.colors.bgDark }}>
                        {/* HP (마비노기 스타일 - 회복 제한 표시) */}
                        {(() => {
                          const maxHp = derivedStats.maxHp;
                          const recoverableHp = derivedStats.recoverableHp;
                          const currentHp = profile?.currentHp ?? maxHp;
                          const hasInjury = derivedStats.injuryRecoveryReduction > 0;

                          // 퍼센트 계산
                          const currentPercent = (currentHp / maxHp) * 100;
                          const recoverablePercent = (recoverableHp / maxHp) * 100;
                          const injuryPercent = 100 - recoverablePercent;

                          return (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
                                  <span>❤️</span> HP
                                </span>
                                <div className="text-right">
                                  <span className="text-lg font-mono font-medium" style={{ color: theme.colors.error }}>
                                    {currentHp} / {maxHp}
                                  </span>
                                  {hasInjury && (
                                    <span className="text-xs font-mono ml-2" style={{ color: theme.colors.warning }}>
                                      (회복: {recoverableHp})
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* HP 바 - 3단계 표시 */}
                              <div className="h-3 overflow-hidden flex" style={{ background: theme.colors.bgLight }}>
                                {/* 현재 HP (녹색~빨강) */}
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${currentPercent}%`,
                                    background: currentPercent > 50 ? theme.colors.error : currentPercent > 20 ? theme.colors.warning : "#ff3333",
                                  }}
                                />
                                {/* 회복 가능 빈 구간 (기본 배경) */}
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${recoverablePercent - currentPercent}%`,
                                    background: theme.colors.bgLight,
                                  }}
                                />
                                {/* 부상으로 인한 회복 불가 구간 (어두운 빨강) */}
                                {hasInjury && (
                                  <div
                                    className="h-full"
                                    style={{
                                      width: `${injuryPercent}%`,
                                      background: "#4a1515",
                                    }}
                                  />
                                )}
                              </div>
                              {/* 부상 정보 */}
                              {hasInjury && (
                                <div className="text-xs font-mono mt-1" style={{ color: theme.colors.warning }}>
                                  🩹 부상으로 HP 회복 상한 -{Math.floor(derivedStats.injuryRecoveryReduction * 100)}%
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* MP */}
                        {(() => {
                          const maxMp = derivedStats.maxMp;
                          const currentMp = profile?.currentMp ?? maxMp;
                          const mpPercent = (currentMp / maxMp) * 100;
                          return (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
                                  <span>💧</span> MP
                                </span>
                                <span className="text-lg font-mono font-medium" style={{ color: theme.colors.primary }}>
                                  {currentMp} / {maxMp}
                                </span>
                              </div>
                              <div className="h-3 overflow-hidden" style={{ background: theme.colors.bgLight }}>
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${mpPercent}%`,
                                    background: theme.colors.primary,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* 피로도 */}
                    <div className="p-4" style={{ background: theme.colors.bgDark }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
                          <span>⚡</span> 피로도
                        </span>
                        <span className="text-lg font-mono font-medium" style={{ color: theme.colors.text }}>
                          {getCurrentFatigue(profile)} / {getMaxFatigueFromProfile(profile)}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden" style={{ background: theme.colors.bgLight }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${(getCurrentFatigue(profile) / getMaxFatigueFromProfile(profile)) * 100}%`,
                            background: theme.colors.success,
                          }}
                        />
                      </div>
                    </div>

                    {/* 전투 스탯 */}
                    {combatStats && (
                      <div className="p-4" style={{ background: theme.colors.bgDark }}>
                        <div className="text-sm font-mono mb-3" style={{ color: theme.colors.textMuted }}>전투 스탯</div>

                        {/* 공격력 / 방어력 */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <StatTooltip
                            content={
                              <div>
                                <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.physicalAttack.title}</div>
                                <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.physicalAttack.formula}</div>
                                <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.physicalAttack.effect}</div>
                              </div>
                            }
                          >
                            <div className="p-2" style={{ background: theme.colors.bgLight, border: `1px solid ${theme.colors.border}` }}>
                              <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>공격력</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span>⚔️</span>
                                <span className="font-mono" style={{ color: theme.colors.error }}>{combatStats.physicalAttack}</span>
                                <span style={{ color: theme.colors.textMuted }}>/</span>
                                <span>🔮</span>
                                <span className="font-mono" style={{ color: theme.colors.primary }}>{combatStats.magicAttack}</span>
                              </div>
                            </div>
                          </StatTooltip>
                          <StatTooltip
                            content={
                              <div>
                                <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.physicalDefense.title}</div>
                                <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.physicalDefense.formula}</div>
                                <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.physicalDefense.effect}</div>
                              </div>
                            }
                          >
                            <div className="p-2" style={{ background: theme.colors.bgLight, border: `1px solid ${theme.colors.border}` }}>
                              <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>방어력</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span>🛡️</span>
                                <span className="font-mono" style={{ color: theme.colors.success }}>{combatStats.physicalDefense}</span>
                                <span style={{ color: theme.colors.textMuted }}>/</span>
                                <span>🔮</span>
                                <span className="font-mono" style={{ color: theme.colors.primary }}>{combatStats.magicDefense}</span>
                              </div>
                            </div>
                          </StatTooltip>
                        </div>

                        {/* 회피 / 막기 */}
                        <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-2">
                          <StatTooltip
                            content={
                              <div>
                                <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.dodge.title}</div>
                                <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.dodge.formula}</div>
                                <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.dodge.max}</div>
                                <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.dodge.effect}</div>
                              </div>
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span>🌀</span>
                              <span style={{ color: theme.colors.textMuted }}>회피</span>
                              <span className="ml-auto" style={{ color: theme.colors.text }}>{combatStats.dodgeChance.toFixed(1)}%</span>
                            </div>
                          </StatTooltip>
                          <StatTooltip
                            content={
                              <div>
                                <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.block.title}</div>
                                <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.block.formula}</div>
                                <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.block.max}</div>
                                <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.block.effect}</div>
                              </div>
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span>🛡️</span>
                              <span style={{ color: theme.colors.textMuted }}>막기</span>
                              <span className="ml-auto" style={{ color: theme.colors.text }}>{combatStats.blockChance.toFixed(1)}%</span>
                            </div>
                          </StatTooltip>
                        </div>

                        {/* 치명타 */}
                        <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-2">
                          <StatTooltip
                            content={
                              <div>
                                <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.physCrit.title}</div>
                                <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.physCrit.formula}</div>
                                <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.physCrit.max}</div>
                              </div>
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span>💥</span>
                              <span style={{ color: theme.colors.textMuted }}>물리치명</span>
                              <span className="ml-auto" style={{ color: theme.colors.error }}>{combatStats.physicalCritChance.toFixed(1)}%</span>
                            </div>
                          </StatTooltip>
                          <StatTooltip
                            content={
                              <div>
                                <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.magicCrit.title}</div>
                                <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.magicCrit.formula}</div>
                                <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.magicCrit.max}</div>
                              </div>
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span>✨</span>
                              <span style={{ color: theme.colors.textMuted }}>마법치명</span>
                              <span className="ml-auto" style={{ color: theme.colors.primary }}>{combatStats.magicalCritChance.toFixed(1)}%</span>
                            </div>
                          </StatTooltip>
                        </div>

                        {/* 치명타 배율 */}
                        <StatTooltip
                          content={
                            <div>
                              <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.critMult.title}</div>
                              <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.critMult.formula}</div>
                              <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.critMult.max}</div>
                            </div>
                          }
                        >
                          <div className="flex items-center gap-2 text-sm font-mono">
                            <span>⚡</span>
                            <span style={{ color: theme.colors.textMuted }}>치명 배율</span>
                            <span className="ml-auto" style={{ color: theme.colors.warning }}>{combatStats.critMultiplier.toFixed(2)}x</span>
                          </div>
                        </StatTooltip>
                      </div>
                    )}

                    {/* 속성 보너스 */}
                    <div className="p-4" style={{ background: theme.colors.bgDark }}>
                      <div className="text-sm font-mono mb-3" style={{ color: theme.colors.textMuted }}>
                        속성 보너스
                        <span className="text-xs ml-2" style={{ color: theme.colors.primary }}>
                          (시간대/날씨/지형)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {elementBonuses.map((element) => (
                          <ElementBonusItem key={element.id} element={element} />
                        ))}
                      </div>
                    </div>

                    {/* 능력치 */}
                    {mainCharacter?.stats && (
                      <div className="p-4" style={{ background: theme.colors.bgDark }}>
                        <div className="text-sm font-mono mb-3" style={{ color: theme.colors.textMuted }}>능력치</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: "str", label: "힘", icon: "💪" },
                            { key: "dex", label: "민첩", icon: "🏃" },
                            { key: "con", label: "체력", icon: "❤️" },
                            { key: "int", label: "지능", icon: "🧠" },
                            { key: "wis", label: "지혜", icon: "🔮" },
                            { key: "cha", label: "매력", icon: "✨" },
                            { key: "lck", label: "행운", icon: "🍀" },
                          ].map(({ key, label, icon }) => {
                            const tooltip = STAT_TOOLTIPS[key];
                            return (
                              <StatTooltip
                                key={key}
                                content={
                                  <div>
                                    <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>
                                      {tooltip?.title || label}
                                    </div>
                                    {tooltip?.effects.map((effect, i) => (
                                      <div key={i} style={{ color: theme.colors.textMuted }}>
                                        {effect}
                                      </div>
                                    ))}
                                  </div>
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{icon}</span>
                                  <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>{label}</span>
                                  <span className="font-mono font-medium ml-auto" style={{ color: theme.colors.text }}>
                                    {(mainCharacter.stats as unknown as Record<string, number>)[key] ?? 10}
                                  </span>
                                </div>
                              </StatTooltip>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 재화 */}
                    <div className="p-4 grid grid-cols-2 gap-4" style={{ background: theme.colors.bgDark }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>골드</div>
                          <div className="text-lg font-mono font-medium" style={{ color: theme.colors.warning }}>
                            {(profile?.gold || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💎</span>
                        <div>
                          <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>젬</div>
                          <div className="text-lg font-mono font-medium" style={{ color: theme.colors.primary }}>
                            {(profile?.gems || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 특성 탭 */}
              <div className={`col-start-1 row-start-1 ${activeTab === "traits" ? "" : "invisible"}`}>
                <div className="space-y-4">
                  {/* 헤더 */}
                  <div
                    className="flex items-center justify-between p-3"
                    style={{ background: theme.colors.bgDark }}
                  >
                    <span className="font-mono" style={{ color: theme.colors.text }}>
                      📋 보유 특성 ({characterTraits.length}개)
                    </span>
                  </div>

                  {/* 트레이트 목록 (카테고리별) */}
                  <div className="p-4" style={{ background: theme.colors.bgDark }}>
                    <TraitList
                      traits={characterTraits}
                      groupByCategory
                      emptyMessage="보유한 특성이 없습니다"
                    />
                  </div>

                  {/* 효과 요약 */}
                  {traitEffects && (
                    <div className="p-4" style={{ background: theme.colors.bgDark }}>
                      <div
                        className="text-sm font-mono mb-3"
                        style={{ color: theme.colors.textMuted }}
                      >
                        📊 특성 효과 요약
                      </div>
                      <div className="text-xs font-mono space-y-1">
                        {/* 스탯 수정자 */}
                        {Object.entries(traitEffects.statModifiers).map(([stat, value]) => {
                          if (!value) return null;
                          const statNames: Record<string, string> = {
                            str: "힘", dex: "민첩", con: "체력", int: "지능",
                            wis: "지혜", cha: "매력", lck: "행운",
                          };
                          const sign = value > 0 ? "+" : "";
                          return (
                            <div key={stat} style={{ color: theme.colors.text }}>
                              {statNames[stat] ?? stat} {sign}{value}
                            </div>
                          );
                        })}
                        {/* 특수 효과 */}
                        {Array.from(traitEffects.specialEffects.entries()).map(([type, value]) => {
                          const effectNames: Record<string, string> = {
                            fear_resistance: "공포 저항", disease_resistance: "질병 저항",
                            poison_resistance: "독 저항", physical_damage: "물리 데미지",
                            magic_damage: "마법 데미지", critical_chance: "치명타 확률",
                            dodge_chance: "회피 확률", gold_gain: "골드 획득",
                            exp_gain: "경험치 획득", healing_power: "치유량",
                          };
                          const sign = value > 0 ? "+" : "";
                          return (
                            <div key={type} style={{ color: theme.colors.text }}>
                              {effectNames[type] ?? type} {sign}{value}%
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 어빌리티 탭 */}
              <div className={`col-start-1 row-start-1 ${activeTab === "abilities" ? "" : "invisible"}`}>
                {equipmentStore.learnedSkills.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-64 font-mono"
                    style={{ color: theme.colors.textMuted }}
                  >
                    <p className="text-4xl mb-4">📖</p>
                    <p>습득한 어빌리티가 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipmentStore.learnedSkills.map((skillId) => {
                      const ability = abilities.find((a) => a.id === skillId);
                      return (
                        <div
                          key={skillId}
                          className="p-4 flex items-start gap-3"
                          style={{
                            background: theme.colors.bgDark,
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          <span className="text-3xl">{ability?.icon ?? "📖"}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono font-medium" style={{ color: theme.colors.text }}>
                              {ability?.nameKo ?? skillId}
                            </div>
                            {ability?.description?.ko && (
                              <div
                                className="text-sm font-mono mt-1"
                                style={{ color: theme.colors.textMuted }}
                              >
                                {ability.description.ko}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 장비 탭 */}
              <div className={`col-start-1 row-start-1 ${activeTab === "equipment" ? "" : "invisible"}`}>
                <div className="space-y-6">
                  {/* 무기 카테고리 */}
                  <div>
                    <h3
                      className="text-sm font-mono font-medium mb-2 flex items-center gap-2"
                      style={{ color: theme.colors.textMuted }}
                    >
                      <span>⚔️</span> 무기
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(["mainHand", "offHand"] as EquipmentSlot[]).map((slot) => {
                        const config = SLOT_CONFIG[slot];
                        const item = equipmentStore.getEquippedItem(slot);
                        const isDisabled = slot === "offHand" && equipmentStore.isOffHandDisabled();
                        return (
                          <div
                            key={slot}
                            className="p-3"
                            style={{
                              background: isDisabled ? `${theme.colors.bgDark}80` : theme.colors.bgDark,
                              border: `1px solid ${theme.colors.border}`,
                              opacity: isDisabled ? 0.6 : 1,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{config.icon}</span>
                              <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                                {config.nameKo}
                                {isDisabled && " (비활성)"}
                              </span>
                            </div>
                            {item ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono text-sm truncate" style={{ color: theme.colors.text }}>
                                    {item.itemName}
                                  </div>
                                  {item.stats && (
                                    <div className="text-xs font-mono" style={{ color: theme.colors.success }}>
                                      {Object.entries(item.stats).slice(0, 2).map(([k, v]) => `${k}+${v}`).join(" ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                                빈 슬롯
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 방어구 카테고리 */}
                  <div>
                    <h3
                      className="text-sm font-mono font-medium mb-2 flex items-center gap-2"
                      style={{ color: theme.colors.textMuted }}
                    >
                      <span>🛡️</span> 방어구
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["helmet", "armor", "cloth", "pants"] as EquipmentSlot[]).map((slot) => {
                        const config = SLOT_CONFIG[slot];
                        const item = equipmentStore.getEquippedItem(slot);
                        return (
                          <div
                            key={slot}
                            className="p-3"
                            style={{
                              background: theme.colors.bgDark,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-base">{config.icon}</span>
                              <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                                {config.nameKo}
                              </span>
                            </div>
                            {item ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-lg">{item.icon}</span>
                                  <span className="font-mono text-xs truncate" style={{ color: theme.colors.text }}>
                                    {item.itemName}
                                  </span>
                                </div>
                                {item.stats?.defense && (
                                  <div className="text-xs font-mono mt-1" style={{ color: theme.colors.success }}>
                                    DEF +{item.stats.defense}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                                빈 슬롯
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 장신구 카테고리 */}
                  <div>
                    <h3
                      className="text-sm font-mono font-medium mb-2 flex items-center gap-2"
                      style={{ color: theme.colors.textMuted }}
                    >
                      <span>💍</span> 장신구
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {(["ring1", "ring2", "necklace", "earring1", "earring2", "bracelet"] as EquipmentSlot[]).map((slot) => {
                        const config = SLOT_CONFIG[slot];
                        const item = equipmentStore.getEquippedItem(slot);
                        return (
                          <div
                            key={slot}
                            className="p-2 text-center"
                            style={{
                              background: theme.colors.bgDark,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <span className="text-lg block">{item?.icon ?? config.icon}</span>
                            <div className="text-[10px] font-mono mt-1" style={{ color: theme.colors.textMuted }}>
                              {config.nameKo}
                            </div>
                            {item && (
                              <div className="text-[10px] font-mono truncate" style={{ color: theme.colors.text }}>
                                {item.itemName}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 장비 합계 */}
                  <div
                    className="p-3 flex flex-wrap gap-3"
                    style={{
                      background: theme.colors.bgLight,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                      장비 합계:
                    </span>
                    {(() => {
                      const stats = equipmentStore.getTotalStats();
                      const entries = Object.entries(stats).filter(([, v]) => v !== 0);
                      if (entries.length === 0) {
                        return (
                          <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                            없음
                          </span>
                        );
                      }
                      return entries.map(([key, val]) => (
                        <span key={key} className="text-xs font-mono" style={{ color: theme.colors.success }}>
                          {key.toUpperCase()} +{val}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* 인벤토리 탭 */}
              <div className={`col-start-1 row-start-1 ${activeTab === "inventory" ? "" : "invisible"}`}>
                <InventoryGrid
                  items={inventoryItems}
                  allItems={allItems}
                  maxSlots={inventoryMaxSlots}
                  onUseItem={(slot, item) => {
                    // TODO: 아이템 사용 기능 구현
                    console.log("Use item:", slot, item);
                  }}
                  onDropItem={(slot) => {
                    // TODO: 아이템 버리기 기능 구현
                    console.log("Drop item:", slot);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
