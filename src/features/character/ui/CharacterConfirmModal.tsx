"use client";

import { Modal } from "@/shared/ui";
import {
  useProfileStore,
  useAppearanceStore,
  STAT_NAMES,
  type CharacterStats,
} from "../model";

interface CharacterConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function CharacterConfirmModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: CharacterConfirmModalProps) {
  const { name, gender, race, bodyType, preset, getFinalStats } =
    useProfileStore();
  const { characterState } = useAppearanceStore();

  const finalStats = getFinalStats();

  const rows = [
    { label: "이름", value: name },
    { label: "성별", value: gender === "male" ? "남성" : "여성" },
    { label: "종족", value: race.name },
    { label: "체형", value: bodyType.name },
    { label: "직업", value: preset.name },
  ];

  const appearanceRows = [
    {
      label: "눈",
      value: characterState?.eyeIndex !== undefined
        ? `#${characterState.eyeIndex + 1}`
        : "-",
    },
    {
      label: "머리",
      value: characterState?.hairIndex !== undefined && characterState.hairIndex >= 0
        ? `#${characterState.hairIndex + 1}`
        : "민머리",
    },
    {
      label: "수염",
      value: characterState?.facehairIndex !== undefined && characterState.facehairIndex >= 0
        ? `#${characterState.facehairIndex + 1}`
        : "없음",
    },
  ];

  return (
    <Modal.Root open={open} onClose={onClose}>
      <Modal.Overlay>
        <Modal.Content size="lg">
          <Modal.Header>캐릭터 생성 확인</Modal.Header>

          <Modal.Body className="space-y-4">
            {/* 기본 정보 */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                기본 정보
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-gray-700">
                      <td className="py-2 text-gray-400 w-24">{row.label}</td>
                      <td className="py-2 text-white">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 외형 */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-2">외형</h3>
              <table className="w-full text-sm">
                <tbody>
                  {appearanceRows.map((row) => (
                    <tr key={row.label} className="border-b border-gray-700">
                      <td className="py-2 text-gray-400 w-24">{row.label}</td>
                      <td className="py-2 text-white">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 능력치 */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                능력치
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(STAT_NAMES) as (keyof CharacterStats)[]).map(
                  (stat) => (
                    <div
                      key={stat}
                      className="flex items-center justify-between bg-gray-700/50 rounded px-3 py-2"
                    >
                      <span className="text-gray-400 text-xs">
                        {STAT_NAMES[stat].ko}
                      </span>
                      <span className="text-white font-medium">
                        {finalStats[stat]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* 시작 장비 설명 */}
            <section className="bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{preset.icon}</span>
                <span className="font-medium text-white">{preset.name}</span>
              </div>
              <p className="text-xs text-gray-400">{preset.description}</p>
            </section>
          </Modal.Body>

          <Modal.Footer>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm font-medium transition-colors"
            >
              {loading ? "생성 중..." : "캐릭터 생성"}
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  );
}
