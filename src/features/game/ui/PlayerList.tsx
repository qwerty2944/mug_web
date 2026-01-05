"use client";

import { useState, useCallback } from "react";
import { useGameStore, type OnlineUser } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import { PlayerContextMenu } from "./PlayerContextMenu";

interface PlayerListProps {
  currentUserId: string;
  onDuelRequest?: (target: OnlineUser) => void;
  onWhisper?: (target: OnlineUser) => void;
  onViewProfile?: (target: OnlineUser) => void;
  canDuel?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  targetUser: OnlineUser | null;
  position: { x: number; y: number };
}

export function PlayerList({
  currentUserId,
  onDuelRequest,
  onWhisper,
  onViewProfile,
  canDuel = true,
}: PlayerListProps) {
  const { theme } = useThemeStore();
  const { onlineUsers } = useGameStore();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    targetUser: null,
    position: { x: 0, y: 0 },
  });

  // 유저 클릭 핸들러
  const handleUserClick = useCallback(
    (event: React.MouseEvent, user: OnlineUser) => {
      event.preventDefault();

      // 메뉴 위치 계산 (화면 밖으로 나가지 않도록)
      const menuWidth = 160;
      const menuHeight = 150;
      let x = event.clientX;
      let y = event.clientY;

      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 10;
      }
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 10;
      }

      setContextMenu({
        isOpen: true,
        targetUser: user,
        position: { x, y },
      });
    },
    []
  );

  // 메뉴 닫기
  const handleCloseMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      targetUser: null,
      position: { x: 0, y: 0 },
    });
  }, []);

  // 결투 신청 핸들러
  const handleDuelRequest = useCallback(
    (target: OnlineUser) => {
      onDuelRequest?.(target);
      handleCloseMenu();
    },
    [onDuelRequest, handleCloseMenu]
  );

  // 귓속말 핸들러
  const handleWhisper = useCallback(
    (target: OnlineUser) => {
      onWhisper?.(target);
      handleCloseMenu();
    },
    [onWhisper, handleCloseMenu]
  );

  // 프로필 보기 핸들러
  const handleViewProfile = useCallback(
    (target: OnlineUser) => {
      onViewProfile?.(target);
      handleCloseMenu();
    },
    [onViewProfile, handleCloseMenu]
  );

  return (
    <>
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
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors"
                  style={{
                    background: isMe ? `${theme.colors.primary}10` : "transparent",
                  }}
                  onClick={(e) => handleUserClick(e, user)}
                  onMouseEnter={(e) => {
                    if (!isMe) {
                      e.currentTarget.style.background = `${theme.colors.primary}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMe) {
                      e.currentTarget.style.background = "transparent";
                    }
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

      {/* 컨텍스트 메뉴 */}
      {contextMenu.isOpen && contextMenu.targetUser && (
        <PlayerContextMenu
          targetUser={contextMenu.targetUser}
          position={contextMenu.position}
          onClose={handleCloseMenu}
          onDuelRequest={handleDuelRequest}
          onWhisper={onWhisper ? handleWhisper : undefined}
          onViewProfile={onViewProfile ? handleViewProfile : undefined}
          canDuel={canDuel}
          isMe={contextMenu.targetUser.userId === currentUserId}
        />
      )}
    </>
  );
}
