"use client";

import { UnityCanvas, useCharacterStore } from "@/features/character";

interface CharacterCreatorProps {
  className?: string;
}

export function CharacterCreator({ className = "" }: CharacterCreatorProps) {
  const {
    characterState,
    spriteCounts,
    selectedColor,
    setSelectedColor,
    callUnity,
  } = useCharacterStore();

  const eyeIndex = characterState?.eyeIndex ?? 0;
  const hairIndex = characterState?.hairIndex ?? -1;
  const eyeCount = spriteCounts?.eyeCount ?? 0;
  const hairCount = spriteCounts?.hairCount ?? 0;

  const handlePrevEye = () => callUnity("JS_PrevEye");
  const handleNextEye = () => callUnity("JS_NextEye");
  const handlePrevHair = () => callUnity("JS_PrevHair");
  const handleNextHair = () => callUnity("JS_NextHair");

  const applyEyeColor = () => {
    const hex = selectedColor.replace("#", "");
    callUnity("JS_SetEyeColor", hex);
  };

  const applyHairColor = () => {
    const hex = selectedColor.replace("#", "");
    callUnity("JS_SetHairColor", hex);
  };

  const presetColors = [
    "#2C1810", // 갈색 (머리)
    "#1A1A1A", // 검정
    "#8B4513", // 밤색
    "#D4A574", // 금발
    "#C0C0C0", // 은발
    "#8B0000", // 적갈색
    "#4169E1", // 파랑 (눈)
    "#228B22", // 초록 (눈)
  ];

  return (
    <div className={`flex flex-col lg:flex-row h-full ${className}`}>
      {/* Unity 캔버스 */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2">
        <div className="w-full h-full max-w-lg">
          <UnityCanvas />
        </div>
      </div>

      {/* 커스터마이징 패널 */}
      <div className="flex-none lg:w-72 p-4 bg-gray-800 space-y-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-400">외형 커스터마이징</h3>

        {/* 눈 */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">눈</span>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevEye} className="btn-icon">&lt;</button>
              <span className="w-12 text-center text-xs text-gray-400">
                {eyeIndex + 1}/{eyeCount}
              </span>
              <button onClick={handleNextEye} className="btn-icon">&gt;</button>
            </div>
          </div>
          <button
            onClick={applyEyeColor}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            눈 색상 적용
          </button>
        </section>

        {/* 머리 */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">머리</span>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevHair} className="btn-icon">&lt;</button>
              <span className="w-12 text-center text-xs text-gray-400">
                {hairIndex >= 0 ? hairIndex + 1 : "-"}/{hairCount}
              </span>
              <button onClick={handleNextHair} className="btn-icon">&gt;</button>
            </div>
          </div>
          <button
            onClick={applyHairColor}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            머리 색상 적용
          </button>
        </section>

        {/* 색상 선택 */}
        <section className="space-y-2">
          <span className="text-sm text-gray-400">색상</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <div className="flex-1 grid grid-cols-4 gap-1">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded border-2 transition-colors ${
                    selectedColor === color ? "border-white" : "border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 안내 */}
        <p className="text-xs text-gray-500 mt-4">
          종족과 시작 장비는 이전 단계에서 선택한 대로 적용됩니다.
        </p>
      </div>
    </div>
  );
}
