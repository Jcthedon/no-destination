"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store";

const PLACEHOLDERS = [
  "Somewhere warm where I can disappear for two weeks, eat everything, and not check my phone…",
  "I want to hike somewhere dramatic and then eat incredible food. Budget matters.",
  "A city that feels alive at night, with history I can actually walk through…",
  "Off the beaten path. Not a resort. Somewhere locals actually go.",
  "Cold mountains, no crowds, and really good coffee somewhere nearby…",
  "A place where I can slow down. Good food. Friendly people. No itinerary.",
];

const EXAMPLE_CHIPS = [
  "Warm, cheap, off the beaten path",
  "City energy with great food scene",
  "Mountains + adventure + local culture",
  "Beach, relaxed vibe, budget-friendly",
  "History, art, walkable cities",
  "Remote, rugged, unforgettable",
];

export default function QueryPage() {
  const router = useRouter();
  const { setFromAI, reset } = useQuizStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    reset();
    const iv = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(iv);
  }, [reset]);

  async function handleSubmit() {
    const trimmed = query.trim();
    if (trimmed.length < 10) {
      setError("Tell us a little more — a sentence or two is perfect.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) throw new Error("Failed to get matches");

      const data = await res.json();
      setFromAI(data.profile, data.matches, trimmed);
      router.push("/reveal");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  }

  if (loading) return <LoadingScreen query={query} />;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16"
      style={{ background: "#050c08" }}
    >
      {/* Subtle background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(29,158,117,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <p
            className="text-xs uppercase tracking-[0.25em] font-semibold mb-3"
            style={{ color: "#1D9E75" }}
          >
            Personality-first travel
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Describe your ideal trip.
          </h1>
          <p className="mt-3 text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
            No forms. Just tell us what you&apos;re looking for — in your own words.
          </p>
        </div>

        {/* Textarea */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 0 0 0 rgba(29,158,117,0)",
            transition: "box-shadow 0.3s ease",
          }}
          onFocus={() => {
            const el = textareaRef.current?.parentElement;
            if (el) el.style.boxShadow = "0 0 0 2px rgba(29,158,117,0.35)";
          }}
          onBlur={() => {
            const el = textareaRef.current?.parentElement;
            if (el) el.style.boxShadow = "0 0 0 0 rgba(29,158,117,0)";
          }}
        >
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            rows={5}
            placeholder={PLACEHOLDERS[placeholderIndex]}
            className="w-full bg-transparent text-white resize-none outline-none p-5 text-base leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.9)",
              caretColor: "#1D9E75",
            }}
          />
          <div
            className="px-5 pb-4 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              {query.length > 0 ? `${query.length} chars · ⌘↵ to submit` : "⌘↵ to submit"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={query.trim().length < 10}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white transition-all active:scale-95"
              style={{
                background: query.trim().length >= 10 ? "#1D9E75" : "rgba(255,255,255,0.08)",
                color: query.trim().length >= 10 ? "#fff" : "rgba(255,255,255,0.25)",
                transition: "background 0.2s ease, color 0.2s ease",
              }}
            >
              Find my matches
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm" style={{ color: "#ff6b6b" }}>{error}</p>
        )}

        {/* Example chips */}
        <div className="flex flex-col gap-3">
          <p className="text-center text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
            Or pick a vibe
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setQuery(chip)}
                className="px-4 py-2 rounded-full text-sm transition-all hover:opacity-80"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function LoadingScreen({ query }: { query: string }) {
  const [dots, setDots] = useState("");
  const [phase, setPhase] = useState(0);

  const PHASES = [
    "Reading between the lines",
    "Mapping your vibe",
    "Scoring destinations",
    "Almost ready",
  ];

  useEffect(() => {
    const dotIv = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    const phaseIv = setInterval(() => setPhase((p) => Math.min(p + 1, PHASES.length - 1)), 1400);
    return () => {
      clearInterval(dotIv);
      clearInterval(phaseIv);
    };
  }, [PHASES.length]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-10 px-8"
      style={{ background: "#050c08" }}
    >
      {/* Pulsing compass icon */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute rounded-full animate-ping"
          style={{ width: 72, height: 72, background: "rgba(29,158,117,0.15)" }}
        />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "#1D9E75" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="9" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none" />
            <path d="M14 7v3M7.5 14h3M14 21v-3M20.5 14h-3" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="1.5" fill="rgba(255,255,255,0.9)" />
          </svg>
        </div>
      </div>

      <div className="text-center max-w-sm">
        <p className="text-xl font-bold text-white mb-2">
          {PHASES[phase]}{dots}
        </p>
        {query && (
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            &ldquo;{query.slice(0, 80)}{query.length > 80 ? "…" : ""}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
