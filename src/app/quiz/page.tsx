"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/data";
import { useQuizStore } from "@/lib/store";

// ─── AI Query path ──────────────────────────────────────────────

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

function AIQueryScreen() {
  const router = useRouter();
  const { setFromAI } = useQuizStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(iv);
  }, []);

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
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFromAI(data.profile, data.matches, trimmed);
      router.push("/reveal");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  if (loading) return <AILoadingScreen query={query} />;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          rows={5}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          className="w-full bg-transparent resize-none outline-none p-5 text-base leading-relaxed"
          style={{ color: "rgba(255,255,255,0.9)", caretColor: "#1D9E75" }}
        />
        <div className="px-5 pb-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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

      {error && <p className="text-center text-sm" style={{ color: "#ff6b6b" }}>{error}</p>}

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
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Questionnaire path ─────────────────────────────────────────

function QuestionnaireScreen() {
  const router = useRouter();
  const { answers, setAnswer, computeAndSave } = useQuizStore();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animDir, setAnimDir] = useState<"in" | "out">("in");
  const progress = (current / QUESTIONS.length) * 100;

  function selectAnswer(optIndex: number) {
    setAnswer(current, optIndex);
    if (current < QUESTIONS.length - 1) {
      setAnimDir("out");
      setTimeout(() => { setCurrent((c) => c + 1); setAnimDir("in"); }, 220);
    } else {
      setLoading(true);
      setTimeout(() => { computeAndSave(); router.push("/reveal"); }, 1800);
    }
  }

  function goBack() {
    if (current > 0) {
      setAnimDir("out");
      setTimeout(() => { setCurrent((c) => c - 1); setAnimDir("in"); }, 150);
    }
  }

  if (loading) return <QuizLoadingScreen />;

  const q = QUESTIONS[current];
  const selected = answers[current];

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="px-5 pt-5 pb-4 max-w-lg mx-auto w-full">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={goBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "#1D9E75" }} />
          </div>
          <span className="text-sm text-gray-400 tabular-nums">
            {current + 1}/{QUESTIONS.length}
          </span>
        </div>

        {/* Question */}
        <div
          key={current}
          style={{
            opacity: animDir === "in" ? 1 : 0,
            transform: animDir === "in" ? "translateY(0)" : "translateY(-8px)",
            transition: "opacity 0.22s ease, transform 0.22s ease",
          }}
        >
          <p className="text-2xl font-bold text-gray-900 leading-tight mb-6">{q.q}</p>
          <div className="flex flex-col gap-3">
            {q.opts.map((opt, i) => {
              const isSel = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className="w-full text-left px-5 py-4 rounded-2xl border-2 text-base font-medium transition-all"
                  style={{
                    background: isSel ? "#1D9E7512" : "#FAFAFA",
                    borderColor: isSel ? "#1D9E75" : "#E5E7EB",
                    color: isSel ? "#1D9E75" : "#1F2937",
                    fontWeight: isSel ? 600 : 500,
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                      style={{
                        borderColor: isSel ? "#1D9E75" : "#D1D5DB",
                        background: isSel ? "#1D9E75" : "transparent",
                        color: isSel ? "#fff" : "#9CA3AF",
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────

export default function QuizPage() {
  const { reset } = useQuizStore();
  const [mode, setMode] = useState<"choose" | "ai" | "quiz">("choose");

  useEffect(() => { reset(); }, [reset]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16" style={{ background: "#050c08" }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(29,158,117,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">

        {/* Header — shown on all modes */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: "#1D9E75" }}>
            Personality-first travel
          </p>
          {mode === "choose" && (
            <>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                How do you want to start?
              </h1>
              <p className="mt-3 text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
                Two ways to find your perfect destination.
              </p>
            </>
          )}
          {mode === "ai" && (
            <>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                Describe your ideal trip.
              </h1>
              <p className="mt-3 text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
                No forms. Just tell us what you&apos;re looking for.
              </p>
            </>
          )}
          {mode === "quiz" && (
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Eight questions.
            </h1>
          )}
        </div>

        {/* Choose mode */}
        {mode === "choose" && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* AI path */}
            <button
              onClick={() => setMode("ai")}
              className="flex-1 text-left p-6 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98] group"
              style={{ background: "#1D9E75", border: "1px solid #1D9E75" }}
            >
              <div className="text-2xl mb-3">✍️</div>
              <p className="text-white font-black text-lg leading-tight mb-1">Describe it</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                Write what you&apos;re feeling in your own words. AI reads between the lines.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-white">
                Start typing <span>→</span>
              </div>
            </button>

            {/* Quiz path */}
            <button
              onClick={() => setMode("quiz")}
              className="flex-1 text-left p-6 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="text-2xl mb-3">🧭</div>
              <p className="text-white font-black text-lg leading-tight mb-1">Take the quiz</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Eight quick questions. Structured, precise, takes 2 minutes.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                Let&apos;s go <span>→</span>
              </div>
            </button>
          </div>
        )}

        {/* AI input */}
        {mode === "ai" && <AIQueryScreen />}

        {/* Questionnaire */}
        {mode === "quiz" && <QuestionnaireScreen />}

        {/* Back to choice */}
        {mode !== "choose" && (
          <button
            onClick={() => setMode("choose")}
            className="mx-auto text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            ← Switch method
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Loading screens ─────────────────────────────────────────────

function AILoadingScreen({ query }: { query: string }) {
  const [dots, setDots] = useState("");
  const [phase, setPhase] = useState(0);
  const PHASES = ["Reading between the lines", "Mapping your vibe", "Scoring destinations", "Almost ready"];
  useEffect(() => {
    const d = setInterval(() => setDots((v) => (v.length >= 3 ? "" : v + ".")), 400);
    const p = setInterval(() => setPhase((v) => Math.min(v + 1, PHASES.length - 1)), 1400);
    return () => { clearInterval(d); clearInterval(p); };
  }, [PHASES.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-8" style={{ background: "#050c08" }}>
      <div className="relative flex items-center justify-center">
        <div className="absolute rounded-full animate-ping" style={{ width: 72, height: 72, background: "rgba(29,158,117,0.15)" }} />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#1D9E75" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="9" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none" />
            <path d="M14 7v3M7.5 14h3M14 21v-3M20.5 14h-3" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="1.5" fill="rgba(255,255,255,0.9)" />
          </svg>
        </div>
      </div>
      <div className="text-center max-w-sm">
        <p className="text-xl font-bold text-white mb-2">{PHASES[phase]}{dots}</p>
        {query && (
          <p className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
            &ldquo;{query.slice(0, 80)}{query.length > 80 ? "…" : ""}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function QuizLoadingScreen() {
  const LABELS = ["Scanning destinations", "Matching your pace", "Ranking by vibe", "Almost there"];
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState(LABELS[0]);
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(p + Math.random() * 8, 95);
      setProgress(p);
      setLabel(LABELS[Math.min(Math.floor(p / 25), 3)]);
    }, 140);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-8" style={{ background: "#050c08" }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "#1D9E75" }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="10" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" fill="none" />
          <path d="M15 5L15 9" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M7.5 8.3 A10 10 0 0 1 22.5 8.3" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white mb-2">Finding your matches</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{label}…</p>
      </div>
      <div className="w-full max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#1D9E75", transition: "width 0.14s linear" }} />
      </div>
    </div>
  );
}
