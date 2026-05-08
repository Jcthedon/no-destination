import Link from "next/link";
import Image from "next/image";
import { COUNTRIES, ARCHETYPES } from "@/lib/data";
import HeroCarousel from "@/components/HeroCarousel";

const FEATURED = [
  COUNTRIES.find((c) => c.code === "JPN")!,
  COUNTRIES.find((c) => c.code === "PRT")!,
  COUNTRIES.find((c) => c.code === "COL")!,
  COUNTRIES.find((c) => c.code === "MAR")!,
  COUNTRIES.find((c) => c.code === "ISL")!,
  COUNTRIES.find((c) => c.code === "GRC")!,
];

const ARCHETYPE_IMAGES: Record<string, { url: string; label: string; line: string }> = {
  "Slow Wanderer": {
    url: "https://images.unsplash.com/photo-1559554832-1589932794f8?auto=format&fit=crop&w=800&q=85",
    label: "still · unhurried",
    line: "You find depth in fewer places.",
  },
  "City Nomad": {
    url: "https://images.unsplash.com/photo-1754075756609-3873fc4b2725?auto=format&fit=crop&w=800&q=85",
    label: "electric · alive",
    line: "You navigate a city like a local by day two.",
  },
  "Culture Hunter": {
    url: "https://images.unsplash.com/photo-1484229449629-0b35883aaeed?auto=format&fit=crop&w=800&q=85",
    label: "curious · layered",
    line: "You leave knowing more than you arrived.",
  },
  "Backpacker Spirit": {
    url: "https://images.unsplash.com/photo-1569580388364-d25b048915cc?auto=format&fit=crop&w=800&q=85",
    label: "free · open",
    line: "The journey is the destination.",
  },
};

export default function Home() {
  const archetypeList = Object.values(ARCHETYPES);

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center" style={{ background: "#050c08" }}>
        <HeroCarousel />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-32 w-full">
          <div className="max-w-2xl">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-10 tracking-wider uppercase"
              style={{ background: "rgba(29,158,117,0.15)", color: "#4ade80", border: "1px solid rgba(29,158,117,0.25)" }}
            >
              ✦ Personality-first travel
            </span>

            <h1
              className="font-bold text-white leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
            >
              Who do you become<br />
              <span style={{ color: "#4ade80" }}>when you travel?</span>
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "32rem" }}>
              Some people chase landmarks.
              You&apos;re looking for somewhere that feels like you.
              Eight questions. Your world, filtered.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#1D9E75", boxShadow: "0 0 32px rgba(29,158,117,0.35)", letterSpacing: "0.02em" }}
              >
                Find your match →
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.30)", letterSpacing: "0.1em" }}>
                FREE · 2 MINUTES · NO SIGN-UP
              </span>
            </div>
          </div>

          {/* Floating cards — hidden on small screens */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[340px]">
            <div className="relative h-[380px]">
              {[
                { country: FEATURED[0], top: "0%", left: "30%", match: 94 },
                { country: FEATURED[1], top: "30%", left: "0%", match: 91 },
                { country: FEATURED[2], top: "60%", left: "38%", match: 88 },
              ].map(({ country, top, left, match }, i) => (
                <div
                  key={country.code}
                  className="absolute rounded-2xl overflow-hidden w-40 shadow-2xl"
                  style={{
                    top, left, zIndex: 3 - i,
                    background: "rgba(10,20,14,0.85)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="h-20 relative">
                    <Image src={country.imageUrl} alt={country.name} fill className="object-cover opacity-90" sizes="160px" />
                  </div>
                  <div className="p-2.5">
                    <p className="font-bold text-white text-sm">{country.flag} {country.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="h-0.5 rounded-full flex-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div className="h-0.5 rounded-full" style={{ width: `${match}%`, background: "#1D9E75" }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: "#4ade80" }}>{match}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: "#0a130d", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {[
              { value: "40+", label: "Countries scored" },
              { value: "7", label: "Personality dimensions" },
              { value: "8", label: "Questions" },
              { value: "4", label: "Travel archetypes" },
            ].map((s) => (
              <div key={s.label} className="text-center pl-4 first:pl-0">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Archetype Mood Cards ── */}
      <section style={{ background: "#070f0a" }} className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              Who are you, really?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Four types of traveler.<br />
              <span style={{ color: "#4ade80" }}>One that feels like you.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {archetypeList.map((a) => {
              const img = ARCHETYPE_IMAGES[a.name];
              return (
                <Link
                  key={a.name}
                  href="/quiz"
                  className="group relative rounded-2xl overflow-hidden block"
                  style={{ height: 360 }}
                >
                  {/* Image */}
                  <div
                    className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: img ? `url(${img.url})` : undefined,
                      background: img ? undefined : a.color + "30",
                      filter: "contrast(1.05) saturate(0.70) brightness(0.65)",
                    }}
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.20) 60%, transparent 100%)",
                    }}
                  />
                  {/* Color accent top bar */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: a.color }} />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <p
                      className="text-xs uppercase tracking-widest mb-2 font-medium"
                      style={{ color: img ? "rgba(255,255,255,0.45)" : a.color }}
                    >
                      {img?.label}
                    </p>
                    <h3 className="text-xl font-bold text-white mb-1">{a.name}</h3>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.50)" }}>
                      {img?.line}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: a.color }}
                    >
                      That&apos;s me →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">The process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Simple. Fast. Personal.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Take the quiz", desc: "8 questions about how you actually travel — pace, culture, food, adventure, climate. No right answers." },
              { num: "02", title: "Get your profile", desc: "Your 7-dimension travel personality mapped into one of four archetypes. Yours will feel obvious in retrospect." },
              { num: "03", title: "See your world", desc: "Every country scored against your profile. A personal world map ranked for who you are, not who everyone is." },
            ].map((step, i) => (
              <div key={step.num} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-[-2rem] h-px bg-gray-100" />
                )}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                  <span
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full text-sm font-black mb-5"
                    style={{ background: "#1D9E7512", color: "#1D9E75" }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destination Showcase ── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Not trending. Matched.</p>
              <h2 className="text-3xl font-bold text-gray-900">Destinations that resonate</h2>
            </div>
            <Link href="/quiz" className="hidden sm:block text-sm font-semibold hover:underline" style={{ color: "#1D9E75" }}>
              See yours →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED.map((country) => (
              <Link
                key={country.code}
                href="/quiz"
                className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <div className="relative h-52">
                  <Image
                    src={country.imageUrl}
                    alt={country.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ filter: "saturate(0.9)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-black text-xl leading-none">{country.flag} {country.name}</p>
                    <p className="text-xs opacity-60 mt-1 uppercase tracking-wider">{country.region}</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-white/80">
                    {country.tags[0]}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{country.description}</p>
                  <p className="text-xs font-semibold mt-3 flex items-center gap-1" style={{ color: "#1D9E75" }}>
                    Quiz to see your match score →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-28" style={{ background: "#050c08" }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1747330721960-681faaf7a92a?auto=format&fit=crop&w=1920&q=75")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(0.5) brightness(0.25)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(5,12,8,0.95) 0%, rgba(5,12,8,0.75) 100%)" }}
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
            your journey starts here
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            The right place exists.<br />
            <span style={{ color: "#4ade80" }}>You just haven&apos;t been matched yet.</span>
          </h2>
          <p className="mb-10" style={{ color: "rgba(255,255,255,0.40)", fontSize: "1rem" }}>
            8 questions. Your travel DNA. A world filtered just for you.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center px-10 py-4 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#1D9E75", color: "white", boxShadow: "0 0 40px rgba(29,158,117,0.35)", letterSpacing: "0.03em" }}
          >
            Start free — takes 2 minutes
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#070f0a", borderTop: "1px solid rgba(255,255,255,0.05)" }} className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: "#1D9E75" }}
            >
              ND
            </span>
            No Destination
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Travel built around who you are.</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>© 2026</p>
        </div>
      </footer>
    </div>
  );
}
