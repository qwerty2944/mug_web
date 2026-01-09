"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CharacterPanelHooks, PartType, WeaponPartType, HandType } from "../types";
import { useAppearanceStore } from "@/application/stores";

// 훅 주입을 위한 컨텍스트
const HooksContext = createContext<CharacterPanelHooks | null>(null);

function useHooks() {
  const hooks = useContext(HooksContext);
  if (!hooks) throw new Error("CharacterPanel must be wrapped with hooks provider");
  return hooks;
}

// ============ 메인 위젯 ============

interface CharacterPanelProps {
  hooks: CharacterPanelHooks;
  className?: string;
}

export function CharacterPanel({ hooks, className = "" }: CharacterPanelProps) {
  return (
    <HooksContext.Provider value={hooks}>
      <div className={`space-y-3 bg-gray-800 p-3 ${className}`}>
        <Section title="파츠">
          <div className="space-y-1">
            {hooks.partTypes.map((type) => (
              <PartSelector key={type} type={type} />
            ))}
          </div>
        </Section>

        <Section title="손별 무기">
          {hooks.useHandWeapon ? (
            <div className="space-y-2">
              <HandWeaponSelector hand="left" />
              <HandWeaponSelector hand="right" />
            </div>
          ) : (
            <div className="space-y-1">
              {hooks.weaponPartTypes.map((type) => (
                <WeaponSelector key={type} type={type} />
              ))}
            </div>
          )}
        </Section>

        <Section title="애니메이션">
          <AnimationSelector />
        </Section>

        <Section title="">
          <ActionButtons />
        </Section>
      </div>
    </HooksContext.Provider>
  );
}

// ============ 내부 컴포넌트 ============

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      {title && <h2 className="text-sm font-semibold mb-2 text-gray-400">{title}</h2>}
      {children}
    </section>
  );
}

const COLOR_PRESETS = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF", "#000000", "#808080", "#FFD700"];

// 파츠별 기본 색상 (눈/머리/수염만 갈색, 나머지는 미지정)
const DEFAULT_COLORS: Partial<Record<PartType, string>> = {
  eye: "#6B4226", // 눈: 갈색
  hair: "#6B4226", // 머리: 갈색
  facehair: "#6B4226", // 수염: 갈색
};

// 색상 미지정 표시용 체크무늬 스타일
const UNSET_COLOR_STYLE = {
  background: "repeating-conic-gradient(#808080 0% 25%, #404040 0% 50%) 50% / 8px 8px",
};

function PartSelector({ type }: { type: PartType }) {
  const { usePart } = useHooks();
  const { label, current, total, name, hasColor, isRequired, next, prev, clear, setColor } = usePart(type);
  const { setLeftEyeColor, setRightEyeColor } = useAppearanceStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  // 눈/머리/수염은 기본 갈색, 나머지는 미지정("")
  const [localColor, setLocalColor] = useState(DEFAULT_COLORS[type] || "");
  // 눈 색상 분리용
  const [leftEyeColor, setLeftEyeLocalColor] = useState(DEFAULT_COLORS.eye || "#6B4226");
  const [rightEyeColor, setRightEyeLocalColor] = useState(DEFAULT_COLORS.eye || "#6B4226");

  // 색상이 지정되었는지 여부
  const hasColorSet = localColor !== "";

  const isEmpty = current < 0;
  const isEye = type === "eye";

  // 인덱스 표시: 필수 파츠는 항상 숫자, 선택 파츠는 "없음" 가능
  const displayIndex = isEmpty ? "없음" : `${current + 1}`;

  return (
    <div className="bg-gray-700/30 rounded p-1.5 space-y-1">
      {/* 첫 줄: 라벨 + 네비게이션 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span className="w-10 text-gray-400 text-xs">{label}</span>
          {/* 눈: 왼쪽/오른쪽 분리 색상 버튼 */}
          {isEye && (
            <>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-5 h-5 rounded border border-gray-500 text-xs flex items-center justify-center"
                style={{ backgroundColor: leftEyeColor }}
                title="왼쪽 눈 색상"
              >
                <span className="text-[8px] text-white drop-shadow">L</span>
              </button>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-5 h-5 rounded border border-gray-500 text-xs flex items-center justify-center"
                style={{ backgroundColor: rightEyeColor }}
                title="오른쪽 눈 색상"
              >
                <span className="text-[8px] text-white drop-shadow">R</span>
              </button>
            </>
          )}
          {/* 일반 색상 버튼 */}
          {hasColor && !isEye && (
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-5 h-5 rounded border border-gray-500 text-xs"
              style={hasColorSet ? { backgroundColor: localColor } : UNSET_COLOR_STYLE}
              title={hasColorSet ? "색상 변경" : "색상 미지정 (클릭하여 설정)"}
            />
          )}
          {/* 없음 버튼 (필수 파츠가 아닌 경우에만 표시) */}
          {!isRequired && (
            <button
              onClick={clear}
              className={`px-1.5 py-0.5 text-xs rounded ${isEmpty ? "bg-red-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-red-600"}`}
              title="없음으로 설정"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="btn-icon text-xs">&lt;</button>
          <span className="w-14 text-center text-xs">
            {displayIndex}/{total}
          </span>
          <button onClick={next} className="btn-icon text-xs">&gt;</button>
        </div>
      </div>

      {/* 둘째 줄: 파일명 */}
      <div className="text-xs text-gray-500 truncate pl-1" title={name}>
        {isEmpty ? "(없음)" : (name || "-")}
      </div>

      {/* 눈 색상 피커 (좌우 분리) */}
      {showColorPicker && isEye && (
        <div className="space-y-2 pt-1">
          {/* 왼쪽 눈 */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-gray-400 w-8">왼쪽</span>
            <input
              type="color"
              value={leftEyeColor}
              onChange={(e) => {
                setLeftEyeLocalColor(e.target.value);
                setLeftEyeColor(e.target.value);
              }}
              className="w-6 h-6 rounded cursor-pointer"
            />
            {COLOR_PRESETS.slice(0, 5).map((c) => (
              <button
                key={`left-${c}`}
                onClick={() => {
                  setLeftEyeLocalColor(c);
                  setLeftEyeColor(c);
                }}
                className="w-4 h-4 rounded border border-gray-600"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {/* 오른쪽 눈 */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-gray-400 w-8">오른쪽</span>
            <input
              type="color"
              value={rightEyeColor}
              onChange={(e) => {
                setRightEyeLocalColor(e.target.value);
                setRightEyeColor(e.target.value);
              }}
              className="w-6 h-6 rounded cursor-pointer"
            />
            {COLOR_PRESETS.slice(0, 5).map((c) => (
              <button
                key={`right-${c}`}
                onClick={() => {
                  setRightEyeLocalColor(c);
                  setRightEyeColor(c);
                }}
                className="w-4 h-4 rounded border border-gray-600"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 일반 색상 피커 (토글) */}
      {showColorPicker && hasColor && !isEye && (
        <div className="flex items-center gap-1 pt-1 flex-wrap">
          {/* 미지정 버튼 */}
          <button
            onClick={() => {
              setLocalColor("");
              setColor("");
            }}
            className="w-6 h-6 rounded border border-gray-600 text-[8px] text-gray-400"
            style={UNSET_COLOR_STYLE}
            title="색상 미지정 (원본)"
          >
            ✕
          </button>
          <input
            type="color"
            value={localColor || "#FFFFFF"}
            onChange={(e) => {
              setLocalColor(e.target.value);
              setColor(e.target.value);
            }}
            className="w-6 h-6 rounded cursor-pointer"
          />
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setLocalColor(c);
                setColor(c);
              }}
              className="w-4 h-4 rounded border border-gray-600"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnimationSelector() {
  const { useAnimation } = useHooks();
  const { state, index, total, name, states, next, prev, changeState } = useAnimation();

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {states.map((s) => (
          <button
            key={s}
            onClick={() => changeState(s)}
            className={`btn-sm ${state === s ? "bg-blue-600" : ""}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 truncate max-w-[120px]">{name}</span>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="btn-icon">&lt;</button>
          <span className="w-12 text-center text-xs">{index + 1}/{total}</span>
          <button onClick={next} className="btn-icon">&gt;</button>
        </div>
      </div>
    </div>
  );
}

function ActionButtons() {
  const { useActions } = useHooks();
  const { randomize, clearAll, resetColors } = useActions();

  return (
    <div className="flex gap-2">
      <button onClick={randomize} className="btn-action flex-1 bg-purple-600">
        랜덤
      </button>
      <button onClick={clearAll} className="btn-action flex-1 bg-gray-600">
        초기화
      </button>
      <button onClick={resetColors} className="btn-action flex-1 bg-gray-600">
        색상 리셋
      </button>
    </div>
  );
}

// ============ 무기 컴포넌트 ============

function WeaponSelector({ type }: { type: WeaponPartType }) {
  const { usePart } = useHooks();
  const { label, current, total, next, prev, clear } = usePart(type);

  const isEmpty = current < 0;
  const displayIndex = isEmpty ? "없음" : `${current + 1}`;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-1">
        <span className="w-12 text-gray-400">{label}</span>
        {/* 없음 버튼 */}
        <button
          onClick={clear}
          className={`px-1.5 py-0.5 text-xs rounded ${isEmpty ? "bg-red-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-red-600"}`}
          title="없음으로 설정"
        >
          ✕
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={prev} className="btn-icon">&lt;</button>
        <span className="w-14 text-center text-xs">
          {displayIndex}/{total}
        </span>
        <button onClick={next} className="btn-icon">&gt;</button>
      </div>
    </div>
  );
}

function HandWeaponSelector({ hand }: { hand: HandType }) {
  const { useHandWeapon, weaponPartTypes } = useHooks();
  if (!useHandWeapon) return null;

  const { weaponType, index, total, name, setWeaponType, next, prev, clear } = useHandWeapon(hand);

  const handLabel = hand === "left" ? "🤚 왼손" : "✋ 오른손";
  const weaponLabels: Record<WeaponPartType, string> = {
    sword: "검",
    shield: "방패",
    axe: "도끼",
    bow: "활",
    wand: "지팡이",
  };

  const isEmpty = index < 0;

  return (
    <div className="bg-gray-700/50 rounded p-2 space-y-1">
      {/* 손 라벨 + 무기 타입 선택 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{handLabel}</span>
        <select
          value={weaponType ?? ""}
          onChange={(e) => setWeaponType(e.target.value ? (e.target.value as WeaponPartType) : null)}
          className="bg-gray-800 text-sm rounded px-2 py-1 border border-gray-600"
        >
          <option value="">없음</option>
          {weaponPartTypes.map((type) => (
            <option key={type} value={type}>
              {weaponLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* 무기 선택 시 인덱스 네비게이션 + 파일명 */}
      {weaponType && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            {/* 없음 버튼 */}
            <button
              onClick={clear}
              className={`px-1.5 py-0.5 text-xs rounded ${isEmpty ? "bg-red-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-red-600"}`}
              title="없음으로 설정"
            >
              ✕
            </button>
            <button onClick={prev} className="btn-icon">&lt;</button>
            <span className="w-14 text-center text-xs">
              {isEmpty ? "없음" : `${index + 1}`}/{total}
            </span>
            <button onClick={next} className="btn-icon">&gt;</button>
          </div>
          <span className="text-xs text-gray-400 truncate max-w-[120px]" title={name}>
            {isEmpty ? "(없음)" : (name || "-")}
          </span>
        </div>
      )}
    </div>
  );
}
