"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  configured: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Dynamically import to avoid build-time errors when env vars are absent
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user ?? null);
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => listener.subscription.unsubscribe();
    });
  }, [configured]);

  async function signInWithGoogle(next = "/results") {
    if (!configured) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  async function signOut() {
    if (!configured) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, configured, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
