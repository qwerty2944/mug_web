"use client";

import { useAppearanceAnimation } from "@/application/stores";

export function AnimationSelector() {
  const { state, index, total, states, next, prev, changeState } = useAppearanceAnimation();

  return (
    <div className="space-y-2">
      {/* 상태 버튼들 */}
      {states.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {states.map((s) => (
            <button
              key={s}
              onClick={() => changeState(s)}
              className={`px-2 py-1 text-xs rounded ${
                state === s ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 클립 선택 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">클립</span>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="btn-icon">&lt;</button>
          <span className="text-xs w-12 text-center">
            {index + 1}/{total}
          </span>
          <button onClick={next} className="btn-icon">&gt;</button>
        </div>
      </div>
    </div>
  );
}
