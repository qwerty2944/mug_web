"use client";

import { useRef, useEffect } from "react";
import { useThemeStore, type Theme } from "@/shared/config";
import { usePvpStore, type DuelState, type DuelLogEntry } from "@/application/stores";
import type { ProficiencyType } from "@/entities/proficiency";

interface DuelBattlePanelProps {
  userId: string;
  duel: DuelState;
  onAttack: (attackType: ProficiencyType) => void;
  onFlee: () => void;
  onClose: () => void;
}

export function DuelBattlePanel({
  userId,
  duel,
  onAttack,
  onFlee,
  onClose,
}: DuelBattlePanelProps) {
  const { theme } = useThemeStore();
  const logRef = useRef<HTMLDivElement>(null);

  const { getMyParticipant, getOpponentParticipant, isMyTurn, getMyHpPercent, getOpponentHpPercent } =
    usePvpStore();

  const myParticipant = getMyParticipant(userId);
  const opponentParticipant = getOpponentParticipant(userId);
  const myTurn = isMyTurn(userId);
  const myHpPercent = getMyHpPercent(userId);
  const opponentHpPercent = getOpponentHpPercent(userId);

  const isEnded = duel.result !== "ongoing";
  const isWinner =
    (duel.result === "player1_win" && duel.player1.id === userId) ||
    (duel.result === "player2_win" && duel.player2.id === userId);

  // 로그 자동 스크롤
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [duel.battleLog]);

  // HP 바 색상
  const getHpBarColor = (percent: number) => {
    if (percent > 50) return theme.colors.success;
    if (percent > 25) return theme.colors.warning;
    return theme.colors.error;
  };

  // 공격 타입 버튼들
  const attackTypes: { type: ProficiencyType; label: string; icon: string }[] = [
    { type: "light_sword", label: "세검", icon: "🗡️" },
    { type: "medium_sword", label: "중검", icon: "⚔️" },
    { type: "great_sword", label: "대검", icon: "🗡️" },
    { type: "dagger", label: "단검", icon: "🔪" },
    { type: "axe", label: "도끼", icon: "🪓" },
    { type: "fire", label: "화염", icon: "🔥" },
  ];

  if (!myParticipant || !opponentParticipant) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="w-full max-w-lg mx-4 shadow-2xl"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.primary}`,
        }}
      >
        {/* 헤더 */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: `${theme.colors.primary}20`,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <h2 className="font-mono font-bold" style={{ color: theme.colors.text }}>
            ⚔️ 결투
          </h2>
          <span className="text-sm font-mono" style={{ color: theme.colors.textMuted }}>
            턴 {duel.turn}
          </span>
        </div>

        {/* 상대방 HP */}
        <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-sm" style={{ color: theme.colors.error }}>
              {opponentParticipant.name}
            </span>
            <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
              {opponentParticipant.currentHp}/{opponentParticipant.maxHp}
            </span>
          </div>
          <div className="h-4 rounded overflow-hidden" style={{ background: theme.colors.bgDark }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${opponentHpPercent}%`,
                background: getHpBarColor(opponentHpPercent),
              }}
            />
          </div>
        </div>

        {/* 전투 로그 */}
        <div
          ref={logRef}
          className="h-40 overflow-y-auto p-3 space-y-1"
          style={{ background: theme.colors.bgDark }}
        >
          {duel.battleLog.map((log, index) => (
            <LogEntry key={index} log={log} userId={userId} theme={theme} />
          ))}
        </div>

        {/* 내 HP */}
        <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-sm" style={{ color: theme.colors.primary }}>
              {myParticipant.name} (나)
            </span>
            <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
              {myParticipant.currentHp}/{myParticipant.maxHp}
            </span>
          </div>
          <div className="h-4 rounded overflow-hidden" style={{ background: theme.colors.bgDark }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${myHpPercent}%`,
                background: getHpBarColor(myHpPercent),
              }}
            />
          </div>
        </div>

        {/* 턴 표시 / 결과 표시 */}
        {isEnded ? (
          <div
            className="px-4 py-3 text-center"
            style={{
              background: isWinner ? `${theme.colors.success}20` : `${theme.colors.error}20`,
            }}
          >
            <span
              className="font-mono font-bold text-lg"
              style={{ color: isWinner ? theme.colors.success : theme.colors.error }}
            >
              {isWinner ? "🎉 승리!" : "💀 패배..."}
            </span>
          </div>
        ) : (
          <div
            className="px-4 py-2 text-center"
            style={{
              background: myTurn ? `${theme.colors.primary}20` : theme.colors.bgLight,
            }}
          >
            <span
              className="font-mono text-sm"
              style={{ color: myTurn ? theme.colors.primary : theme.colors.textMuted }}
            >
              {myTurn ? "⚡ 당신의 턴!" : "⏳ 상대방 턴..."}
            </span>
          </div>
        )}

        {/* 행동 버튼 */}
        <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
          {isEnded ? (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 font-mono font-medium transition-opacity hover:opacity-80"
              style={{
                background: theme.colors.primary,
                color: theme.colors.bg,
              }}
            >
              닫기
            </button>
          ) : (
            <>
              {/* 공격 버튼들 */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {attackTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => onAttack(type)}
                    disabled={!myTurn}
                    className="px-2 py-2 font-mono text-sm transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: myTurn ? theme.colors.primary : theme.colors.bgDark,
                      color: myTurn ? theme.colors.bg : theme.colors.textMuted,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* 도주 버튼 */}
              <button
                onClick={onFlee}
                disabled={!myTurn}
                className="w-full px-4 py-2 font-mono text-sm transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: theme.colors.bgDark,
                  color: theme.colors.textMuted,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                🏃 도주
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 로그 엔트리 컴포넌트
interface LogEntryProps {
  log: DuelLogEntry;
  userId: string;
  theme: Theme;
}

function LogEntry({ log, userId, theme }: LogEntryProps) {
  const isMyAction = log.actorId === userId;
  const isSystem = log.actorId === "system";

  let color = theme.colors.textMuted;
  if (isSystem) {
    color = theme.colors.primary;
  } else if (isMyAction) {
    color = theme.colors.success;
  } else {
    color = theme.colors.error;
  }

  return (
    <div className="font-mono text-xs" style={{ color }}>
      {log.message}
    </div>
  );
}
