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

export type UserRole = NonNullable<ProfileRow["role"]>;

type RoleInContext = UserRole | null;

type AuthContextValue = {
  profile: ProfileRow | null;
  role: RoleInContext;
  loading: boolean; // true = lagi cek session
  isAuthenticated: boolean; // true kalau sudah ada profile
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // 1. cek session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setProfile(null);
        return;
      }

      // 2. ambil profile dari tabel "profiles"
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        console.error("Load profile error:", error);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error("loadProfile error:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // pertama kali app jalan → cek session
    loadProfile();

    // dengar perubahan auth (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          // logout
          setProfile(null);
          setLoading(false);
        } else {
          // login / token refresh → reload profile
          loadProfile();
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
    // langsung kosongin state
    setProfile(null);
    setLoading(false);
  };

  const value: AuthContextValue = {
    profile,
    role: (profile?.role as UserRole | null) ?? null,
    loading,
    isAuthenticated: !!profile,
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
