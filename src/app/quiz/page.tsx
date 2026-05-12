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
  const [slide, setSlide] = useState<"enter" | "exit-left" | "exit-right">("enter");

  const progress = ((current + 1) / QUESTIONS.length) * 100;

  function selectAnswer(optIndex: number) {
    setAnswer(current, optIndex);
    if (current < QUESTIONS.length - 1) {
      setSlide("exit-left");
      setTimeout(() => { setCurrent((c) => c + 1); setSlide("enter"); }, 260);
    } else {
      setLoading(true);
      setTimeout(() => { computeAndSave(); router.push("/reveal"); }, 1800);
    }
  }

  function goBack() {
    if (current > 0) {
      setSlide("exit-right");
      setTimeout(() => { setCurrent((c) => c - 1); setSlide("enter"); }, 260);
    }
  }

  if (loading) return <QuizLoadingScreen />;

  const q = QUESTIONS[current];
  const selected = answers[current];

  const slideStyle = {
    enter:      { opacity: 1, transform: "translateX(0px)" },
    "exit-left":  { opacity: 0, transform: "translateX(-28px)" },
    "exit-right": { opacity: 0, transform: "translateX(28px)" },
  }[slide];

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0faf6 0%, #e8f5f0 35%, #f5f0ff 70%, #fff5e8 100%)",
      }}
    >
      {/* Soft topographic accent blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500, top: -180, right: -120,
            background: "radial-gradient(circle, rgba(29,158,117,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400, bottom: -100, left: -80,
            background: "radial-gradient(circle, rgba(120,80,220,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-5 pt-6 max-w-lg mx-auto w-full flex items-center gap-4">
        <button
          onClick={goBack}
          disabled={current === 0}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: current === 0 ? "transparent" : "rgba(0,0,0,0.06)",
            color: current === 0 ? "transparent" : "#6b7280",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #1D9E75, #34d399)",
                transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-medium" style={{ color: "#1D9E75" }}>
              Question {current + 1}
            </span>
            <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>
              {QUESTIONS.length - current - 1} left
            </span>
          </div>
        </div>
      </div>

      {/* Question + options */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 max-w-lg mx-auto w-full pb-8">
        <div
          key={current}
          style={{ ...slideStyle, transition: "opacity 0.26s ease, transform 0.26s cubic-bezier(0.22,1,0.36,1)" }}
        >
          {/* Question text */}
          <p
            className="font-black leading-tight mb-8"
            style={{ fontSize: "clamp(1.5rem, 4vw, 1.9rem)", color: "#0f1a15", letterSpacing: "-0.02em" }}
          >
            {q.q}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {q.opts.map((opt, i) => {
              const isSel = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className="group w-full text-left px-5 py-4 rounded-2xl text-base transition-all duration-200"
                  style={{
                    background: isSel
                      ? "rgba(29,158,117,0.12)"
                      : "rgba(255,255,255,0.7)",
                    border: isSel
                      ? "2px solid #1D9E75"
                      : "2px solid rgba(0,0,0,0.06)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: isSel
                      ? "0 4px 20px rgba(29,158,117,0.15)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    transform: isSel ? "translateY(-1px)" : "translateY(0)",
                    color: isSel ? "#0f6b4f" : "#1f2937",
                    fontWeight: isSel ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.7)";
                    }
                  }}
                >
                  <span className="flex items-center gap-3.5">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200"
                      style={{
                        background: isSel ? "#1D9E75" : "rgba(0,0,0,0.06)",
                        color: isSel ? "#fff" : "#9ca3af",
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                    {isSel && (
                      <span className="ml-auto flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="#1D9E75" />
                          <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step dots at bottom */}
      <div className="relative z-10 pb-6 flex justify-center gap-1.5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current
                ? "#1D9E75"
                : i < current
                ? "rgba(29,158,117,0.35)"
                : "rgba(0,0,0,0.1)",
            }}
          />
        ))}
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
