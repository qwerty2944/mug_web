import type { GameTime, Period } from "../types";

interface TimeSettings {
  gameEpoch: string; // ISO string
  cycleHours: number; // 2 or 4
}

/**
 * 클라이언트에서 현재 게임 시간을 계산합니다.
 *
 * 2시간 사이클에서 30분씩 균등 4등분:
 * - 00:00-00:30 = night 🌙
 * - 00:30-01:00 = dawn 🌅
 * - 01:00-01:30 = day ☀️
 * - 01:30-02:00 = dusk 🌆
 */
export function calculateGameTime(settings: TimeSettings): GameTime {
  const now = Date.now();
  const epoch = new Date(settings.gameEpoch).getTime();
  const cycleMs = settings.cycleHours * 60 * 60 * 1000;

  const elapsed = now - epoch;
  const cyclePosition = ((elapsed % cycleMs) + cycleMs) % cycleMs;
  const cycleProgress = (cyclePosition / cycleMs) * 100;

  // 사이클 내 위치를 0-24 게임 시간으로 변환
  const gameTimeRaw = (cyclePosition / cycleMs) * 24;
  const gameHour = Math.floor(gameTimeRaw);
  const gameMinute = Math.floor((gameTimeRaw % 1) * 60);

  // 시간대 판정 (30분씩 4등분)
  // 0-25% = night, 25-50% = dawn, 50-75% = day, 75-100% = dusk
  const period = getPeriodFromProgress(cycleProgress);

  // 진행률 계산
  const quarterMs = cycleMs / 4; // 30분
  const quarterPosition = cyclePosition % quarterMs;
  const periodProgress = Math.floor((quarterPosition / quarterMs) * 100);
  const nextPeriodIn = quarterMs - quarterPosition;

  return {
    gameHour,
    gameMinute,
    period,
    periodProgress,
    nextPeriodIn,
    cycleHours: settings.cycleHours,
  };
}

/**
 * 사이클 진행률(0-100%)로부터 시간대를 판정합니다.
 * 30분씩 4등분: night → dawn → day → dusk
 */
export function getPeriodFromProgress(progress: number): Period {
  const quarter = progress / 25;
  if (quarter < 1) return "night";
  if (quarter < 2) return "dawn";
  if (quarter < 3) return "day";
  return "dusk";
}

/**
 * 게임 시간(0-23)으로부터 시간대를 판정합니다.
 * @deprecated getPeriodFromProgress 사용 권장
 */
export function getPeriodFromHour(hour: number): Period {
  // 24시간을 4등분: 0-6, 6-12, 12-18, 18-24
  if (hour < 6) return "night";
  if (hour < 12) return "dawn";
  if (hour < 18) return "day";
  return "dusk";
}

/**
 * 게임 시간을 "HH:MM" 형식 문자열로 변환합니다.
 */
export function formatGameTime(gameTime: GameTime): string {
  const hours = gameTime.gameHour.toString().padStart(2, "0");
  const minutes = gameTime.gameMinute.toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * 남은 시간(ms)을 "MM분 SS초" 형식으로 변환합니다.
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  }
  return `${seconds}초`;
}
