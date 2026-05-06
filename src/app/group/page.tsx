"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GroupsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !groupName.trim()) return;
    setCreating(true);
    setError("");

    const supabase = createClient();
    const invite_code = generateCode();

    const { data, error: err } = await supabase
      .from("groups")
      .insert({ name: groupName.trim(), invite_code, creator_id: user.id })
      .select("id")
      .single();

    if (err || !data) {
      setError("Couldn't create group. Try again.");
      setCreating(false);
      return;
    }

    await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id });
    router.push(`/group/${data.id}`);
  }

  async function joinGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!user || joinCode.length !== 6) return;
    setJoining(true);
    setError("");

    const supabase = createClient();
    const { data: group } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", joinCode.toUpperCase())
      .single();

    if (!group) {
      setError("Group not found. Double-check the code.");
      setJoining(false);
      return;
    }

    await supabase.from("group_members").upsert({ group_id: group.id, user_id: user.id });
    router.push(`/group/${group.id}`);
  }

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <p className="text-5xl mb-4">🌍</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group trips</h2>
          <p className="text-gray-500 mb-6">
            Sign in to create or join a group. Find where everyone fits — together.
          </p>
          <GoogleSignInButton next="/group" label="Continue with Google" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-6xl mb-4">🌍</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Group trips</h1>
          <p className="text-gray-500 text-lg">
            Find a destination that works for everyone — no compromises, just great matches.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Create */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Create a group</h2>
            <p className="text-sm text-gray-400 mb-5">
              Start a new group trip and share the invite link with your crew.
            </p>
            <form onSubmit={createGroup} className="space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Europe Summer 2026, Weekend crew..."
                maxLength={60}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!groupName.trim() || creating}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "#1D9E75" }}
              >
                {creating ? "Creating..." : "Create group →"}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or join an existing one</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Join */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Join a group</h2>
            <p className="text-sm text-gray-400 mb-5">Enter the 6-character invite code from your friend.</p>
            <form onSubmit={joinGroup} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="e.g. XK4P2A"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono tracking-widest focus:outline-none focus:border-green-400 transition-colors uppercase text-center"
              />
              <button
                type="submit"
                disabled={joinCode.length !== 6 || joining}
                className="w-full py-3 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-40"
              >
                {joining ? "Joining..." : "Join group →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
