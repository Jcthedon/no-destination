"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizStore } from "@/lib/store";
import { getArchetypeInfo } from "@/lib/matching";
import { type Country } from "@/lib/data";

export default function RevealPage() {
  const router = useRouter();
  const { profile, matches } = useQuizStore();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!profile) {
      router.replace("/quiz");
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 1700),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3200),
      setTimeout(() => setPhase(5), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [profile, router]);

  if (!profile || matches.length === 0) return null;

  const archetype = getArchetypeInfo(profile);
  const top = matches.slice(0, 3) as (Country & { matchScore: number })[];

  function slide(minPhase: number, delay = "0s") {
    return {
      opacity: phase >= minPhase ? 1 : 0,
      transform: phase >= minPhase ? "translateY(0px) scale(1)" : "translateY(48px) scale(0.97)",
      transition: `opacity 0.75s ease ${delay}, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}`,
    };
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col" style={{ background: "#050c08" }}>

      {/* Background photo — top match fades in at phase 2 */}
      {top[0] && (
        <div
          className="absolute inset-0"
          style={{
            opacity: phase >= 2 ? 0.28 : 0,
            transition: "opacity 2s ease",
            backgroundImage: `url(${top[0].imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(0.5) brightness(0.45)",
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,12,8,0.75) 0%, rgba(5,12,8,0.3) 40%, rgba(5,12,8,0.85) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-10 gap-6 max-w-5xl mx-auto w-full py-10">

        {/* Archetype reveal */}
        <div style={slide(1)} className="text-center">
          <p
            className="text-xs uppercase tracking-[0.28em] font-semibold mb-2"
            style={{ color: archetype.color }}
          >
            Your travel identity
          </p>
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-none">
            {archetype.name}
          </h1>
          <p className="mt-3 text-sm sm:text-base max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            {archetype.desc}
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            ...slide(2),
            width: "100%",
            maxWidth: 480,
            height: 1,
            background: "rgba(255,255,255,0.08)",
          }}
        />

        {/* Country cards */}
        <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4">

          {/* #1 — large card */}
          {top[0] && (
            <div
              style={{
                ...slide(2),
                flex: "0 0 auto",
                width: "100%",
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
                height: 260,
              }}
              className="sm:flex-[2]"
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${top[0].imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "saturate(0.85) brightness(0.55)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)",
                }}
              />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div>
                  <span
                    className="text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full"
                    style={{ background: archetype.color, color: "#fff" }}
                  >
                    #1 Match
                  </span>
                </div>
                <div>
                  <p className="text-4xl mb-1">{top[0].flag}</p>
                  <h2 className="text-4xl font-black text-white leading-none mb-2">
                    {top[0].name}
                  </h2>
                  <div className="flex items-center gap-2.5 max-w-[220px]">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: phase >= 3 ? `${top[0].matchScore ?? 94}%` : "0%",
                          background: archetype.color,
                          transition: "width 1.1s cubic-bezier(0.22,1,0.36,1) 0.2s",
                        }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm tabular-nums">
                      {top[0].matchScore ?? 94}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* #2 and #3 stacked */}
          <div className="flex sm:flex-col flex-row gap-3 sm:gap-4 sm:flex-1">
            {top[1] && (
              <div
                style={{
                  ...slide(3, "0.05s"),
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                  flex: 1,
                  minHeight: 124,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${top[1].imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "saturate(0.7) brightness(0.5)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)" }}
                />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    #2
                  </span>
                  <div>
                    <p className="text-2xl mb-0.5">{top[1].flag}</p>
                    <h3 className="text-xl font-black text-white leading-none">{top[1].name}</h3>
                    <p className="text-sm font-bold mt-0.5" style={{ color: archetype.color }}>
                      {top[1].matchScore ?? 91}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {top[2] && (
              <div
                style={{
                  ...slide(4, "0.05s"),
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                  flex: 1,
                  minHeight: 124,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${top[2].imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "saturate(0.7) brightness(0.5)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)" }}
                />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    #3
                  </span>
                  <div>
                    <p className="text-2xl mb-0.5">{top[2].flag}</p>
                    <h3 className="text-xl font-black text-white leading-none">{top[2].name}</h3>
                    <p className="text-sm font-bold mt-0.5" style={{ color: archetype.color }}>
                      {top[2].matchScore ?? 88}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={slide(5)} className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link
            href="/results"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-base text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: archetype.color }}
          >
            See all your matches
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            View full profile →
          </Link>
        </div>

      </div>
    </div>
  );
}
