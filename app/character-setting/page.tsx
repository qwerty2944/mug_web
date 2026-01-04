"use client";

import { UnityCanvas, characterPanelHooks } from "@/features/character";
import { CharacterPanel } from "@/widgets/character-panel";
import { globalStyles } from "@/shared/ui";

export default function CharacterSettingPage() {
  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="flex-none p-3 border-b border-gray-700 safe-area-top">
        <h1 className="text-lg font-bold text-center">캐릭터 설정</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Unity 캔버스 */}
        <div className="flex-1 min-h-0 flex items-center justify-center p-2">
          <div className="w-full h-full max-w-lg">
            <UnityCanvas />
          </div>
        </div>

        {/* 컨트롤 패널 - 위젯 사용 */}
        <CharacterPanel
          hooks={characterPanelHooks}
          className="flex-none lg:w-80 max-h-[45vh] lg:max-h-full overflow-y-auto safe-area-bottom"
        />
      </div>

      <style jsx global>{globalStyles}</style>
    </div>
  );
}
