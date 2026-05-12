"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/data";
import { useQuizStore } from "@/lib/store";

export default function QuizPage() {
  const router = useRouter();
  const { answers, setAnswer, computeAndSave, reset } = useQuizStore();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animDir, setAnimDir] = useState<"in" | "out">("in");

  // Reset quiz on mount
  useEffect(() => {
    reset();
    setCurrent(0);
  }, [reset]);

  useEffect(() => {
    setProgress((current / QUESTIONS.length) * 100);
  }, [current]);

  function selectAnswer(optIndex: number) {
    setAnswer(current, optIndex);

    if (current < QUESTIONS.length - 1) {
      setAnimDir("out");
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setAnimDir("in");
      }, 220);
    } else {
      // Final question — compute and navigate
      setLoading(true);
      setTimeout(() => {
        computeAndSave();
        router.push("/reveal");
      }, 1800);
    }
  }

  function goBack() {
    if (current > 0) {
      setAnimDir("out");
      setTimeout(() => {
        setCurrent((c) => c - 1);
        setAnimDir("in");
      }, 150);
    } else {
      router.push("/");
    }
  }

  const q = QUESTIONS[current];
  const selected = answers[current];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress header */}
      <div className="px-5 pt-5 pb-4 max-w-lg mx-auto w-full">
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
            <div
              className="h-full rounded-full progress-bar"
              style={{ width: `${progress}%`, background: "#1D9E75" }}
            />
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
          <p className="text-2xl font-bold text-gray-900 leading-tight mb-6">
            {q.q}
          </p>

          <div className="flex flex-col gap-3">
            {q.opts.map((opt, i) => {
              const isSel = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className="quiz-option w-full text-left px-5 py-4 rounded-2xl border-2 text-base font-medium transition-all"
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

function LoadingScreen() {
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 px-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: "#1D9E75" }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="10" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" fill="none" />
          <path d="M15 5L15 9" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M7.5 8.3 A10 10 0 0 1 22.5 8.3" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-gray-900 mb-2">Finding your matches</p>
        <p className="text-gray-500 text-sm">{label}…</p>
      </div>
      <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: "#1D9E75", transition: "width 0.14s linear" }}
        />
      </div>
    </div>
  );
}
