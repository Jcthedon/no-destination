"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    async function joinAndRedirect() {
      const supabase = createClient();
      const { data: group } = await supabase
        .from("groups")
        .select("id, name")
        .eq("invite_code", code.toUpperCase())
        .single();

      if (!group) {
        router.push("/group");
        return;
      }

      await supabase
        .from("group_members")
        .upsert({ group_id: group.id, user_id: user!.id });

      router.push(`/group/${group.id}`);
    }

    joinAndRedirect();
  }, [user, loading, code, router]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <p className="text-5xl mb-4">🌍</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re invited!</h2>
          <p className="text-gray-500 mb-6">
            Sign in to join the group and see where everyone fits.
          </p>
          <GoogleSignInButton next={`/group/join/${code}`} label="Join with Google" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Joining group...</p>
    </div>
  );
}
