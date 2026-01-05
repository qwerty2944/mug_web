"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "@/shared/config";
import type { OnlineUser } from "@/application/stores";

interface PlayerContextMenuProps {
  targetUser: OnlineUser;
  position: { x: number; y: number };
  onClose: () => void;
  onDuelRequest: (target: OnlineUser) => void;
  onWhisper?: (target: OnlineUser) => void;
  onViewProfile?: (target: OnlineUser) => void;
  canDuel?: boolean;
  isMe?: boolean;
}

export function PlayerContextMenu({
  targetUser,
  position,
  onClose,
  onDuelRequest,
  onWhisper,
  onViewProfile,
  canDuel = true,
  isMe = false,
}: PlayerContextMenuProps) {
  const { theme } = useThemeStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 메뉴 아이템 스타일
  const menuItemStyle = {
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontFamily: "monospace",
    transition: "background 0.15s",
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] shadow-lg"
      style={{
        left: position.x,
        top: position.y,
        background: theme.colors.bgLight,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-2 border-b"
        style={{
          borderColor: theme.colors.border,
          color: theme.colors.text,
          fontWeight: 500,
          fontSize: "13px",
          fontFamily: "monospace",
        }}
      >
        {targetUser.characterName}
      </div>

      {/* 메뉴 아이템들 */}
      <div style={{ color: theme.colors.text }}>
        {/* 결투 신청 - 자기 자신이 아니고, canDuel이 true일 때만 표시 */}
        {!isMe && canDuel && (
          <div
            style={menuItemStyle}
            onClick={() => {
              onDuelRequest(targetUser);
              onClose();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${theme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>⚔️</span>
            <span>결투 신청</span>
          </div>
        )}

        {/* 귓속말 - 자기 자신이 아닐 때만 표시 */}
        {!isMe && onWhisper && (
          <div
            style={menuItemStyle}
            onClick={() => {
              onWhisper(targetUser);
              onClose();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${theme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>💬</span>
            <span>귓속말</span>
          </div>
        )}

        {/* 프로필 보기 */}
        {onViewProfile && (
          <div
            style={menuItemStyle}
            onClick={() => {
              onViewProfile(targetUser);
              onClose();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${theme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>👤</span>
            <span>프로필 보기</span>
          </div>
        )}

        {/* 자기 자신이고 canDuel이 false면 안내 메시지 */}
        {!isMe && !canDuel && (
          <div
            style={{
              ...menuItemStyle,
              cursor: "default",
              color: theme.colors.textMuted,
            }}
          >
            <span>🛡️</span>
            <span>안전지대입니다</span>
          </div>
        )}
      </div>
    </div>
  );
}
