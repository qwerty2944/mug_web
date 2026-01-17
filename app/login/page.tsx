"use client";

import { useThemeStore } from "@/application/stores";
import { LoginForm, SignupForm, useAuth } from "@/features/auth";

export default function LoginPage() {
  const { theme } = useThemeStore();

  const {
    mode,
    loading,
    error,
    message,
    savedEmails,
    handleLogin,
    handleSignup,
    switchMode,
    removeEmail,
  } = useAuth();

  return (
    <div className="h-dvh w-full flex items-center justify-center p-4 bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `${theme.colors.primaryMuted}20` }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `${theme.colors.primaryDim}20` }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* 터미널 스타일 프레임 */}
        <div
          className="shadow-2xl"
          style={{
            background: theme.colors.bg,
            border: `2px solid ${theme.colors.border}`,
            boxShadow: `0 25px 50px -12px ${theme.colors.primaryMuted}40`,
          }}
        >
          {/* 헤더 바 */}
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{
              background: theme.colors.bgLight,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-sm" style={{ color: theme.colors.textDim }}>
              mud.connect
            </span>
            <div className="w-12" /> {/* Spacer for balance */}
          </div>

          <div className="p-6">
            {/* ASCII 아트 타이틀 */}
            <div className="text-center mb-6">
              <pre
                className="font-mono text-xs leading-tight inline-block"
                style={{ color: theme.colors.primary }}
              >
{`
 ███╗   ███╗██╗   ██╗██████╗
 ████╗ ████║██║   ██║██╔══██╗
 ██╔████╔██║██║   ██║██║  ██║
 ██║╚██╔╝██║██║   ██║██║  ██║
 ██║ ╚═╝ ██║╚██████╔╝██████╔╝
 ╚═╝     ╚═╝ ╚═════╝ ╚═════╝
`}
              </pre>
              <p className="font-mono text-sm mt-2" style={{ color: theme.colors.textMuted }}>
                ~ Fantasy Multi-User Dungeon ~
              </p>
            </div>

            {/* 시스템 메시지 */}
            <div className="mb-6 font-mono text-sm" style={{ color: theme.colors.textDim }}>
              <p>&gt; {mode === "login" ? "모험가여, 접속하시오..." : "새로운 모험가를 등록합니다..."}</p>
              <p className="animate-pulse">_</p>
            </div>

            {/* 폼 */}
            {mode === "login" ? (
              <LoginForm
                theme={theme}
                savedEmails={savedEmails}
                onRemoveEmail={removeEmail}
                onSubmit={handleLogin}
                loading={loading}
                error={error}
                defaultEmail={savedEmails[0]}
              />
            ) : (
              <SignupForm
                theme={theme}
                onSubmit={handleSignup}
                loading={loading}
                error={error}
                message={message}
              />
            )}

            {/* 모드 전환 */}
            <div className="mt-6 text-center">
              <button
                onClick={switchMode}
                className="font-mono text-sm transition-colors"
                style={{ color: theme.colors.textMuted }}
              >
                {mode === "login"
                  ? "> 새로운 모험가 등록"
                  : "> 기존 모험가로 접속"}
              </button>
            </div>

            {/* 푸터 */}
            <div
              className="mt-6 pt-4 text-center border-t"
              style={{ borderColor: theme.colors.borderDim }}
            >
              <p className="font-mono text-xs" style={{ color: theme.colors.textMuted }}>
                MUD v1.0.0 | Est. 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
