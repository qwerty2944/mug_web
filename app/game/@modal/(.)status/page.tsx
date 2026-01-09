"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/features/auth";
import { UnityCanvas, useAppearanceStore } from "@/features/character";
import {
  useProfile,
  getMainCharacter,
  getExpPercentage,
  getExpToNextLevel,
} from "@/entities/user";
import { useInventory } from "@/entities/inventory";
import {
  useProficiencies,
  WEAPON_PROFICIENCIES,
  MAGIC_PROFICIENCIES,
  CRAFTING_PROFICIENCIES,
  MEDICAL_PROFICIENCIES,
  KNOWLEDGE_PROFICIENCIES,
  getRankInfo,
  getProficiencyValue,
} from "@/entities/proficiency";
import type { ProficiencyType } from "@/entities/proficiency";
import { useEquipmentStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import { SLOT_CONFIG, type EquipmentSlot } from "@/entities/item";
import { calculateDerivedStats } from "@/entities/character";

type TabType = "status" | "proficiency" | "skills" | "equipment" | "inventory";

export default function StatusModal() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { session } = useAuthStore();
  const { isUnityLoaded, spriteCounts, loadAppearance } = useAppearanceStore();

  // React Query로 서버 상태 관리
  const { data: profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const { data: inventory = [] } = useInventory(session?.user?.id);
  const { data: proficiencies } = useProficiencies(session?.user?.id);

  // 장비 스토어
  const equipmentStore = useEquipmentStore();

  // 로컬 UI 상태 (탭 전환)
  const [activeTab, setActiveTab] = useState<TabType>("status");

  const mainCharacter = getMainCharacter(profile);

  // 파생 스탯 계산
  const derivedStats = useMemo(() => {
    if (!mainCharacter?.stats) return null;
    return calculateDerivedStats(
      mainCharacter.stats,
      equipmentStore.getTotalStats(),
      profile?.level ?? 1
    );
  }, [mainCharacter?.stats, equipmentStore, profile?.level]);

  // Unity 스프라이트 로드 완료 후 캐릭터 외형 적용
  useEffect(() => {
    if (isUnityLoaded && spriteCounts && mainCharacter?.appearance && mainCharacter?.colors) {
      loadAppearance(mainCharacter.appearance, mainCharacter.colors);
    }
  }, [isUnityLoaded, spriteCounts, mainCharacter, loadAppearance]);

  const handleClose = () => {
    router.back();
  };

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "status", label: "상태" },
    { id: "proficiency", label: "숙련도" },
    { id: "skills", label: "스킬" },
    { id: "equipment", label: "장비" },
    { id: "inventory", label: "인벤토리" },
  ];

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
            onClick={handleClose}
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
                      <UnityCanvas />
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
                    {mainCharacter?.stats && (
                      <div className="p-4 space-y-3" style={{ background: theme.colors.bgDark }}>
                        {/* HP */}
                        {(() => {
                          const baseCon = mainCharacter.stats.con ?? 10;
                          const maxHp = 50 + baseCon * 5 + (profile?.level || 1) * 10;
                          const currentHp = profile?.currentHp ?? maxHp;
                          const hpPercent = (currentHp / maxHp) * 100;
                          return (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
                                  <span>❤️</span> HP
                                </span>
                                <span className="text-lg font-mono font-medium" style={{ color: theme.colors.error }}>
                                  {currentHp} / {maxHp}
                                </span>
                              </div>
                              <div className="h-3 overflow-hidden" style={{ background: theme.colors.bgLight }}>
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${hpPercent}%`,
                                    background: hpPercent > 50 ? theme.colors.error : hpPercent > 20 ? theme.colors.warning : "#ff3333",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {/* MP */}
                        {(() => {
                          const baseInt = mainCharacter.stats.int ?? 10;
                          const baseWis = mainCharacter.stats.wis ?? 10;
                          const maxMp = 20 + baseWis * 3 + baseInt;
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

                    {/* 스태미나 */}
                    <div className="p-4" style={{ background: theme.colors.bgDark }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
                          <span>⚡</span> 스태미나
                        </span>
                        <span className="text-lg font-mono font-medium" style={{ color: theme.colors.text }}>
                          {profile?.stamina || 0} / {profile?.maxStamina || 100}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden" style={{ background: theme.colors.bgLight }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${((profile?.stamina || 0) / (profile?.maxStamina || 100)) * 100}%`,
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
                                {(mainCharacter.stats as unknown as Record<string, number>)[key] ?? 10}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 파생 전투 스탯 */}
                    {derivedStats && (
                      <div className="p-4 space-y-4" style={{ background: theme.colors.bgDark }}>
                        {/* 공격/방어력 */}
                        <div>
                          <div className="text-sm font-mono mb-2" style={{ color: theme.colors.textMuted }}>전투 능력</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>⚔️ 물리 공격</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.error }}>{derivedStats.totalPhysicalAttack}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>🛡️ 물리 방어</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.primary }}>{derivedStats.totalPhysicalDefense}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>✨ 마법 공격</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.error }}>{derivedStats.totalMagicAttack}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>🔮 마법 방어</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.primary }}>{derivedStats.totalMagicDefense}</span>
                            </div>
                          </div>
                        </div>

                        {/* 치명타/암습 */}
                        <div>
                          <div className="text-sm font-mono mb-2" style={{ color: theme.colors.textMuted }}>치명타/암습</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>💥 치명타 확률</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.warning }}>{derivedStats.critChance.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>💥 치명타 피해</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.warning }}>{derivedStats.critDamage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>🗡️ 암습 확률</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.text }}>{derivedStats.totalAmbushChance}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>🗡️ 암습 피해</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.text }}>{derivedStats.totalAmbushDamage}%</span>
                            </div>
                          </div>
                        </div>

                        {/* 회피/막기 */}
                        <div>
                          <div className="text-sm font-mono mb-2" style={{ color: theme.colors.textMuted }}>방어 능력</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>🌀 회피</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.success }}>{derivedStats.totalDodgeChance}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>🛡️ 막기</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.success }}>{derivedStats.totalBlockChance}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>⚔️ 무기막기</span>
                              <span className="font-mono font-medium" style={{ color: theme.colors.success }}>{derivedStats.totalWeaponBlockChance}%</span>
                            </div>
                          </div>
                        </div>

                        {/* 물리 저항 (베기/찌르기/타격) */}
                        <div>
                          <div className="text-sm font-mono mb-2" style={{ color: theme.colors.textMuted }}>물리 저항</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex flex-col items-center p-2" style={{ background: theme.colors.bgLight }}>
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>베기</span>
                              <span className="font-mono font-medium" style={{
                                color: derivedStats.totalPhysicalResistance.slashResist < 1 ? theme.colors.success :
                                       derivedStats.totalPhysicalResistance.slashResist > 1 ? theme.colors.error : theme.colors.text
                              }}>
                                {derivedStats.totalPhysicalResistance.slashResist < 1 ? "강함" :
                                 derivedStats.totalPhysicalResistance.slashResist > 1 ? "약함" : "보통"}
                              </span>
                            </div>
                            <div className="flex flex-col items-center p-2" style={{ background: theme.colors.bgLight }}>
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>찌르기</span>
                              <span className="font-mono font-medium" style={{
                                color: derivedStats.totalPhysicalResistance.pierceResist < 1 ? theme.colors.success :
                                       derivedStats.totalPhysicalResistance.pierceResist > 1 ? theme.colors.error : theme.colors.text
                              }}>
                                {derivedStats.totalPhysicalResistance.pierceResist < 1 ? "강함" :
                                 derivedStats.totalPhysicalResistance.pierceResist > 1 ? "약함" : "보통"}
                              </span>
                            </div>
                            <div className="flex flex-col items-center p-2" style={{ background: theme.colors.bgLight }}>
                              <span className="font-mono" style={{ color: theme.colors.textMuted }}>타격</span>
                              <span className="font-mono font-medium" style={{
                                color: derivedStats.totalPhysicalResistance.crushResist < 1 ? theme.colors.success :
                                       derivedStats.totalPhysicalResistance.crushResist > 1 ? theme.colors.error : theme.colors.text
                              }}>
                                {derivedStats.totalPhysicalResistance.crushResist < 1 ? "강함" :
                                 derivedStats.totalPhysicalResistance.crushResist > 1 ? "약함" : "보통"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 속성 강화/저항 */}
                        <div>
                          <div className="text-sm font-mono mb-2" style={{ color: theme.colors.textMuted }}>속성 강화/저항</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {[
                              { key: "fire", label: "화염", icon: "🔥" },
                              { key: "ice", label: "냉기", icon: "❄️" },
                              { key: "lightning", label: "번개", icon: "⚡" },
                              { key: "earth", label: "대지", icon: "🪨" },
                              { key: "holy", label: "신성", icon: "✨" },
                              { key: "dark", label: "암흑", icon: "🌑" },
                            ].map(({ key, label, icon }) => {
                              const boost = derivedStats.totalElementBoost[key as keyof typeof derivedStats.totalElementBoost] ?? 0;
                              const resist = derivedStats.totalElementResist[key as keyof typeof derivedStats.totalElementResist] ?? 0;
                              if (boost === 0 && resist === 0) return null;
                              return (
                                <div key={key} className="flex flex-col p-2" style={{ background: theme.colors.bgLight }}>
                                  <span className="font-mono text-center mb-1">{icon} {label}</span>
                                  <div className="flex justify-between">
                                    {boost > 0 && <span style={{ color: theme.colors.error }}>+{boost}%</span>}
                                    {resist > 0 && <span style={{ color: theme.colors.success }}>저항{resist}%</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {/* 모든 속성이 0인 경우 */}
                          {Object.values(derivedStats.totalElementBoost).every(v => v === 0) &&
                           Object.values(derivedStats.totalElementResist).every(v => v === 0) && (
                            <div className="text-xs font-mono text-center py-2" style={{ color: theme.colors.textMuted }}>
                              속성 강화/저항 없음
                            </div>
                          )}
                        </div>

                        {/* 관통 */}
                        {(derivedStats.totalPhysicalPenetration > 0 || derivedStats.totalMagicPenetration > 0) && (
                          <div>
                            <div className="text-sm font-mono mb-2" style={{ color: theme.colors.textMuted }}>방어 관통</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {derivedStats.totalPhysicalPenetration > 0 && (
                                <div className="flex justify-between">
                                  <span className="font-mono" style={{ color: theme.colors.textMuted }}>물리 관통</span>
                                  <span className="font-mono font-medium" style={{ color: theme.colors.warning }}>{derivedStats.totalPhysicalPenetration}%</span>
                                </div>
                              )}
                              {derivedStats.totalMagicPenetration > 0 && (
                                <div className="flex justify-between">
                                  <span className="font-mono" style={{ color: theme.colors.textMuted }}>마법 관통</span>
                                  <span className="font-mono font-medium" style={{ color: theme.colors.warning }}>{derivedStats.totalMagicPenetration}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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

                  {/* 제작 숙련도 */}
                  <div>
                    <h3 className="text-lg font-mono font-bold mb-3" style={{ color: theme.colors.text }}>
                      🛠️ 제작 숙련도
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CRAFTING_PROFICIENCIES.map((prof) => {
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
                                <span className="text-sm font-mono" style={{ color: theme.colors.warning }}>
                                  {rank.nameKo}
                                </span>
                              </div>
                              <div className="mt-1 h-2" style={{ background: theme.colors.bgLight }}>
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${level}%`,
                                    background: theme.colors.warning,
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

                  {/* 의료 숙련도 */}
                  <div>
                    <h3 className="text-lg font-mono font-bold mb-3" style={{ color: theme.colors.text }}>
                      🏥 의료 숙련도
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MEDICAL_PROFICIENCIES.map((prof) => {
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
                                <span className="text-sm font-mono" style={{ color: theme.colors.success }}>
                                  {rank.nameKo}
                                </span>
                              </div>
                              <div className="mt-1 h-2" style={{ background: theme.colors.bgLight }}>
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${level}%`,
                                    background: theme.colors.success,
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

                  {/* 지식 숙련도 */}
                  <div>
                    <h3 className="text-lg font-mono font-bold mb-3" style={{ color: theme.colors.text }}>
                      📚 지식 숙련도
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {KNOWLEDGE_PROFICIENCIES.map((prof) => {
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
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-mono" style={{ color: theme.colors.text }}>
                                    {prof.nameKo}
                                  </span>
                                  <div className="text-[10px] font-mono" style={{ color: theme.colors.textMuted }}>
                                    {prof.description}
                                  </div>
                                </div>
                                <span className="text-sm font-mono" style={{ color: theme.colors.error }}>
                                  {rank.nameKo}
                                </span>
                              </div>
                              <div className="mt-1 h-2" style={{ background: theme.colors.bgLight }}>
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${level}%`,
                                    background: theme.colors.error,
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

              {/* 인벤토리 탭 */}
              <div className={`col-start-1 row-start-1 ${activeTab === "inventory" ? "" : "invisible"}`}>
                {inventory.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-64 font-mono"
                    style={{ color: theme.colors.textMuted }}
                  >
                    <p className="text-4xl mb-4">📦</p>
                    <p>인벤토리가 비어있습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {inventory.map((item) => (
                      <div
                        key={item.id}
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
    </div>
  );
}
