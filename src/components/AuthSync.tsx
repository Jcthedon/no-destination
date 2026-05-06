"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { useQuizStore } from "@/lib/store";

/**
 * Mounts once in the layout. When a user signs in:
 *  - if they have a local profile  → push it to Supabase
 *  - if they have no local profile → pull their saved profile from Supabase
 */
export default function AuthSync() {
  const { user } = useAuth();
  const { profile, syncToSupabase, loadFromSupabase } = useQuizStore();
  const syncedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!user || syncedUid.current === user.id) return;
    syncedUid.current = user.id;

    if (profile) {
      syncToSupabase(user);
    } else {
      loadFromSupabase(user);
    }
  }, [user, profile, syncToSupabase, loadFromSupabase]);

  return null;
}
