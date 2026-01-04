"use client";

import { characterPanelHooks } from "@/features/character";
import { CharacterView } from "@/widgets/character-view";
import { globalStyles } from "@/shared/ui";

export default function CharacterTestPage() {
  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="flex-none p-3 border-b border-gray-700 safe-area-top">
        <h1 className="text-lg font-bold text-center">캐릭터 테스트</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-h-0 safe-area-bottom">
        <CharacterView
          hooks={characterPanelHooks}
          showPanel={true}
          allowToggle={true}
        />
      </div>

      <style jsx global>{globalStyles}</style>
    </div>
  );
}
