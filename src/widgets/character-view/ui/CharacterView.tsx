"use client";

import { useState } from "react";
import { UnityCanvas } from "@/features/character";
import { CharacterPanel } from "@/widgets/character-panel";
import type { CharacterPanelHooks } from "@/shared/types";

interface CharacterViewProps {
  hooks: CharacterPanelHooks;
  showPanel?: boolean;        // 패널 표시 여부 (기본: true)
  allowToggle?: boolean;      // 토글 버튼 표시 (기본: false)
  className?: string;
}

export function CharacterView({
  hooks,
  showPanel = true,
  allowToggle = false,
  className = "",
}: CharacterViewProps) {
  const [isPanelVisible, setIsPanelVisible] = useState(showPanel);

  return (
    <div className={`relative flex flex-col lg:flex-row h-full ${className}`}>
      {/* Unity 캔버스 */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2">
        <div className="w-full h-full max-w-2xl relative">
          <UnityCanvas />

          {/* 토글 버튼 */}
          {allowToggle && (
            <button
              onClick={() => setIsPanelVisible(!isPanelVisible)}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
              title={isPanelVisible ? "패널 숨기기" : "패널 보기"}
            >
              {isPanelVisible ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {/* 컨트롤 패널 */}
      {isPanelVisible && (
        <CharacterPanel
          hooks={hooks}
          className="flex-none lg:w-80 max-h-[45vh] lg:max-h-full overflow-y-auto"
        />
      )}
    </div>
  );
}
