"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1509763988163-d54b5f5d5b67?auto=format&fit=crop&w=1920&q=80",
    alt: "Friends traveling together",
  },
  {
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80",
    alt: "Happy traveler exploring",
  },
  {
    url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1920&q=80",
    alt: "Traveler at scenic location",
  },
  {
    url: "https://images.unsplash.com/photo-1653764802792-b2644a66b246?auto=format&fit=crop&w=1920&q=80",
    alt: "Couple in desert landscape",
  },
  {
    url: "https://images.unsplash.com/photo-1511311523739-2f3827fc69f1?auto=format&fit=crop&w=1920&q=80",
    alt: "Adventure travel on water",
  },
  {
    url: "https://images.unsplash.com/photo-1766938974052-e5ea0112587c?auto=format&fit=crop&w=1920&q=80",
    alt: "Vibrant street market",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(new Array(SLIDES.length).fill(false));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Preload images
  useEffect(() => {
    SLIDES.forEach((slide, i) => {
      const img = new Image();
      img.src = slide.url;
      img.onload = () =>
        setLoaded((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${slide.url})`,
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
            willChange: "opacity",
          }}
          aria-hidden={i !== current}
        />
      ))}

      {/* Dark gradient overlay — keeps text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,28,20,0.82) 0%, rgba(15,35,25,0.70) 55%, rgba(10,28,20,0.55) 100%)",
        }}
      />

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? "#1D9E75" : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
