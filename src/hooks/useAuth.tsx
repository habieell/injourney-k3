// src/hooks/useAuth.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Enums"]["user_role"] | null;

type AuthContextValue = {
  profile: ProfileRow | null;
  role: UserRole;
  loading: boolean; // true = lagi cek session/profile
  isAuthenticated: boolean; // true kalau ada session Supabase
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowserClient();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false); // <= NEW

  const loadProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // === sumber truth: ada session atau nggak ===
      setHasSession(!!session);

      if (!session) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Load profile error:", error);
        // tetap anggap login (karena session ada), tapi profile belum kebaca
        setProfile(null);
        return;
      }

      if (!data) {
        // tidak ada row profiles, tapi session ada
        console.warn(
          "[useAuth] Session ada tapi row profiles tidak ditemukan untuk user",
          session.user.id
        );
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error("loadProfile error:", err);
      setProfile(null);
      setHasSession(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // update flag session
        setHasSession(!!session);

        if (!session) {
          setProfile(null);
          setLoading(false);
        } else {
          // session baru → muat ulang profile
          void loadProfile();
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setHasSession(false);
    setLoading(false);
  };

  const value: AuthContextValue = {
    profile,
    role: profile?.role ?? null,
    loading,
    isAuthenticated: hasSession, // <= PENTING: pakai session, bukan !!profile
    signOut: handleSignOut,
    refreshProfile: loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
