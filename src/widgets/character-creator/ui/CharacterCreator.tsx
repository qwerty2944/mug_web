"use client";

import { useState, useEffect } from "react";
import { UnityCanvas, useAppearanceStore } from "@/features/character";

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

interface FacehairMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
}

export function CharacterCreator({ className = "" }: CharacterCreatorProps) {
  const { characterState, spriteCounts, callUnity } = useAppearanceStore();

  const [leftEyeColor, setLeftEyeColor] = useState("#4169E1");
  const [rightEyeColor, setRightEyeColor] = useState("#4169E1");
  const [hairColor, setHairColor] = useState("#2C1810");
  const [facehairColor, setFacehairColor] = useState("#2C1810");

  const [eyeMappings, setEyeMappings] = useState<EyeMapping[]>([]);
  const [hairMappings, setHairMappings] = useState<HairMapping[]>([]);
  const [facehairMappings, setFacehairMappings] = useState<FacehairMapping[]>([]);

  const eyeIndex = characterState?.eyeIndex ?? 0;
  const hairIndex = characterState?.hairIndex ?? -1;
  const facehairIndex = characterState?.facehairIndex ?? -1;
  const eyeCount = spriteCounts?.eyeCount ?? 0;
  const hairCount = spriteCounts?.hairCount ?? 0;
  const facehairCount = spriteCounts?.facehairCount ?? 0;

  // 매핑 데이터 로드
  useEffect(() => {
    fetch("/data/character/eye-mapping.json")
      .then((res) => res.json())
      .then((data) => setEyeMappings(data.eyes))
      .catch(console.error);

    fetch("/data/character/hair-mapping.json")
      .then((res) => res.json())
      .then((data) => setHairMappings(data.hairs))
      .catch(console.error);

    fetch("/data/character/facehair-mapping.json")
      .then((res) => res.json())
      .then((data) => setFacehairMappings(data.facehairs))
      .catch(console.error);
  }, []);

  const currentEyeName = eyeMappings.find(m => m.index === eyeIndex)?.ko ?? `눈 ${eyeIndex + 1}`;
  const currentHairName = hairMappings.find(m => m.index === hairIndex)?.ko
    ?? (hairIndex >= 0 ? `머리 ${hairIndex + 1}` : "민머리");
  const currentFacehairName = facehairMappings.find(m => m.index === facehairIndex)?.ko
    ?? (facehairIndex >= 0 ? `수염 ${facehairIndex + 1}` : "수염없음");

  // 색상 적용 함수
  const applyLeftEyeColor = () => callUnity("JS_SetLeftEyeColor", leftEyeColor.replace("#", ""));
  const applyRightEyeColor = () => callUnity("JS_SetRightEyeColor", rightEyeColor.replace("#", ""));
  const applyHairColor = () => callUnity("JS_SetHairColor", hairColor.replace("#", ""));
  const applyFacehairColor = () => callUnity("JS_SetFacehairColor", facehairColor.replace("#", ""));

  // 머리 색상과 수염 색상 동기화
  const syncFacehairWithHair = () => {
    setFacehairColor(hairColor);
    callUnity("JS_SetFacehairColor", hairColor.replace("#", ""));
  };

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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14">왼쪽 눈</span>
            <input
              type="color"
              value={leftEyeColor}
              onChange={(e) => setLeftEyeColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors"
            />
            <span className="text-xs text-gray-500 font-mono flex-1">{leftEyeColor.toUpperCase()}</span>
            <button
              onClick={applyLeftEyeColor}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
            >
              적용
            </button>
          </div>

          {/* 오른쪽 눈 색상 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14">오른쪽 눈</span>
            <input
              type="color"
              value={rightEyeColor}
              onChange={(e) => setRightEyeColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors"
            />
            <span className="text-xs text-gray-500 font-mono flex-1">{rightEyeColor.toUpperCase()}</span>
            <button
              onClick={applyRightEyeColor}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
            >
              적용
            </button>
          </div>

          {/* 양쪽 동시 적용 버튼 */}
          <button
            onClick={() => {
              setRightEyeColor(leftEyeColor);
              callUnity("JS_SetLeftEyeColor", leftEyeColor.replace("#", ""));
              callUnity("JS_SetRightEyeColor", leftEyeColor.replace("#", ""));
            }}
            className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          >
            왼쪽 색상을 양쪽에 적용
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
              <button
                onClick={() => callUnity("JS_SetHair", "-1")}
                className="btn-icon text-red-400 hover:text-red-300"
                title="민머리"
              >
                X
              </button>
            </div>
          </div>

          {/* 머리 색상 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14">색상</span>
            <input
              type="color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors"
            />
            <span className="text-xs text-gray-500 font-mono flex-1">{hairColor.toUpperCase()}</span>
            <button
              onClick={applyHairColor}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
            >
              적용
            </button>
          </div>
        </section>

        <hr className="border-gray-700" />

        {/* 수염 선택 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-300">수염</span>
              <span className="ml-2 text-xs text-blue-400">{currentFacehairName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => callUnity("JS_PrevFacehair")} className="btn-icon">&lt;</button>
              <span className="w-12 text-center text-xs text-gray-400">
                {facehairIndex >= 0 ? facehairIndex + 1 : "-"}/{facehairCount}
              </span>
              <button onClick={() => callUnity("JS_NextFacehair")} className="btn-icon">&gt;</button>
              <button
                onClick={() => callUnity("JS_SetFacehair", "-1")}
                className="btn-icon text-red-400 hover:text-red-300"
                title="수염없음"
              >
                X
              </button>
            </div>
          </div>

          {/* 수염 색상 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14">색상</span>
            <input
              type="color"
              value={facehairColor}
              onChange={(e) => setFacehairColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors"
            />
            <span className="text-xs text-gray-500 font-mono flex-1">{facehairColor.toUpperCase()}</span>
            <button
              onClick={applyFacehairColor}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
            >
              적용
            </button>
          </div>

          {/* 머리 색상과 동기화 버튼 */}
          <button
            onClick={syncFacehairWithHair}
            className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          >
            머리 색상과 동일하게 적용
          </button>
        </section>

        {/* 안내 */}
        <p className="text-xs text-gray-500 pt-2">
          종족과 시작 장비는 이전 단계에서 선택됩니다.
        </p>
      </div>
    </div>
  );
}
