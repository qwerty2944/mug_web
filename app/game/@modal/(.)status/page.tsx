"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth";
import { UnityCanvas, useAppearanceStore } from "@/features/character";
import {
  useProfile,
  getMainCharacter,
  getExpPercentage,
  getExpToNextLevel,
} from "@/entities/user";
import { useInventory } from "@/entities/inventory";
import { useProficiencies, WEAPON_PROFICIENCIES, MAGIC_PROFICIENCIES, getRankInfo } from "@/entities/proficiency";
import type { ProficiencyType } from "@/entities/proficiency";
import { useEquipmentStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";

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

                    {/* 스태미나 */}
                    <div className="p-4" style={{ background: theme.colors.bgDark }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono" style={{ color: theme.colors.textMuted }}>스태미나</span>
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
                        const level = proficiencies?.[prof.id as ProficiencyType] ?? 0;
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
                        const level = proficiencies?.[prof.id as ProficiencyType] ?? 0;
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

              {/* 장비 탭 */}
              <div className={`col-start-1 row-start-1 ${activeTab === "equipment" ? "" : "invisible"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["weapon", "armor", "helmet", "accessory"] as const).map((slot) => {
                    const item = equipmentStore[slot];
                    const slotNames = {
                      weapon: "무기",
                      armor: "갑옷",
                      helmet: "투구",
                      accessory: "장신구",
                    };
                    const slotIcons = {
                      weapon: "⚔️",
                      armor: "🛡️",
                      helmet: "🎩",
                      accessory: "💍",
                    };
                    return (
                      <div
                        key={slot}
                        className="p-4"
                        style={{
                          background: theme.colors.bgDark,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{slotIcons[slot]}</span>
                          <span className="font-mono" style={{ color: theme.colors.textMuted }}>
                            {slotNames[slot]}
                          </span>
                        </div>
                        {item ? (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <div className="font-mono font-medium" style={{ color: theme.colors.text }}>
                                {item.itemName}
                              </div>
                              {item.stats && Object.keys(item.stats).length > 0 && (
                                <div className="text-xs font-mono mt-1" style={{ color: theme.colors.success }}>
                                  {Object.entries(item.stats)
                                    .map(([stat, val]) => `${stat.toUpperCase()} +${val}`)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-mono" style={{ color: theme.colors.textMuted }}>
                            장착된 장비 없음
                          </div>
                        )}
                      </div>
                    );
                  })}
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
