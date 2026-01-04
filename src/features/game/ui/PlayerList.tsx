"use client";

import { useGameStore } from "../model";

interface PlayerListProps {
  currentUserId: string;
}

export function PlayerList({ currentUserId }: PlayerListProps) {
  const { onlineUsers } = useGameStore();

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">👥 접속 유저</span>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
          {onlineUsers.length}명
        </span>
      </div>

      {/* 유저 목록 */}
      <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-2">
            접속자 없음
          </div>
        ) : (
          onlineUsers.map((user) => {
            const isMe = user.userId === currentUserId;
            return (
              <div
                key={user.userId}
                className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                  isMe ? "bg-blue-500/10" : "hover:bg-gray-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span
                  className={`text-sm ${
                    isMe ? "text-blue-400 font-medium" : "text-gray-300"
                  }`}
                >
                  {user.characterName}
                  {isMe && (
                    <span className="text-xs text-gray-500 ml-1">(나)</span>
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
