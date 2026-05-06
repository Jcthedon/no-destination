"use client";

import { type Country } from "@/lib/data";

type Props = {
  countries: Country[];
  onSelect?: (country: Country) => void;
  selectedCode?: string;
};

function lonLatToPercent(lon: number, lat: number) {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  PRT: [-8.2, 39.4],
  JPN: [138.2, 36.2],
  COL: [-74.3, 4.6],
  MAR: [-7.1, 31.8],
  ISL: [-19.0, 65.0],
  VNM: [108.3, 14.1],
  MEX: [-102.6, 23.6],
  GEO: [43.4, 42.3],
  THA: [100.9, 15.9],
  PER: [-75.0, -9.2],
  ITA: [12.6, 41.9],
  ESP: [-3.7, 40.4],
  NZL: [172.0, -41.3],
  IND: [78.9, 20.6],
  ARG: [-63.6, -38.4],
};

function matchColor(score: number) {
  if (score >= 85) return "#1D9E75";
  if (score >= 75) return "#4A9EBD";
  if (score >= 65) return "#9B6FD4";
  return "#F0997B";
}

export default function WorldMap({ countries, onSelect, selectedCode }: Props) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#EBF4F8]" style={{ paddingBottom: "50%" }}>
      {/* World SVG background — simplified land masses */}
      <svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.25 }}
      >
        {/* North America */}
        <path d="M 70 60 L 200 55 L 240 80 L 255 130 L 230 175 L 195 200 L 150 215 L 110 200 L 80 160 L 60 110 Z" fill="#94a3b8" />
        {/* Greenland */}
        <path d="M 200 18 L 255 20 L 265 45 L 240 55 L 200 50 Z" fill="#94a3b8" />
        {/* South America */}
        <path d="M 190 220 L 245 215 L 270 260 L 260 320 L 235 370 L 200 380 L 170 355 L 160 290 L 170 245 Z" fill="#94a3b8" />
        {/* Europe */}
        <path d="M 452 62 L 530 58 L 545 75 L 530 100 L 500 115 L 465 108 L 448 90 Z" fill="#94a3b8" />
        {/* UK */}
        <path d="M 435 68 L 448 65 L 450 78 L 438 82 Z" fill="#94a3b8" />
        {/* Scandinavia */}
        <path d="M 490 38 L 520 30 L 530 55 L 505 60 Z" fill="#94a3b8" />
        {/* Africa */}
        <path d="M 460 118 L 540 112 L 558 155 L 555 230 L 530 290 L 502 295 L 472 270 L 450 200 L 450 145 Z" fill="#94a3b8" />
        {/* Asia */}
        <path d="M 545 52 L 820 40 L 850 75 L 840 125 L 800 165 L 740 170 L 660 160 L 600 145 L 560 115 L 545 85 Z" fill="#94a3b8" />
        {/* SE Asia peninsula */}
        <path d="M 720 160 L 750 160 L 755 210 L 730 225 L 710 200 Z" fill="#94a3b8" />
        {/* Australia */}
        <path d="M 768 290 L 870 280 L 890 320 L 875 365 L 830 375 L 775 355 L 755 315 Z" fill="#94a3b8" />
        {/* New Zealand */}
        <path d="M 895 345 L 910 340 L 918 360 L 905 375 L 892 368 Z" fill="#94a3b8" />
        {/* Japan islands */}
        <path d="M 808 88 L 830 82 L 835 100 L 815 108 Z" fill="#94a3b8" />
      </svg>

      {/* Country dots */}
      {countries.map((country) => {
        const coords = COUNTRY_COORDS[country.code];
        if (!coords) return null;
        const { x, y } = lonLatToPercent(coords[0], coords[1]);
        const score = country.matchScore ?? 0;
        const color = matchColor(score);
        const isSelected = country.code === selectedCode;
        const size = isSelected ? 14 : score >= 85 ? 11 : 9;

        return (
          <button
            key={country.code}
            onClick={() => onSelect?.(country)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`${country.name} — ${score}% match`}
          >
            {/* Pulse ring for top matches */}
            {score >= 85 && !isSelected && (
              <span
                className="absolute rounded-full map-pulse"
                style={{
                  width: size + 8,
                  height: size + 8,
                  background: color,
                  opacity: 0.3,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
            <span
              className="block rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125"
              style={{
                width: size,
                height: size,
                background: color,
                boxShadow: isSelected ? `0 0 0 3px ${color}40` : undefined,
              }}
            />
            {/* Label on hover */}
            <span
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              {country.name} · {score}%
            </span>
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-gray-500">
        <span>Weak</span>
        {[{ c: "#F0997B" }, { c: "#9B6FD4" }, { c: "#4A9EBD" }, { c: "#1D9E75" }].map(({ c }, i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
        ))}
        <span>Strong</span>
      </div>
    </div>
  );
}
