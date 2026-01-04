"use client";

import { useState, useEffect } from "react";
import { UnityCanvas, useCharacterStore } from "@/features/character";

interface CharacterCreatorProps {
  className?: string;
}

interface EyeMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
}

interface HairMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
  race: string;
}

export function CharacterCreator({ className = "" }: CharacterCreatorProps) {
  const { characterState, spriteCounts, callUnity } = useCharacterStore();

  const [leftEyeColor, setLeftEyeColor] = useState("#4169E1");
  const [rightEyeColor, setRightEyeColor] = useState("#4169E1");
  const [hairColor, setHairColor] = useState("#2C1810");

  const [eyeMappings, setEyeMappings] = useState<EyeMapping[]>([]);
  const [hairMappings, setHairMappings] = useState<HairMapping[]>([]);

  const eyeIndex = characterState?.eyeIndex ?? 0;
  const hairIndex = characterState?.hairIndex ?? -1;
  const eyeCount = spriteCounts?.eyeCount ?? 0;
  const hairCount = spriteCounts?.hairCount ?? 0;

  // 매핑 데이터 로드
  useEffect(() => {
    fetch("/data/eye-mapping.json")
      .then((res) => res.json())
      .then((data) => setEyeMappings(data.eyes))
      .catch(console.error);

    fetch("/data/hair-mapping.json")
      .then((res) => res.json())
      .then((data) => setHairMappings(data.hairs))
      .catch(console.error);
  }, []);

  const currentEyeName = eyeMappings[eyeIndex]?.ko ?? `눈 ${eyeIndex + 1}`;
  const currentHairName = hairMappings[hairIndex]?.ko ?? (hairIndex >= 0 ? `머리 ${hairIndex + 1}` : "없음");

  // 색상 변경 시 Unity에 적용
  useEffect(() => {
    callUnity("JS_SetLeftEyeColor", leftEyeColor.replace("#", ""));
  }, [leftEyeColor, callUnity]);

  useEffect(() => {
    callUnity("JS_SetRightEyeColor", rightEyeColor.replace("#", ""));
  }, [rightEyeColor, callUnity]);

  useEffect(() => {
    callUnity("JS_SetHairColor", hairColor.replace("#", ""));
  }, [hairColor, callUnity]);

  return (
    <div className={`flex flex-col lg:flex-row h-full ${className}`}>
      {/* Unity 캔버스 */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2">
        <div className="w-full h-full max-w-lg">
          <UnityCanvas />
        </div>
      </div>

      {/* 커스터마이징 패널 */}
      <div className="flex-none lg:w-80 p-4 bg-gray-800 space-y-5 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-400">외형 커스터마이징</h3>

        {/* 눈 선택 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-300">눈</span>
              <span className="ml-2 text-xs text-blue-400">{currentEyeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => callUnity("JS_PrevEye")} className="btn-icon">&lt;</button>
              <span className="w-12 text-center text-xs text-gray-400">
                {eyeIndex + 1}/{eyeCount}
              </span>
              <button onClick={() => callUnity("JS_NextEye")} className="btn-icon">&gt;</button>
            </div>
          </div>

          {/* 왼쪽 눈 색상 */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16">왼쪽 눈</span>
            <input
              type="color"
              value={leftEyeColor}
              onChange={(e) => setLeftEyeColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors"
            />
            <span className="text-xs text-gray-500 font-mono">{leftEyeColor.toUpperCase()}</span>
          </div>

          {/* 오른쪽 눈 색상 */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16">오른쪽 눈</span>
            <input
              type="color"
              value={rightEyeColor}
              onChange={(e) => setRightEyeColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors"
            />
            <span className="text-xs text-gray-500 font-mono">{rightEyeColor.toUpperCase()}</span>
          </div>

          {/* 양쪽 동시 적용 버튼 */}
          <button
            onClick={() => setRightEyeColor(leftEyeColor)}
            className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          >
            왼쪽 색상을 오른쪽에도 적용
          </button>
        </section>

        <hr className="border-gray-700" />

        {/* 머리 선택 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-300">머리</span>
              <span className="ml-2 text-xs text-blue-400">{currentHairName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => callUnity("JS_PrevHair")} className="btn-icon">&lt;</button>
              <span className="w-12 text-center text-xs text-gray-400">
                {hairIndex >= 0 ? hairIndex + 1 : "-"}/{hairCount}
              </span>
              <button onClick={() => callUnity("JS_NextHair")} className="btn-icon">&gt;</button>
            </div>
          </div>

          {/* 머리 색상 */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16">색상</span>
            <input
              type="color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors"
            />
            <span className="text-xs text-gray-500 font-mono">{hairColor.toUpperCase()}</span>
          </div>
        </section>

        {/* 안내 */}
        <p className="text-xs text-gray-500 pt-2">
          종족과 시작 장비는 이전 단계에서 선택됩니다.
        </p>
      </div>
    </div>
  );
}
