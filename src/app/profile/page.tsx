"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuizStore } from "@/lib/store";
import { getArchetypeInfo } from "@/lib/matching";
import { DIMENSIONS } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, matches, saved, toggleSaved } = useQuizStore();
  const { user } = useAuth();
  const savedCountries = matches.filter((c) => saved.includes(c.code));

  useEffect(() => {
    if (!profile) router.replace("/quiz");
  }, [profile, router]);

  if (!profile) return null;

  const archetype = getArchetypeInfo(profile);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Signed-in account banner */}
        {user ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-5 flex items-center gap-4">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url as string}
                alt={user.user_metadata?.full_name as string ?? ""}
                width={44}
                height={44}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: "#1D9E75" }}
              >
                {((user.user_metadata?.full_name as string)?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {user.user_metadata?.full_name as string ?? "Traveler"}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#1D9E7515", color: "#1D9E75" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="4"/></svg>
              Synced
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Save your profile</p>
              <p className="text-gray-500 text-sm mt-0.5">
                Sign in to sync your results across devices and never lose your matches.
              </p>
            </div>
            <GoogleSignInButton next="/profile" size="sm" label="Sign in with Google" />
          </div>
        )}

        {/* Archetype card — 16Personalities style */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-6">
          <div
            className="h-28 flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${archetype.color}22, ${archetype.color}44)` }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
              style={{ background: archetype.color }}
            />
            <div
              className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-15"
              style={{ background: archetype.color }}
            />
            <span className="text-5xl relative z-10">
              {archetype.traits[0].icon}
            </span>
          </div>
          <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: archetype.color }}>
              Your travel type
            </p>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">{archetype.name}</h2>
              <button
                onClick={() => router.push("/quiz")}
                className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors"
              >
                Retake quiz
              </button>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{archetype.desc}</p>
          </div>
        </div>

        {/* Dimension bars — 16Personalities style */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            Your travel profile
          </p>
          <div className="space-y-5">
            {DIMENSIONS.map((dim) => {
              const pct = profile[dim.key];
              return (
                <div key={dim.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{dim.left}</span>
                    <span className="text-sm font-bold text-gray-800">{dim.name}</span>
                    <span className="text-sm text-gray-500">{dim.right}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full dim-bar"
                      style={{
                        width: `${pct}%`,
                        background: dim.color,
                        animationDelay: `${DIMENSIONS.indexOf(dim) * 80}ms`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-300">{100 - pct}%</span>
                    <span className="text-xs font-semibold" style={{ color: dim.color }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Character traits */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Character traits
          </p>
          <div className="space-y-3">
            {archetype.traits.map((trait) => (
              <div
                key={trait.label}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: trait.color + "20" }}
                >
                  {trait.icon}
                </div>
                <span className="font-medium text-gray-800">{trait.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Saved trips */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Saved trips
            </p>
            <Link
              href="/results"
              className="text-xs font-semibold"
              style={{ color: "#1D9E75" }}
            >
              View all →
            </Link>
          </div>

          {savedCountries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No saved trips yet.</p>
              <p className="text-gray-300 text-xs mt-1">
                Browse your matches and save the ones that excite you.
              </p>
              <Link
                href="/results"
                className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "#1D9E75" }}
              >
                See my matches
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedCountries.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center gap-3 rounded-xl overflow-hidden border border-gray-100"
                >
                  <div className="w-20 h-16 relative flex-shrink-0">
                    <Image
                      src={country.imageUrl}
                      alt={country.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/country/${country.code}`}>
                      <p className="font-semibold text-gray-900 text-sm">
                        {country.flag} {country.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {country.region} ·{" "}
                        <span className="font-bold" style={{ color: "#1D9E75" }}>
                          {country.matchScore}% match
                        </span>
                      </p>
                    </Link>
                  </div>
                  <button
                    onClick={() => toggleSaved(country.code)}
                    className="mr-3 p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
