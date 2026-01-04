"use client";

import { useCharacterActions } from "../model";

export function ActionButtons() {
  const { randomize, clearAll, resetColors } = useCharacterActions();

  return (
    <div className="grid grid-cols-3 gap-2">
      <button onClick={randomize} className="btn-action bg-purple-600">
        랜덤
      </button>
      <button onClick={clearAll} className="btn-action bg-red-600">
        초기화
      </button>
      <button onClick={resetColors} className="btn-action bg-gray-600">
        색초기화
      </button>
    </div>
  );
}
