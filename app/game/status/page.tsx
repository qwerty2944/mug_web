"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth";
import { UnityCanvas, useAppearanceStore } from "@/features/character";
import {
  useProfile,
  getMainCharacter,
  getExpPercentage,
  getExpToNextLevel,
} from "@/entities/user";
import { useInventory } from "@/entities/inventory";
import { useThemeStore } from "@/shared/config";

export default function StatusPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { session } = useAuthStore();
  const { isUnityLoaded, spriteCounts, loadAppearance } = useAppearanceStore();

  // React Query로 서버 상태 관리
  const { data: profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const { data: inventory = [] } = useInventory(session?.user?.id);

  // 로컬 UI 상태 (탭 전환)
  const [activeTab, setActiveTab] = useState<"status" | "inventory">("status");

  const mainCharacter = getMainCharacter(profile);

  // 로그인 체크
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/login");
    }
  }, [session, router]);

  // Unity 스프라이트 로드 완료 후 캐릭터 외형 적용
  useEffect(() => {
    if (isUnityLoaded && spriteCounts && mainCharacter?.appearance && mainCharacter?.colors) {
      loadAppearance(mainCharacter.appearance, mainCharacter.colors);
    }
  }, [isUnityLoaded, spriteCounts, mainCharacter, loadAppearance]);

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
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("status")}
            className="px-4 py-2 text-sm font-mono font-medium transition-colors"
            style={{
              background: activeTab === "status" ? theme.colors.primary : theme.colors.bgDark,
              color: activeTab === "status" ? theme.colors.bg : theme.colors.textMuted,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            상태
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className="px-4 py-2 text-sm font-mono font-medium transition-colors"
            style={{
              background: activeTab === "inventory" ? theme.colors.primary : theme.colors.bgDark,
              color: activeTab === "inventory" ? theme.colors.bg : theme.colors.textMuted,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            인벤토리
          </button>
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
                    <UnityCanvas />
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

            {/* 인벤토리 탭 - 같은 그리드 셀 공유 */}
            <div className={`col-start-1 row-start-1 ${activeTab === "inventory" ? "" : "invisible"}`}>
              {inventory.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full font-mono"
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
  );
}
