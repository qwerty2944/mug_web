"use client";

import { useGameStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";

interface PlayerListProps {
  currentUserId: string;
}

export function PlayerList({ currentUserId }: PlayerListProps) {
  const { theme } = useThemeStore();
  const { onlineUsers } = useGameStore();

  return (
    <div
      className="overflow-hidden"
      style={{
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-2 flex items-center justify-between border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <span className="text-sm font-mono font-medium" style={{ color: theme.colors.text }}>
          👥 접속 유저
        </span>
        <span
          className="text-xs px-2 py-0.5 font-mono"
          style={{
            background: `${theme.colors.primary}20`,
            color: theme.colors.primary,
          }}
        >
          {onlineUsers.length}명
        </span>
      </div>

      {/* 유저 목록 */}
      <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <div className="text-center text-xs py-2 font-mono" style={{ color: theme.colors.textMuted }}>
            접속자 없음
          </div>
        ) : (
          onlineUsers.map((user) => {
            const isMe = user.userId === currentUserId;
            return (
              <div
                key={user.userId}
                className="flex items-center gap-2 px-2 py-1.5"
                style={{
                  background: isMe ? `${theme.colors.primary}10` : "transparent",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: theme.colors.success }}
                />
                <span
                  className="text-sm font-mono"
                  style={{
                    color: isMe ? theme.colors.primary : theme.colors.text,
                    fontWeight: isMe ? 500 : 400,
                  }}
                >
                  {user.characterName}
                  {isMe && (
                    <span className="text-xs ml-1" style={{ color: theme.colors.textMuted }}>
                      (나)
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
