import { supabase } from "@/shared/api";

export interface SignUpParams {
  email: string;
  password: string;
  redirectUrl?: string;
}

/**
 * 이메일 회원가입
 */
export async function signUp(params: SignUpParams): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      emailRedirectTo: params.redirectUrl || `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}
