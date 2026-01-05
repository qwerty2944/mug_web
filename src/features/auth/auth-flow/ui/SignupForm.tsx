"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Theme } from "@/shared/config";
import { PasswordInput } from "./PasswordInput";

// ============ 스키마 ============

const signupSchema = z
  .object({
    email: z.string().email("올바른 이메일을 입력하세요"),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string().min(6, "비밀번호 확인을 입력하세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ============ 컴포넌트 ============

interface SignupFormProps {
  theme: Theme;
  onSubmit: (data: SignupFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  message: string | null;
}

export function SignupForm({
  theme,
  onSubmit,
  loading,
  error,
  message,
}: SignupFormProps) {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const handleSubmit = async (data: SignupFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label className="block font-mono text-sm mb-1" style={{ color: theme.colors.textDim }}>
          [EMAIL]
        </label>
        <input
          type="email"
          placeholder="이메일"
          {...form.register("email")}
          className="w-full px-4 py-3 font-mono focus:outline-none"
          style={{
            background: theme.colors.bgDark,
            border: `2px solid ${form.formState.errors.email ? theme.colors.error : theme.colors.border}`,
            color: theme.colors.text,
          }}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm font-mono" style={{ color: theme.colors.error }}>
            &gt; {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block font-mono text-sm mb-1" style={{ color: theme.colors.textDim }}>
          [PASSWORD]
        </label>
        <PasswordInput
          placeholder="비밀번호 (6자 이상)"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
          theme={theme}
        />
      </div>

      <div>
        <label className="block font-mono text-sm mb-1" style={{ color: theme.colors.textDim }}>
          [CONFIRM]
        </label>
        <PasswordInput
          placeholder="비밀번호 확인"
          {...form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
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

      {message && (
        <div
          className="p-3 text-sm font-mono"
          style={{
            background: `${theme.colors.success}20`,
            border: `1px solid ${theme.colors.success}`,
            color: theme.colors.success,
          }}
        >
          &gt; SUCCESS: {message}
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
        {loading ? "[ 등록 중... ]" : "[ 등록하기 ]"}
      </button>
    </form>
  );
}
