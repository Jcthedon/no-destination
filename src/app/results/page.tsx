"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useQuizStore } from "@/lib/store";
import { getArchetypeInfo } from "@/lib/matching";
import { type Country } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const GlobeMap = dynamic(() => import("@/components/GlobeMap"), { ssr: false });

const CONTINENTS = ["All", "Europe", "Asia", "Americas", "Africa", "Oceania"];

export default function ResultsPage() {
  const router = useRouter();
  const { profile, matches, saved, toggleSaved } = useQuizStore();
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Country | null>(null);

  useEffect(() => {
    if (!profile) router.replace("/quiz");
  }, [profile, router]);

  if (!profile || matches.length === 0) return null;

  const archetype = getArchetypeInfo(profile);

  const filtered =
    filter === "All"
      ? matches
      : matches.filter(
          (c) => c.continent.toLowerCase() === filter.toLowerCase()
        );

  function handleMapSelect(country: Country) {
    setSelected(country);
    // Scroll to card
    const el = document.getElementById(`country-${country.code}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Archetype banner */}
        <div
          className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: archetype.color + "15", border: `1.5px solid ${archetype.color}30` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: archetype.color + "20" }}
          >
            {archetype.traits[0].icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: archetype.color }}>
              Your travel type
            </p>
            <h2 className="text-xl font-bold text-gray-900">{archetype.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5 max-w-xl">{archetype.desc}</p>
          </div>
          <Link
            href="/profile"
            className="text-sm font-semibold px-4 py-2 rounded-full border-2 transition-colors hover:bg-white flex-shrink-0"
            style={{ borderColor: archetype.color, color: archetype.color }}
          >
            See full profile
          </Link>
        </div>

        {/* Sign-in nudge — shown only when not logged in */}
        {!user && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Save your results</p>
              <p className="text-gray-500 text-sm mt-0.5">
                Sign in with Google to save your personality profile and access your matches from any device.
              </p>
            </div>
            <GoogleSignInButton next="/results" size="sm" label="Sign in with Google" />
          </div>
        )}

        {/* Globe */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Your matches on the globe</h2>
          <p className="text-gray-400 text-sm mb-4">
            {matches.length} countries scored · drag to spin, scroll to zoom, tap a dot to explore
          </p>
          <div className="rounded-2xl overflow-hidden shadow-sm relative" style={{ height: 520, background: "#0d1117" }}>
            <GlobeMap countries={matches} onSelect={handleMapSelect} />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {CONTINENTS.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={{
                  background: active ? "#1D9E75" : "#fff",
                  borderColor: active ? "#1D9E75" : "#E5E7EB",
                  color: active ? "#fff" : "#6B7280",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((country) => {
            const isSaved = saved.includes(country.code);
            const isSelected = selected?.code === country.code;
            return (
              <div
                key={country.code}
                id={`country-${country.code}`}
                className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  isSelected ? "ring-2" : ""
                }`}
                style={{
                  borderColor: isSelected ? "#1D9E75" : "#F3F4F6",
                  ...(isSelected ? { ringColor: "#1D9E75" } : {}),
                }}
              >
                {/* Image */}
                <Link href={`/country/${country.code}`} className="block relative h-44 group overflow-hidden">
                  <Image
                    src={country.imageUrl}
                    alt={country.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Match badge */}
                  <div
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-bold"
                    style={{ background: matchBadgeColor(country.matchScore ?? 0) }}
                  >
                    {country.matchScore}% match
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-lg leading-none">
                      {country.flag} {country.name}
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">{country.region}</p>
                  </div>
                </Link>

                <div className="p-4">
                  <p className="text-sm text-gray-500 leading-snug line-clamp-2 mb-4">
                    {country.why ?? country.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/country/${country.code}`}
                      className="flex-1 text-center py-2 rounded-xl text-sm font-semibold transition-colors"
                      style={{ background: "#1D9E7512", color: "#1D9E75" }}
                    >
                      Explore
                    </Link>
                    <button
                      onClick={() => toggleSaved(country.code)}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 transition-colors"
                      title={isSaved ? "Remove from saved" : "Save"}
                    >
                      {isSaved ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="#ef4444">
                          <path d="M9 15C9 15 2 10.5 2 6C2 4.34 3.34 3 5 3C6.38 3 7.68 4 9 6C10.32 4 11.62 3 13 3C14.66 3 16 4.34 16 6C16 10.5 9 15 9 15Z" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 15C9 15 2 10.5 2 6C2 4.34 3.34 3 5 3C6.38 3 7.68 4 9 6C10.32 4 11.62 3 13 3C14.66 3 16 4.34 16 6C16 10.5 9 15 9 15Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function matchBadgeColor(score: number) {
  if (score >= 85) return "#1D9E75";
  if (score >= 75) return "#4A9EBD";
  if (score >= 65) return "#9B6FD4";
  return "#F0997B";
}
