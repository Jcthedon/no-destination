"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1484229449629-0b35883aaeed?auto=format&fit=crop&w=1920&q=85",
    location: "Tokyo · late train home",
    mood: "contemplative",
  },
  {
    url: "https://images.unsplash.com/photo-1559554832-1589932794f8?auto=format&fit=crop&w=1920&q=85",
    location: "Lisbon · rainy afternoon",
    mood: "still",
  },
  {
    url: "https://images.unsplash.com/photo-1747330721960-681faaf7a92a?auto=format&fit=crop&w=1920&q=85",
    location: "Shinjuku · after midnight",
    mood: "electric",
  },
  {
    url: "https://images.unsplash.com/photo-1569580388364-d25b048915cc?auto=format&fit=crop&w=1920&q=85",
    location: "Faroe Islands · no destination",
    mood: "free",
  },
  {
    url: "https://images.unsplash.com/photo-1754075756609-3873fc4b2725?auto=format&fit=crop&w=1920&q=85",
    location: "Ikebukuro · neon hours",
    mood: "searching",
  },
  {
    url: "https://images.unsplash.com/photo-1500068015788-f677c0108ff6?auto=format&fit=crop&w=1920&q=85",
    location: "Dolomites · before the storm",
    mood: "vast",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [labelVisible, setLabelVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setLabelVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setLabelVisible(true);
      }, 600);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Images */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${slide.url})`,
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.8s ease-in-out",
            filter: "contrast(1.08) saturate(0.75) brightness(0.72)",
            willChange: "opacity",
          }}
        />
      ))}

      {/* Cinematic dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(5,12,8,0.88) 0%, rgba(5,12,8,0.60) 55%, rgba(5,12,8,0.30) 100%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Film grain SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04, mixBlendMode: "overlay" }}
        aria-hidden
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Location label */}
      <div
        className="absolute bottom-10 left-8 z-10"
        style={{
          opacity: labelVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <p
          className="text-xs uppercase tracking-[0.2em] font-medium"
          style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.18em" }}
        >
          {SLIDES[current].location}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-10 right-8 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setLabelVisible(true); }}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === current ? 18 : 5,
              height: 5,
              background:
                i === current
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.25)",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
