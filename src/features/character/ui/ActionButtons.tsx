"use client";

import { useAppearanceActions } from "@/application/stores";

export function ActionButtons() {
  const { randomizeAppearance, randomizeEquipment, clearAll, resetColors } = useAppearanceActions();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={randomizeAppearance} className="btn-action bg-purple-600">
          외형 랜덤
        </button>
        <button onClick={randomizeEquipment} className="btn-action bg-indigo-600">
          장비 랜덤
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={clearAll} className="btn-action bg-gray-600">
          초기화
        </button>
        <button onClick={resetColors} className="btn-action bg-gray-600">
          색상 리셋
        </button>
      </div>
    </div>
  );
}
