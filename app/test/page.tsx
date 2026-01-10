"use client";

import Link from "next/link";

const TEST_ROUTES = [
  {
    href: "/test/game",
    title: "게임 테스트 (DB ID 기반)",
    description: "실제 DB에 저장되는 형식 테스트 - 아이템/외형 ID 기반",
    icon: "🎮",
  },
  {
    href: "/test/unity",
    title: "유니티 테스트 (스프라이트 인덱스 기반)",
    description: "Unity가 이해하는 형식 테스트 - 스프라이트 인덱스 기반",
    icon: "🎯",
  },
];

export default function TestIndexPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">테스트 페이지</h1>
        <p className="text-gray-400 mb-8">개발용 테스트 페이지 모음</p>

        <div className="space-y-4">
          {TEST_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="block p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-500 hover:bg-gray-750 transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{route.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-colors">
                    {route.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {route.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
