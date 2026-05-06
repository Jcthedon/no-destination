"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getGroupMatches, getArchetype } from "@/lib/matching";
import { type Profile, ARCHETYPES } from "@/lib/data";

type Member = {
  user_id: string;
  display_name: string;
  avatar_url: string;
  profile: Profile | null;
};

type GroupData = {
  id: string;
  name: string;
  invite_code: string;
  creator_id: string;
};

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tab, setTab] = useState<"results" | "members">("results");
  const [copied, setCopied] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/group");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    async function load() {
      const [groupRes, membersRes] = await Promise.all([
        supabase.from("groups").select("*").eq("id", id).single(),
        supabase
          .from("group_members")
          .select("user_id, profiles(display_name, avatar_url), user_profiles(pace, environment, culture, adventure, food, budget, climate)")
          .eq("group_id", id),
      ]);

      if (groupRes.data) setGroup(groupRes.data);

      if (membersRes.data) {
        setMembers(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          membersRes.data.map((m: any) => ({
            user_id: m.user_id,
            display_name: m.profiles?.display_name ?? "Anonymous",
            avatar_url: m.profiles?.avatar_url ?? "",
            profile: m.user_profiles
              ? {
                  pace: m.user_profiles.pace,
                  environment: m.user_profiles.environment,
                  culture: m.user_profiles.culture,
                  adventure: m.user_profiles.adventure,
                  food: m.user_profiles.food,
                  budget: m.user_profiles.budget,
                  climate: m.user_profiles.climate,
                }
              : null,
          }))
        );
      }

      setPageLoading(false);
    }

    load();
  }, [user, id]);

  function copyInviteLink() {
    if (!group) return;
    const link = `${window.location.origin}/group/join/${group.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const profiledMembers = members.filter((m) => m.profile !== null);
  const groupMatches = profiledMembers.length >= 2
    ? getGroupMatches(profiledMembers.map((m) => m.profile!))
    : [];

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Group not found.</p>
          <Link href="/group" className="text-sm font-semibold" style={{ color: "#1D9E75" }}>
            Back to groups →
          </Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: "results", label: "Matches", icon: "🗺️" },
    { key: "members", label: `Members (${members.length})`, icon: "👥" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {profiledMembers.length}/{members.length} profiles completed
              </p>
            </div>
            <button
              onClick={copyInviteLink}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? "✓ Copied!" : "🔗 Invite"}
            </button>
          </div>

          {/* Invite code */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">Code:</span>
            <code
              onClick={copyInviteLink}
              className="text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-80"
              style={{ background: "#1D9E7515", color: "#1D9E75" }}
            >
              {group.invite_code}
            </code>
            <span className="text-xs text-gray-400">— share this with your group</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-px">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors"
                style={{
                  borderBottomColor: tab === t.key ? "#1D9E75" : "transparent",
                  color: tab === t.key ? "#1D9E75" : "#6b7280",
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Results ── */}
        {tab === "results" && (
          <div>
            {profiledMembers.length < 2 ? (
              <div className="text-center py-24">
                <p className="text-6xl mb-4">🌐</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Waiting for more profiles</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Group matches appear once at least 2 members have completed the quiz. Share the invite link to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={copyInviteLink}
                    className="px-6 py-3 rounded-full text-sm font-bold text-white"
                    style={{ background: "#1D9E75" }}
                  >
                    {copied ? "Copied!" : "Copy invite link"}
                  </button>
                  <Link
                    href="/quiz"
                    className="px-6 py-3 rounded-full text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50"
                  >
                    Take the quiz →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: "#1D9E7510", border: "1px solid #1D9E7525" }}>
                  <span className="text-2xl">✦</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1D9E75" }}>
                      Scored for all {profiledMembers.length} members
                    </p>
                    <p className="text-xs text-gray-500">
                      These destinations balance everyone's profile. No one gets a bad deal.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groupMatches.slice(0, 15).map((country) => (
                    <Link
                      key={country.code}
                      href={`/country/${country.code}`}
                      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <div className="relative h-44">
                        <Image
                          src={country.imageUrl}
                          alt={country.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="400px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 text-white">
                          <p className="font-black text-lg leading-none">{country.flag} {country.name}</p>
                          <p className="text-xs opacity-75 mt-0.5">{country.region}</p>
                        </div>
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-black text-white"
                          style={{ background: "#1D9E75" }}
                        >
                          {country.matchScore}% group
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex gap-1 flex-wrap mb-2">
                          {country.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{country.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Members ── */}
        {tab === "members" && (
          <div className="space-y-3">
            {members.map((member) => {
              const archName = member.profile ? getArchetype(member.profile) : null;
              const arch = archName ? ARCHETYPES[archName] : null;
              return (
                <div key={member.user_id} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.display_name}
                      width={44}
                      height={44}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                      {member.display_name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{member.display_name}</p>
                    {arch ? (
                      <span
                        className="inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5"
                        style={{ background: `${arch.color}18`, color: arch.color }}
                      >
                        {archName}
                      </span>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Quiz not completed yet</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {member.user_id === group.creator_id && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium">
                        Creator
                      </span>
                    )}
                    {member.user_id === user?.id && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                        You
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {!members.find((m) => m.user_id === user?.id) && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-400">You haven't joined this group yet.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
