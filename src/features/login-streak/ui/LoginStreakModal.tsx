"use client";

import { useThemeStore } from "@/application/stores";
import { Modal } from "@/shared/ui";
import type { DailyLoginResult } from "@/entities/user";

interface LoginStreakModalProps {
  open: boolean;
  onClose: () => void;
  result: DailyLoginResult;
}

/**
 * 연속 로그인 스탬프 모달
 * - 새 날 로그인 시 표시
 * - 7일 스탬프 그리드 표시
 */
export function LoginStreakModal({ open, onClose, result }: LoginStreakModalProps) {
  const { theme } = useThemeStore();

  // 7일 스탬프 생성 (현재 주차 기준)
  const stamps = generateWeekStamps(result.loginStreak);

  return (
    <Modal.Root open={open} onClose={onClose}>
      <Modal.Overlay>
        <Modal.Content size="sm">
          <Modal.Header>
            {result.streakBroken ? "출석 체크" : "연속 출석!"}
          </Modal.Header>
          <Modal.Body>
            {/* 연속 출석일 카운터 */}
            <div className="text-center mb-4">
              <div
                className="text-5xl font-bold font-mono"
                style={{ color: theme.colors.primary }}
              >
                {result.loginStreak}
              </div>
              <div
                className="text-sm font-mono mt-1"
                style={{ color: theme.colors.textMuted }}
              >
                일 연속 출석
              </div>
            </div>

            {/* 연속 끊김 경고 */}
            {result.streakBroken && result.previousStreak > 1 && (
              <div
                className="text-center text-sm mb-4 p-2 rounded font-mono"
                style={{
                  color: theme.colors.warning,
                  background: `${theme.colors.warning}15`,
                  border: `1px solid ${theme.colors.warning}30`,
                }}
              >
                이전 {result.previousStreak}일 연속 기록이 끊어졌습니다
              </div>
            )}

            {/* 7일 스탬프 그리드 */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {stamps.map((stamp, idx) => (
                <StampDay
                  key={idx}
                  day={idx + 1}
                  isCompleted={stamp.completed}
                  isToday={stamp.isToday}
                />
              ))}
            </div>

            {/* 총 출석일 */}
            <div
              className="text-center text-xs font-mono"
              style={{ color: theme.colors.textMuted }}
            >
              총 {result.totalLoginDays}일 출석
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={onClose}
              className="px-6 py-2 font-mono text-sm rounded transition-opacity hover:opacity-80"
              style={{
                background: theme.colors.primary,
                color: theme.colors.bg,
              }}
            >
              확인
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  );
}

// 스탬프 날짜 컴포넌트
function StampDay({
  day,
  isCompleted,
  isToday,
}: {
  day: number;
  isCompleted: boolean;
  isToday: boolean;
}) {
  const { theme } = useThemeStore();

  return (
    <div
      className="aspect-square flex flex-col items-center justify-center text-xs font-mono rounded"
      style={{
        background: isCompleted ? theme.colors.primary : theme.colors.bgDark,
        color: isCompleted ? theme.colors.bg : theme.colors.textMuted,
        border: isToday
          ? `2px solid ${theme.colors.warning}`
          : `1px solid ${theme.colors.border}`,
      }}
    >
      <span className="text-lg">{isCompleted ? "O" : day}</span>
      <span className="text-[10px]">Day {day}</span>
    </div>
  );
}

// 7일 스탬프 배열 생성 (현재 streak 기준)
function generateWeekStamps(streak: number) {
  const stamps = [];
  // 현재 주의 몇 번째 날인지 (1~7 순환)
  const currentDayInWeek = ((streak - 1) % 7) + 1;

  for (let i = 1; i <= 7; i++) {
    stamps.push({
      completed: i <= currentDayInWeek,
      isToday: i === currentDayInWeek,
    });
  }

  return stamps;
}
