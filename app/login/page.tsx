"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/shared/api";

// 로그인 스키마
const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

// 회원가입 스키마
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

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type AuthMode = "login" | "signup";

// 눈 아이콘 컴포넌트
function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

// 비밀번호 입력 컴포넌트
function PasswordInput({
  placeholder,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
            error ? "border-red-500" : "border-gray-700"
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <EyeIcon visible={showPassword} />
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 로그인 폼
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 회원가입 폼
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setApiError(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;

      // 캐릭터 유무 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("characters")
        .eq("id", authData.user.id)
        .single();

      const hasCharacter = profile?.characters && profile.characters.length > 0;
      router.push(hasCharacter ? "/game" : "/character-create");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    setApiError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage("이메일을 확인해주세요!");
      signupForm.reset();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setApiError(null);
    setMessage(null);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="h-dvh w-full bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고/타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">MUG</h1>
          <p className="text-gray-400">Fantasy Game</p>
        </div>

        {mode === "login" ? (
          /* 로그인 폼 */
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="이메일"
                {...loginForm.register("email")}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                  loginForm.formState.errors.email ? "border-red-500" : "border-gray-700"
                }`}
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <PasswordInput
              placeholder="비밀번호"
              {...loginForm.register("password")}
              error={loginForm.formState.errors.password?.message}
            />

            {apiError && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {loading ? "처리 중..." : "로그인"}
            </button>
          </form>
        ) : (
          /* 회원가입 폼 */
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="이메일"
                {...signupForm.register("email")}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                  signupForm.formState.errors.email ? "border-red-500" : "border-gray-700"
                }`}
              />
              {signupForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <PasswordInput
              placeholder="비밀번호 (6자 이상)"
              {...signupForm.register("password")}
              error={signupForm.formState.errors.password?.message}
            />

            <PasswordInput
              placeholder="비밀번호 확인"
              {...signupForm.register("confirmPassword")}
              error={signupForm.formState.errors.confirmPassword?.message}
            />

            {apiError && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                {apiError}
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {loading ? "처리 중..." : "회원가입"}
            </button>
          </form>
        )}

        {/* 모드 전환 */}
        <div className="mt-6 text-center">
          <button
            onClick={switchMode}
            className="text-gray-400 hover:text-white text-sm"
          >
            {mode === "login"
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}
