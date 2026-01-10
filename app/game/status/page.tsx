"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { usePersonalInventory, type InventorySlotItem } from "@/entities/inventory";
import { useThemeStore } from "@/shared/config";
import { useProficiencies, WEAPON_PROFICIENCIES, MAGIC_PROFICIENCIES, getRankInfo, getProficiencyValue } from "@/entities/proficiency";
import type { ProficiencyType } from "@/entities/proficiency";
import { useEquipmentStore } from "@/application/stores";
import { SLOT_CONFIG, type EquipmentSlot } from "@/entities/item";
import { useCharacterTraitsWithDetails, TraitList, TRAIT_CATEGORIES, TRAIT_CATEGORY_ORDER, TRAIT_RARITIES, formatTraitEffects } from "@/entities/trait";
import type { TraitCategory, Trait } from "@/entities/trait";
import type { ProfileAppearance } from "@/entities/character";

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

  const indexes = useMemo(() => {
    if (!loaded || !appearance) {
      return { eyeIndex: -1, hairIndex: -1, facehairIndex: -1, bodyIndex: 12 };
    }

    const eyeItem = spriteData.eyes?.find(e => e.id === appearance.eyeId);
    const hairItem = spriteData.hairs?.find(h => h.id === appearance.hairId);
    const facehairItem = spriteData.facehairs?.find(f => f.id === appearance.facehairId);
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

export default function StatusPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { session } = useAuthStore();
  const { isUnityLoaded, spriteCounts, loadAppearance } = useAppearanceStore();

  // React Query로 서버 상태 관리
  const { data: profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const { data: inventoryData } = usePersonalInventory(session?.user?.id);
  const inventoryItems = inventoryData?.items?.filter((item): item is InventorySlotItem => item !== null) ?? [];
  const { data: proficiencies } = useProficiencies(session?.user?.id);
  const { data: characterTraits = [] } = useCharacterTraitsWithDetails(session?.user?.id);

  // 장비 스토어
  const equipmentStore = useEquipmentStore();

  // 로컬 UI 상태 (탭 전환)
  const [activeTab, setActiveTab] = useState<"status" | "traits" | "proficiency" | "skills" | "equipment" | "inventory">("status");

  const mainCharacter = getMainCharacter(profile);

  // ID → 인덱스 변환 훅
  const { indexes: appearanceIndexes, loaded: spriteDataLoaded } = useAppearanceIndexes(profile?.appearance);

  // 로그인 체크
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/login");
    }
  }, [session, router]);

  // Unity 스프라이트 로드 완료 후 캐릭터 외형 적용
  useEffect(() => {
    if (isUnityLoaded && spriteCounts && profile?.appearance && spriteDataLoaded) {
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
      // 색상 정보 변환
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
  }, [isUnityLoaded, spriteCounts, profile?.appearance, spriteDataLoaded, appearanceIndexes, loadAppearance]);

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="min-h-dvh" style={{ background: theme.colors.bg }}>
      {/* 헤더 */}
      <header
        className="p-4 flex items-center justify-between border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <div className="flex gap-1 flex-wrap">
          {[
            { id: "status", label: "상태" },
            { id: "traits", label: "특성" },
            { id: "proficiency", label: "숙련도" },
            { id: "skills", label: "스킬" },
            { id: "equipment", label: "장비" },
            { id: "inventory", label: "인벤토리" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
        <Link
          href="/game"
          className="px-4 py-2 text-sm font-mono transition-colors"
          style={{
            background: theme.colors.bgDark,
            color: theme.colors.textMuted,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          게임으로 돌아가기
        </Link>
      </header>

      {/* 컨텐츠 - Grid로 두 탭 높이 동기화 */}
      <div className="p-4 max-w-4xl mx-auto">
        {profileLoading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
              style={{ borderColor: theme.colors.primary, borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <div className="grid">
            {/* 상태 탭 - 같은 그리드 셀 공유 */}
            <div className={`col-start-1 row-start-1 ${activeTab === "status" ? "" : "invisible"}`}>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* 캐릭터 프리뷰 - 고정 높이 */}
                <div className="lg:w-1/2 flex-shrink-0">
                  <div
                    className="overflow-hidden h-52 sm:h-64 lg:h-80"
                    style={{ background: theme.colors.bgDark }}
                  >
                    <DynamicUnityCanvas />
                  </div>
                  {mainCharacter && (
                    <div className="mt-4 text-center">
                      <h2
                        className="text-2xl font-mono font-bold"
                        style={{ color: theme.colors.text }}
                      >
                        {mainCharacter.name}
                      </h2>
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

                  {/* 피로도 */}
                  <div className="p-4" style={{ background: theme.colors.bgDark }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono" style={{ color: theme.colors.textMuted }}>피로도</span>
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
                        ].map(({ key, label, icon }) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-sm">{icon}</span>
                            <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>{label}</span>
                            <span className="font-mono font-medium ml-auto" style={{ color: theme.colors.text }}>
                              {(mainCharacter.stats as any)[key] ?? 10}
                            </span>
                          </div>
                        ))}
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

                  {/* 프리미엄 상태 */}
                  {profile?.isPremium && (
                    <div
                      className="p-4"
                      style={{
                        background: `${theme.colors.warning}15`,
                        border: `1px solid ${theme.colors.warning}50`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        <div>
                          <div className="font-mono font-medium" style={{ color: theme.colors.warning }}>
                            프리미엄 회원
                          </div>
                          {profile.premiumUntil && (
                            <div className="text-xs font-mono" style={{ color: `${theme.colors.warning}99` }}>
                              {new Date(profile.premiumUntil).toLocaleDateString()}까지
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 특성 탭 */}
            <div className={`col-start-1 row-start-1 ${activeTab === "traits" ? "" : "invisible"}`}>
              {characterTraits.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-64 font-mono"
                  style={{ color: theme.colors.textMuted }}
                >
                  <p className="text-4xl mb-4">🏷️</p>
                  <p>보유한 특성이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {TRAIT_CATEGORY_ORDER.map((category) => {
                    const categoryInfo = TRAIT_CATEGORIES[category];
                    const categoryTraits = characterTraits
                      .filter((ct) => ct.trait?.category === category)
                      .map((ct) => ct.trait)
                      .filter((t): t is Trait => t !== undefined);

                    if (categoryTraits.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3
                          className="text-lg font-mono font-bold mb-3 flex items-center gap-2"
                          style={{ color: theme.colors.text }}
                        >
                          <span>{categoryInfo.icon}</span>
                          <span>{categoryInfo.nameKo}</span>
                          <span className="text-sm font-normal" style={{ color: theme.colors.textMuted }}>
                            ({categoryTraits.length})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {categoryTraits.map((trait) => (
                            <TraitCard key={trait.id} trait={trait} theme={theme} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 숙련도 탭 */}
            <div className={`col-start-1 row-start-1 ${activeTab === "proficiency" ? "" : "invisible"}`}>
              <div className="space-y-6">
                {/* 무기 숙련도 */}
                <div>
                  <h3 className="text-lg font-mono font-bold mb-3" style={{ color: theme.colors.text }}>
                    무기 숙련도
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {WEAPON_PROFICIENCIES.map((prof) => {
                      const level = getProficiencyValue(proficiencies, prof.id as ProficiencyType) ?? 0;
                      const rank = getRankInfo(level);
                      return (
                        <div
                          key={prof.id}
                          className="p-3 flex items-center gap-3"
                          style={{ background: theme.colors.bgDark }}
                        >
                          <span className="text-2xl">{prof.icon}</span>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.text }}>
                                {prof.nameKo}
                              </span>
                              <span className="text-sm font-mono" style={{ color: theme.colors.primary }}>
                                {rank.nameKo}
                              </span>
                            </div>
                            <div className="mt-1 h-2" style={{ background: theme.colors.bgLight }}>
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${level}%`,
                                  background: theme.colors.primary,
                                }}
                              />
                            </div>
                            <div className="text-xs font-mono mt-0.5" style={{ color: theme.colors.textMuted }}>
                              {level}/100
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 마법 숙련도 */}
                <div>
                  <h3 className="text-lg font-mono font-bold mb-3" style={{ color: theme.colors.text }}>
                    마법 숙련도
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MAGIC_PROFICIENCIES.map((prof) => {
                      const level = getProficiencyValue(proficiencies, prof.id as ProficiencyType) ?? 0;
                      const rank = getRankInfo(level);
                      return (
                        <div
                          key={prof.id}
                          className="p-3 flex items-center gap-3"
                          style={{ background: theme.colors.bgDark }}
                        >
                          <span className="text-2xl">{prof.icon}</span>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.text }}>
                                {prof.nameKo}
                              </span>
                              <span className="text-sm font-mono" style={{ color: theme.colors.primary }}>
                                {rank.nameKo}
                              </span>
                            </div>
                            <div className="mt-1 h-2" style={{ background: theme.colors.bgLight }}>
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${level}%`,
                                  background: theme.colors.primary,
                                }}
                              />
                            </div>
                            <div className="text-xs font-mono mt-0.5" style={{ color: theme.colors.textMuted }}>
                              {level}/100
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 스킬 탭 */}
            <div className={`col-start-1 row-start-1 ${activeTab === "skills" ? "" : "invisible"}`}>
              {equipmentStore.learnedSkills.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-64 font-mono"
                  style={{ color: theme.colors.textMuted }}
                >
                  <p className="text-4xl mb-4">📖</p>
                  <p>배운 스킬이 없습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipmentStore.learnedSkills.map((skillId) => (
                    <div
                      key={skillId}
                      className="p-4 flex items-start gap-3"
                      style={{ background: theme.colors.bgDark }}
                    >
                      <span className="text-3xl">📖</span>
                      <div className="flex-1">
                        <div className="font-mono font-medium" style={{ color: theme.colors.text }}>
                          {skillId}
                        </div>
                        <div className="text-sm font-mono mt-1" style={{ color: theme.colors.textMuted }}>
                          습득한 스킬
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 장비 탭 - 12슬롯 3카테고리 */}
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

            {/* 인벤토리 탭 - 같은 그리드 셀 공유 */}
            <div className={`col-start-1 row-start-1 ${activeTab === "inventory" ? "" : "invisible"}`}>
              {inventoryItems.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full font-mono"
                  style={{ color: theme.colors.textMuted }}
                >
                  <p className="text-4xl mb-4">📦</p>
                  <p>인벤토리가 비어있습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {inventoryItems.map((item) => (
                    <div
                      key={`slot-${item.slot}`}
                      className="aspect-square flex flex-col items-center justify-center p-2 cursor-pointer transition-colors"
                      style={{
                        background: theme.colors.bgDark,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <span className="text-2xl">📦</span>
                      <span
                        className="text-xs font-mono truncate w-full text-center mt-1"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {item.itemId}
                      </span>
                      {item.quantity > 1 && (
                        <span
                          className="text-xs font-mono px-1.5 mt-1"
                          style={{
                            background: theme.colors.bgLight,
                            color: theme.colors.text,
                          }}
                        >
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 특성 카드 컴포넌트
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TraitCard({ trait, theme }: { trait: Trait; theme: any }) {
  const rarityInfo = TRAIT_RARITIES[trait.rarity];
  const effects = formatTraitEffects(trait.effects);

  return (
    <div
      className="p-4 rounded"
      style={{
        background: theme.colors.bgDark,
        border: `1px solid ${rarityInfo.color}40`,
      }}
    >
      {/* 헤더 */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl">{trait.icon}</span>
        <div className="flex-1">
          <div className="font-mono font-bold" style={{ color: rarityInfo.color }}>
            {trait.nameKo}
          </div>
          <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
            {rarityInfo.nameKo}
          </div>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-xs font-mono mb-2" style={{ color: theme.colors.textMuted }}>
        {trait.description}
      </p>

      {/* 효과 */}
      {effects.length > 0 && (
        <div className="border-t pt-2" style={{ borderColor: theme.colors.border }}>
          <div className="flex flex-wrap gap-2">
            {effects.map((effect, i) => {
              const isNegative = effect.includes("-");
              return (
                <span
                  key={i}
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: isNegative ? `${theme.colors.error}20` : `${theme.colors.success}20`,
                    color: isNegative ? theme.colors.error : theme.colors.success,
                  }}
                >
                  {effect}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
