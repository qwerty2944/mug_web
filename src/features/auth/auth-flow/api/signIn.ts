import { supabase } from "@/shared/api";

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignInResult {
  userId: string;
  hasCharacter: boolean;
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(params: SignInParams): Promise<SignInResult> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) throw error;

  // 캐릭터 존재 여부 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("characters")
    .eq("id", authData.user.id)
    .single();

  const hasCharacter = profile?.characters && profile.characters.length > 0;

  return {
    userId: authData.user.id,
    hasCharacter,
  };
}
