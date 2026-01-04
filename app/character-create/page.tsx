"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCharacterStore,
  STARTER_PRESETS,
  GENDERS,
  RACES,
  type Gender,
  type Race,
  type StarterPreset,
} from "@/features/character";
import { CharacterCreator } from "@/widgets/character-creator";
import { globalStyles } from "@/shared/ui";
import { supabase } from "@/shared/api";
import { useAuthStore } from "@/features/auth";

export default function CharacterCreatePage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { characterState, callUnity } = useCharacterStore();

  const [step, setStep] = useState<"info" | "customize">("info");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [race, setRace] = useState<Race>(RACES[0]);
  const [preset, setPreset] = useState<StarterPreset>(STARTER_PRESETS[0]);
  const [saving, setSaving] = useState(false);

  // 종족 선택 시 Unity에 body 변경
  const handleRaceChange = (r: Race) => {
    setRace(r);
    callUnity("JS_SetBody", r.bodyIndex.toString());
  };

  // 프리셋 선택 시 장비 적용
  const handlePresetChange = (p: StarterPreset) => {
    setPreset(p);
    // 장비 초기화 후 프리셋 적용
    callUnity("JS_ClearAll");
    callUnity("JS_SetBody", race.bodyIndex.toString());

    const { appearance } = p;
    if (appearance.clothIndex !== undefined) {
      callUnity("JS_SetCloth", appearance.clothIndex.toString());
    }
    if (appearance.armorIndex !== undefined) {
      callUnity("JS_SetArmor", appearance.armorIndex.toString());
    }
    if (appearance.pantIndex !== undefined) {
      callUnity("JS_SetPant", appearance.pantIndex.toString());
    }
    if (appearance.helmetIndex !== undefined) {
      callUnity("JS_SetHelmet", appearance.helmetIndex.toString());
    }
    if (appearance.backIndex !== undefined) {
      callUnity("JS_SetBack", appearance.backIndex.toString());
    }
  };

  // 캐릭터 저장
  const handleSave = async () => {
    if (!session?.user?.id || !name.trim()) return;

    setSaving(true);
    try {
      const character = {
        name: name.trim(),
        isMain: true,
        gender,
        race: race.id,
        preset: preset.id,
        appearance: {
          bodyIndex: characterState?.bodyIndex ?? 0,
          eyeIndex: characterState?.eyeIndex ?? 0,
          hairIndex: characterState?.hairIndex ?? -1,
          clothIndex: characterState?.clothIndex ?? -1,
          armorIndex: characterState?.armorIndex ?? -1,
          pantIndex: characterState?.pantIndex ?? -1,
          helmetIndex: characterState?.helmetIndex ?? -1,
          backIndex: characterState?.backIndex ?? -1,
        },
        colors: {
          body: characterState?.bodyColor ?? "FFFFFF",
          eye: characterState?.eyeColor ?? "FFFFFF",
          hair: characterState?.hairColor ?? "FFFFFF",
          cloth: characterState?.clothColor ?? "FFFFFF",
          armor: characterState?.armorColor ?? "FFFFFF",
          pant: characterState?.pantColor ?? "FFFFFF",
        },
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase.rpc("save_character", {
        p_user_id: session.user.id,
        p_character: character,
      });

      if (error) throw error;
      router.push("/game");
    } catch (err) {
      console.error("캐릭터 저장 실패:", err);
      alert("캐릭터 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="flex-none p-3 border-b border-gray-700 safe-area-top">
        <h1 className="text-lg font-bold text-center">캐릭터 생성</h1>
      </header>

      {step === "info" ? (
        // Step 1: 기본 정보
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 이름 */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              캐릭터 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={12}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </section>

          {/* 성별 */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              성별
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    gender === g.id
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-gray-700 bg-gray-800"
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="ml-2">{g.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 종족 */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              종족
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RACES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRaceChange(r)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    race.id === r.id
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-gray-700 bg-gray-800"
                  }`}
                >
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* 시작 장비 */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              시작 장비
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STARTER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p)}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    preset.id === p.id
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-gray-700 bg-gray-800"
                  }`}
                >
                  <div className="text-2xl">{p.icon}</div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {p.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 다음 버튼 */}
          <button
            onClick={() => setStep("customize")}
            disabled={!name.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            외형 커스터마이징
          </button>
        </div>
      ) : (
        // Step 2: 커스터마이징 (눈, 머리만)
        <div className="flex-1 flex flex-col min-h-0">
          <CharacterCreator className="flex-1" />

          {/* 하단 버튼 */}
          <div className="flex-none p-3 border-t border-gray-700 flex gap-2 safe-area-bottom">
            <button
              onClick={() => setStep("info")}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              이전
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {saving ? "저장 중..." : "캐릭터 생성"}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{globalStyles}</style>
    </div>
  );
}
