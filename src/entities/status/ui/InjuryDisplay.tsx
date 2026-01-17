"use client";

import { useThemeStore } from "@/shared/config";
import { INJURY_CONFIG, type CharacterInjury } from "../types";

interface InjuryDisplayProps {
  injuries: CharacterInjury[];
  compact?: boolean;
}

/**
 * 부상 상태 표시 컴포넌트
 * - compact: 아이콘만 표시 (헤더용)
 * - full: 상세 정보 표시 (상태창용)
 */
export function InjuryDisplay({ injuries, compact = false }: InjuryDisplayProps) {
  const { theme } = useThemeStore();

  if (injuries.length === 0) return null;

  // 컴팩트 모드: 아이콘만 표시
  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        {injuries.map((injury, index) => {
          const config = INJURY_CONFIG[injury.type];
          return (
            <span
              key={index}
              title={`${config.nameKo} (HP 회복 상한 -${config.hpRecoveryReduction * 100}%)`}
              className="text-sm"
            >
              {config.icon}
            </span>
          );
        })}
      </div>
    );
  }

  // 전체 모드: 상세 정보 표시
  return (
    <div className="space-y-1.5">
      {injuries.map((injury, index) => {
        const config = INJURY_CONFIG[injury.type];
        const remainingTime = getRemainingHealTime(injury);

        return (
          <div
            key={index}
            className="flex items-center gap-2 px-2 py-1.5 text-sm font-mono"
            style={{
              background: `${config.color}15`,
              border: `1px solid ${config.color}40`,
            }}
          >
            <span className="text-base">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span style={{ color: config.color }} className="font-medium">
                  {config.nameKo}
                </span>
                <span style={{ color: theme.colors.textMuted }} className="text-xs">
                  HP -{config.hpRecoveryReduction * 100}%
                </span>
              </div>
              {remainingTime && (
                <p
                  className="text-xs truncate"
                  style={{ color: theme.colors.textMuted }}
                >
                  자연 치유: {remainingTime}
                </p>
              )}
              {!injury.naturalHealAt && (
                <p
                  className="text-xs"
                  style={{ color: theme.colors.error }}
                >
                  치료 필요
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 남은 자연 치유 시간 계산
 */
function getRemainingHealTime(injury: CharacterInjury): string | null {
  if (!injury.naturalHealAt) return null;

  const remaining = new Date(injury.naturalHealAt).getTime() - Date.now();
  if (remaining <= 0) return "곧 치유됨";

  const minutes = Math.ceil(remaining / 60000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  }
  return `${minutes}분`;
}
