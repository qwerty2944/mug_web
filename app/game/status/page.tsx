"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth";
import { usePlayerStore } from "@/features/game";
import { UnityPortalTarget } from "@/features/character";

export default function StatusPage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const {
    profile,
    inventory,
    isLoading,
    activeTab,
    setActiveTab,
    fetchProfile,
    fetchInventory,
    getMainCharacter,
    getExpPercentage,
    getExpToNextLevel,
  } = usePlayerStore();

  // 로그인 체크
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/login");
    }
  }, [session, router]);

  // 데이터 로드
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id);
      fetchInventory(session.user.id);
    }
  }, [session?.user?.id, fetchProfile, fetchInventory]);

  const mainCharacter = getMainCharacter();

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "status"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            상태
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            인벤토리
          </button>
        </div>
        <Link
          href="/game"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          게임으로 돌아가기
        </Link>
      </header>

      {/* 컨텐츠 */}
      <div className="p-4 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* 상태 탭 */}
            <div className={activeTab === "status" ? "block" : "hidden"}>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* 캐릭터 프리뷰 - 항상 마운트 유지 */}
                <div className="lg:w-1/2">
                  <UnityPortalTarget className="bg-gray-800 rounded-lg overflow-hidden aspect-square max-h-96" />
                  {mainCharacter && (
                    <div className="mt-4 text-center">
                      <h2 className="text-2xl font-bold">{mainCharacter.name}</h2>
                    </div>
                  )}
                </div>

                {/* 스탯 정보 */}
                <div className="lg:w-1/2 space-y-4">
                  {/* 레벨 & 경험치 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">레벨</span>
                      <span className="text-2xl font-bold">Lv.{profile?.level || 1}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>경험치</span>
                        <span>{getExpToNextLevel()} EXP 남음</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${getExpPercentage()}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 스태미나 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">스태미나</span>
                      <span className="text-lg font-medium">
                        {profile?.stamina || 0} / {profile?.maxStamina || 100}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                        style={{
                          width: `${((profile?.stamina || 0) / (profile?.maxStamina || 100)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 재화 */}
                  <div className="bg-gray-800 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <div className="text-xs text-gray-500">골드</div>
                        <div className="text-lg font-medium text-yellow-400">
                          {(profile?.gold || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💎</span>
                      <div>
                        <div className="text-xs text-gray-500">젬</div>
                        <div className="text-lg font-medium text-cyan-400">
                          {(profile?.gems || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 프리미엄 상태 */}
                  {profile?.isPremium && (
                    <div className="bg-gradient-to-r from-amber-900/50 to-yellow-900/50 rounded-lg p-4 border border-amber-600/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        <div>
                          <div className="text-amber-400 font-medium">프리미엄 회원</div>
                          {profile.premiumUntil && (
                            <div className="text-xs text-amber-500/70">
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

            {/* 인벤토리 탭 */}
            <div className={activeTab === "inventory" ? "block" : "hidden"}>
              {inventory.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-4xl mb-4">📦</p>
                  <p>인벤토리가 비어있습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center justify-center p-2 hover:border-gray-500 cursor-pointer transition-colors"
                    >
                      <span className="text-2xl">📦</span>
                      <span className="text-xs text-gray-400 truncate w-full text-center mt-1">
                        {item.itemId}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-white bg-gray-700 px-1.5 rounded mt-1">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
