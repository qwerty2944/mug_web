import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import { signOut as signOutApi } from "@/features/auth/sign-out";

interface AuthStore {
  user: User | null;
  session: Session | null;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  clear: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, user: session?.user ?? null }),
      clear: () => set({ user: null, session: null }),
      signOut: async () => {
        await signOutApi();
        set({ user: null, session: null });
      },
    }),
    {
      name: "mud-auth",
      partialize: (state) => ({ user: state.user }), // session은 저장하지 않음
    }
  )
);
