"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CharacterPanelHooks, PartType } from "../types";

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

        <Section title="색상">
          <ColorPicker />
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

function PartSelector({ type }: { type: PartType }) {
  const { usePart } = useHooks();
  const { label, current, total, next, prev } = usePart(type);

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="w-12 text-gray-400">{label}</span>
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

function ColorPicker() {
  const { useColor } = useHooks();
  const { color, setColor, applyTo } = useColor();

  const presets = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF", "#000000"];
  const targets = [
    { key: "hair", label: "머리" },
    { key: "facehair", label: "수염" },
    { key: "cloth", label: "옷" },
    { key: "body", label: "피부" },
    { key: "armor", label: "갑옷" },
  ] as const;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <div className="flex gap-1 flex-wrap">
          {presets.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded border border-gray-600"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {targets.map(({ key, label }) => (
          <button key={key} onClick={() => applyTo(key)} className="btn-sm flex-1">
            {label}
          </button>
        ))}
      </div>
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
