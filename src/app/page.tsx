import Link from "next/link";
import Image from "next/image";
import { COUNTRIES, ARCHETYPES } from "@/lib/data";
import HeroCarousel from "@/components/HeroCarousel";

const FEATURED = [
  COUNTRIES.find((c) => c.code === "JPN")!,
  COUNTRIES.find((c) => c.code === "PRT")!,
  COUNTRIES.find((c) => c.code === "COL")!,
  COUNTRIES.find((c) => c.code === "MAR")!,
  COUNTRIES.find((c) => c.code === "THA")!,
  COUNTRIES.find((c) => c.code === "GRC")!,
];

const STATS = [
  { value: "40+", label: "Countries scored" },
  { value: "7", label: "Personality dimensions" },
  { value: "8", label: "Questions" },
  { value: "4", label: "Travel archetypes" },
];

const STEPS = [
  {
    num: "01",
    title: "Take the quiz",
    desc: "8 questions about how you travel — pace, culture, food, adventure, climate, and more.",
  },
  {
    num: "02",
    title: "Get your profile",
    desc: "Your 7-dimension travel personality is mapped into one of four archetypes.",
  },
  {
    num: "03",
    title: "See your matches",
    desc: "Every country scored against your profile. Explore your personal world map.",
  },
];

export default function Home() {
  const archetypeList = Object.values(ARCHETYPES);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: "#0f1f1a" }}>
        <HeroCarousel />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-8"
              style={{ background: "rgba(29,158,117,0.2)", color: "#4ade80", border: "1px solid rgba(29,158,117,0.3)" }}
            >
              ✦ Personality-first travel
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Travel built around{" "}
              <span style={{ color: "#4ade80" }}>who you are.</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-10 max-w-xl">
              Not flights. Not hotels. Not trending lists.
              A 2-minute quiz that maps your personality to the countries that actually fit you.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
                style={{ background: "#1D9E75", boxShadow: "0 0 40px rgba(29,158,117,0.4)" }}
              >
                Start the quiz →
              </Link>
              <span className="text-sm text-gray-400">
                Free · No sign-up · 2 minutes
              </span>
            </div>
          </div>

          {/* Floating cards */}
          <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 w-[380px]">
            <div className="relative h-[400px]">
              {[
                { country: FEATURED[0], top: "0%", left: "30%", match: 94 },
                { country: FEATURED[1], top: "30%", left: "0%", match: 91 },
                { country: FEATURED[2], top: "58%", left: "40%", match: 88 },
              ].map(({ country, top, left, match }, i) => (
                <div
                  key={country.code}
                  className="absolute bg-white rounded-2xl overflow-hidden w-44 shadow-2xl"
                  style={{ top, left, zIndex: 3 - i }}
                >
                  <div className="h-24 relative">
                    <Image src={country.imageUrl} alt={country.name} fill className="object-cover" sizes="176px" />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm">{country.flag} {country.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="h-1 rounded-full flex-1 bg-gray-100">
                        <div className="h-1 rounded-full" style={{ width: `${match}%`, background: "#1D9E75" }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: "#1D9E75" }}>{match}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-gray-100">
            {STATS.map((s) => (
              <div key={s.label} className="text-center pl-6 first:pl-0">
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-2 text-lg">Simple. Fast. Personal.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-[-2rem] h-px bg-gray-200" />
                )}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                  <span
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full text-sm font-black mb-5"
                    style={{ background: "#1D9E7515", color: "#1D9E75" }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Archetypes ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Which traveler are you?</h2>
              <p className="text-gray-500 mt-2">Four archetypes. One that fits you perfectly.</p>
            </div>
            <Link href="/quiz" className="hidden sm:block text-sm font-semibold hover:underline" style={{ color: "#1D9E75" }}>
              Find yours →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {archetypeList.map((a) => (
              <Link
                key={a.name}
                href="/quiz"
                className="group block rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
                style={{ borderTop: `3px solid ${a.color}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                  style={{ background: `${a.color}18` }}
                >
                  {a.traits[0].icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{a.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{a.desc}</p>
                <div className="flex gap-1.5 flex-wrap mt-4">
                  {a.traits.map((t) => (
                    <span
                      key={t.label}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${t.color}15`, color: t.color }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destination Showcase ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Explore destinations</h2>
              <p className="text-gray-500 mt-1">Ranked differently for every traveler.</p>
            </div>
            <Link href="/quiz" className="text-sm font-semibold hover:underline" style={{ color: "#1D9E75" }}>
              See your ranking →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED.map((country) => (
              <Link
                key={country.code}
                href="/quiz"
                className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <Image
                    src={country.imageUrl}
                    alt={country.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-black text-xl leading-none">{country.flag} {country.name}</p>
                    <p className="text-xs opacity-75 mt-1">{country.region}</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: "#1D9E75" }}>
                    {country.tags[0]}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{country.description}</p>
                  <p className="text-xs font-semibold mt-3 flex items-center gap-1" style={{ color: "#1D9E75" }}>
                    Take the quiz to see your match →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden py-24" style={{ background: "linear-gradient(135deg, #0f1f1a 0%, #1a3328 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, #1D9E75 0%, transparent 60%)"
        }} />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Your next trip starts with knowing yourself.
          </h2>
          <p className="text-gray-300 text-lg mb-10">
            8 questions. Your travel DNA. A world filtered just for you.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center px-10 py-4 rounded-full text-base font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#1D9E75", color: "white", boxShadow: "0 0 40px rgba(29,158,117,0.4)" }}
          >
            Start free — takes 2 minutes
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: "#1D9E75" }}
            >
              ND
            </span>
            No Destination
          </div>
          <p>Travel built around who you are.</p>
          <p>© 2026</p>
        </div>
      </footer>
    </div>
  );
}
