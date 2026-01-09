"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CharacterPanelHooks, PartType, WeaponPartType, HandType } from "../types";

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

function PartSelector({ type }: { type: PartType }) {
  const { usePart } = useHooks();
  const { label, current, total, name, hasColor, next, prev, setColor } = usePart(type);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [localColor, setLocalColor] = useState("#FFFFFF");

  return (
    <div className="bg-gray-700/30 rounded p-1.5 space-y-1">
      {/* 첫 줄: 라벨 + 네비게이션 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span className="w-10 text-gray-400 text-xs">{label}</span>
          {hasColor && (
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-5 h-5 rounded border border-gray-500 text-xs"
              style={{ backgroundColor: localColor }}
              title="색상 변경"
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="btn-icon text-xs">&lt;</button>
          <span className="w-12 text-center text-xs">
            {current >= 0 ? current + 1 : "-"}/{total}
          </span>
          <button onClick={next} className="btn-icon text-xs">&gt;</button>
        </div>
      </div>

      {/* 둘째 줄: 파일명 */}
      <div className="text-xs text-gray-500 truncate pl-1" title={name}>
        {current >= 0 ? (name || "-") : "(없음)"}
      </div>

      {/* 색상 피커 (토글) */}
      {showColorPicker && hasColor && (
        <div className="flex items-center gap-1 pt-1 flex-wrap">
          <input
            type="color"
            value={localColor}
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
  const { label, current, total, next, prev } = usePart(type);

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="w-14 text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={prev} className="btn-icon">&lt;</button>
        <span className="w-14 text-center text-xs">
          {current >= 0 ? current + 1 : "-"}/{total}
        </span>
        <button onClick={next} className="btn-icon">&gt;</button>
      </div>
    </div>
  );
}

function HandWeaponSelector({ hand }: { hand: HandType }) {
  const { useHandWeapon, weaponPartTypes } = useHooks();
  if (!useHandWeapon) return null;

  const { weaponType, index, total, name, setWeaponType, next, prev } = useHandWeapon(hand);

  const handLabel = hand === "left" ? "🤚 왼손" : "✋ 오른손";
  const weaponLabels: Record<WeaponPartType, string> = {
    sword: "검",
    shield: "방패",
    axe: "도끼",
    bow: "활",
    wand: "지팡이",
  };

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
            <button onClick={prev} className="btn-icon">&lt;</button>
            <span className="w-12 text-center text-xs">
              {index >= 0 ? `${index + 1}/${total}` : `-/${total}`}
            </span>
            <button onClick={next} className="btn-icon">&gt;</button>
          </div>
          <span className="text-xs text-gray-400 truncate max-w-[120px]" title={name}>
            {index >= 0 ? (name || "-") : "(없음)"}
          </span>
        </div>
      )}
    </div>
  );
}
