"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuizStore } from "@/lib/store";
import { COUNTRIES, DIMENSIONS } from "@/lib/data";

export default function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { profile, matches, saved, toggleSaved } = useQuizStore();

  const country = COUNTRIES.find((c) => c.code === code);
  const matchedCountry = matches.find((c) => c.code === code);
  const matchScore = matchedCountry?.matchScore;
  const isSaved = saved.includes(code);

  useEffect(() => {
    if (!country) router.replace("/results");
  }, [country, router]);

  if (!country) return null;

  const FACTS = [
    { icon: "🌤️", label: "Best time", val: country.bestMonths },
    { icon: "💰", label: "Daily cost", val: country.dailyCost },
    { icon: "🛂", label: "Visa", val: country.visa },
    { icon: "🌍", label: "Region", val: country.region },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-72 sm:h-96">
        <Image
          src={country.imageUrl}
          alt={country.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Save button */}
        <button
          onClick={() => toggleSaved(code)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          {isSaved ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#ef4444">
              <path d="M10 17C10 17 2 11.5 2 6.5C2 4.57 3.57 3 5.5 3C7.05 3 8.5 4 10 6.5C11.5 4 12.95 3 14.5 3C16.43 3 18 4.57 18 6.5C18 11.5 10 17 10 17Z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M10 17C10 17 2 11.5 2 6.5C2 4.57 3.57 3 5.5 3C7.05 3 8.5 4 10 6.5C11.5 4 12.95 3 14.5 3C16.43 3 18 4.57 18 6.5C18 11.5 10 17 10 17Z" />
            </svg>
          )}
        </button>

        {/* Country info overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">{country.region}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {country.flag} {country.name}
              </h1>
            </div>
            {matchScore && (
              <div
                className="px-4 py-2 rounded-full text-white text-base font-bold flex-shrink-0"
                style={{ background: "#1D9E75" }}
              >
                {matchScore}% match
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Why it matches */}
        {matchScore && (
          <div className="bg-white rounded-2xl p-6 mb-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Why it matches you
            </p>
            <p className="text-gray-700 leading-relaxed">{country.why ?? country.description}</p>

            {/* Profile comparison bars */}
            {profile && (
              <div className="mt-5 space-y-3">
                {DIMENSIONS.map((dim) => {
                  const userVal = profile[dim.key];
                  const countryVal = country.profile[dim.key];
                  const diff = Math.abs(userVal - countryVal);
                  const aligned = diff < 20;
                  return (
                    <div key={dim.key} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
                        {dim.name}
                      </span>
                      <div className="flex-1 relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        {/* Country bar */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full opacity-30 dim-bar"
                          style={{ width: `${countryVal}%`, background: dim.color }}
                        />
                        {/* User bar */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full dim-bar"
                          style={{ width: `${userVal}%`, background: dim.color }}
                        />
                      </div>
                      <span className="text-xs flex-shrink-0">
                        {aligned ? (
                          <span style={{ color: dim.color }}>✓</span>
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {FACTS.map((f) => (
            <div key={f.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <span className="text-xl block mb-2">{f.icon}</span>
              <p className="text-xs text-gray-400">{f.label}</p>
              <p className="font-semibold text-gray-900 text-sm mt-0.5">{f.val}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">About</p>
          <p className="text-gray-700 leading-relaxed">{country.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {country.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => toggleSaved(code)}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all mb-3"
          style={{
            background: isSaved ? "#F3F4F6" : "#1D9E75",
            color: isSaved ? "#6B7280" : "#fff",
          }}
        >
          {isSaved ? "✓ Saved to my trips" : "Save to my trips"}
        </button>

        <Link
          href="/results"
          className="block w-full py-4 rounded-2xl text-base font-semibold text-center transition-all border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          ← Back to all matches
        </Link>
      </div>
    </div>
  );
}
