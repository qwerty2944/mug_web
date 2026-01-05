"use client";

import { Modal } from "@/shared/ui";
import { useThemeStore } from "@/shared/config";
import { useProfileStore, useAppearanceStore } from "@/application/stores";
import { STAT_NAMES, type CharacterStats } from "../types";

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
  const { theme } = useThemeStore();
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
              <h3 className="text-sm font-mono font-medium mb-2" style={{ color: theme.colors.textMuted }}>
                기본 정보
              </h3>
              <table className="w-full text-sm font-mono">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b" style={{ borderColor: theme.colors.borderDim }}>
                      <td className="py-2 w-24" style={{ color: theme.colors.textMuted }}>{row.label}</td>
                      <td className="py-2" style={{ color: theme.colors.text }}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 외형 */}
            <section>
              <h3 className="text-sm font-mono font-medium mb-2" style={{ color: theme.colors.textMuted }}>외형</h3>
              <table className="w-full text-sm font-mono">
                <tbody>
                  {appearanceRows.map((row) => (
                    <tr key={row.label} className="border-b" style={{ borderColor: theme.colors.borderDim }}>
                      <td className="py-2 w-24" style={{ color: theme.colors.textMuted }}>{row.label}</td>
                      <td className="py-2" style={{ color: theme.colors.text }}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 능력치 */}
            <section>
              <h3 className="text-sm font-mono font-medium mb-2" style={{ color: theme.colors.textMuted }}>
                능력치
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(STAT_NAMES) as (keyof CharacterStats)[]).map(
                  (stat) => (
                    <div
                      key={stat}
                      className="flex items-center justify-between px-3 py-2"
                      style={{ background: theme.colors.bgDark }}
                    >
                      <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                        {STAT_NAMES[stat].ko}
                      </span>
                      <span className="font-mono font-medium" style={{ color: theme.colors.text }}>
                        {finalStats[stat]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* 시작 장비 설명 */}
            <section className="p-3" style={{ background: theme.colors.bgDark }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{preset.icon}</span>
                <span className="font-mono font-medium" style={{ color: theme.colors.text }}>{preset.name}</span>
              </div>
              <p className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>{preset.description}</p>
            </section>
          </Modal.Body>

          <Modal.Footer>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 disabled:opacity-50 text-sm font-mono transition-colors"
              style={{
                background: theme.colors.bgDark,
                color: theme.colors.textMuted,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 disabled:opacity-50 text-sm font-mono font-medium transition-colors"
              style={{
                background: theme.colors.success,
                color: theme.colors.bg,
              }}
            >
              {loading ? "생성 중..." : "캐릭터 생성"}
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  );
}
