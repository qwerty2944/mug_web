"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Theme } from "@/shared/config";
import { EmailInput } from "./EmailInput";
import { PasswordInput } from "./PasswordInput";

// ============ 스키마 ============

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============ 컴포넌트 ============

interface LoginFormProps {
  theme: Theme;
  savedEmails: string[];
  onRemoveEmail: (email: string) => void;
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  defaultEmail?: string;
}

export function LoginForm({
  theme,
  savedEmails,
  onRemoveEmail,
  onSubmit,
  loading,
  error,
  defaultEmail,
}: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail || "", password: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-mono text-sm mb-1" style={{ color: theme.colors.textDim }}>
          [EMAIL]
        </label>
        <EmailInput
          value={form.watch("email")}
          onChange={(value) => form.setValue("email", value)}
          savedEmails={savedEmails}
          onRemoveEmail={onRemoveEmail}
          error={form.formState.errors.email?.message}
          theme={theme}
        />
      </div>

      <div>
        <label className="block font-mono text-sm mb-1" style={{ color: theme.colors.textDim }}>
          [PASSWORD]
        </label>
        <PasswordInput
          placeholder="비밀번호"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
          theme={theme}
        />
      </div>

      {error && (
        <div
          className="p-3 text-sm font-mono"
          style={{
            background: `${theme.colors.error}20`,
            border: `1px solid ${theme.colors.error}`,
            color: theme.colors.error,
          }}
        >
          &gt; ERROR: {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: theme.colors.bgLight,
          border: `2px solid ${theme.colors.textMuted}`,
          color: theme.colors.text,
        }}
      >
        {loading ? "[ 접속 중... ]" : "[ 접속하기 ]"}
      </button>
    </form>
  );
}
