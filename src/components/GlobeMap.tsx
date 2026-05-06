"use client";

import React, { useState, useEffect, useRef } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Country } from "@/lib/data";

/* ── coordinate + metadata for every country in our dataset ── */
const COUNTRY_META: Record<string, { lat: number; lng: number; capital: string }> = {
  PRT: { lat: 39.4,  lng: -8.2,   capital: "Lisbon" },
  JPN: { lat: 36.2,  lng: 138.2,  capital: "Tokyo" },
  COL: { lat: 4.6,   lng: -74.1,  capital: "Bogotá" },
  MAR: { lat: 31.8,  lng: -7.1,   capital: "Rabat" },
  ISL: { lat: 64.9,  lng: -19.0,  capital: "Reykjavík" },
  VNM: { lat: 14.0,  lng: 108.0,  capital: "Hanoi" },
  MEX: { lat: 23.6,  lng: -102.5, capital: "Mexico City" },
  GEO: { lat: 42.3,  lng: 43.4,   capital: "Tbilisi" },
  THA: { lat: 15.9,  lng: 100.9,  capital: "Bangkok" },
  PER: { lat: -9.2,  lng: -75.0,  capital: "Lima" },
  ITA: { lat: 42.5,  lng: 12.6,   capital: "Rome" },
  ESP: { lat: 40.5,  lng: -3.7,   capital: "Madrid" },
  NZL: { lat: -41.0, lng: 174.0,  capital: "Wellington" },
  IND: { lat: 20.6,  lng: 79.0,   capital: "New Delhi" },
  ARG: { lat: -34.6, lng: -64.2,  capital: "Buenos Aires" },
  GRC: { lat: 39.1,  lng: 21.8,   capital: "Athens" },
  TUR: { lat: 38.9,  lng: 35.2,   capital: "Ankara" },
  HRV: { lat: 45.1,  lng: 15.2,   capital: "Zagreb" },
  IDN: { lat: -0.8,  lng: 113.9,  capital: "Jakarta" },
  KEN: { lat: -0.0,  lng: 37.9,   capital: "Nairobi" },
  NPL: { lat: 28.4,  lng: 84.1,   capital: "Kathmandu" },
  CRI: { lat: 9.7,   lng: -83.8,  capital: "San José" },
  JOR: { lat: 31.3,  lng: 36.8,   capital: "Amman" },
  CZE: { lat: 49.8,  lng: 15.5,   capital: "Prague" },
  KOR: { lat: 35.9,  lng: 127.8,  capital: "Seoul" },
  NOR: { lat: 60.5,  lng: 8.5,    capital: "Oslo" },
  LKA: { lat: 7.9,   lng: 80.8,   capital: "Colombo" },
  ECU: { lat: -1.8,  lng: -78.2,  capital: "Quito" },
  LAO: { lat: 19.9,  lng: 102.5,  capital: "Vientiane" },
  ALB: { lat: 41.2,  lng: 20.2,   capital: "Tirana" },
  OMN: { lat: 21.5,  lng: 55.9,   capital: "Muscat" },
  UZB: { lat: 41.4,  lng: 64.6,   capital: "Tashkent" },
  BOL: { lat: -16.3, lng: -63.6,  capital: "Sucre" },
  PHL: { lat: 13.0,  lng: 122.0,  capital: "Manila" },
  SGP: { lat: 1.4,   lng: 103.8,  capital: "Singapore" },
  CHL: { lat: -35.7, lng: -71.5,  capital: "Santiago" },
  BRA: { lat: -14.2, lng: -51.9,  capital: "Brasília" },
  AUS: { lat: -25.3, lng: 133.8,  capital: "Canberra" },
  GHA: { lat: 7.9,   lng: -1.0,   capital: "Accra" },
  CUB: { lat: 21.5,  lng: -77.8,  capital: "Havana" },
};

/* Natural Earth 110m country name → our ISO-3 code */
const NAME_TO_CODE: Record<string, string> = {
  "Portugal": "PRT",
  "Japan": "JPN",
  "Colombia": "COL",
  "Morocco": "MAR",
  "Iceland": "ISL",
  "Vietnam": "VNM",
  "Mexico": "MEX",
  "Georgia": "GEO",
  "Thailand": "THA",
  "Peru": "PER",
  "Italy": "ITA",
  "Spain": "ESP",
  "New Zealand": "NZL",
  "India": "IND",
  "Argentina": "ARG",
  "Greece": "GRC",
  "Turkey": "TUR",
  "Croatia": "HRV",
  "Indonesia": "IDN",
  "Kenya": "KEN",
  "Nepal": "NPL",
  "Costa Rica": "CRI",
  "Jordan": "JOR",
  "Czech Republic": "CZE",
  "Czechia": "CZE",
  "South Korea": "KOR",
  "Republic of Korea": "KOR",
  "Korea": "KOR",
  "Norway": "NOR",
  "Sri Lanka": "LKA",
  "Ecuador": "ECU",
  "Laos": "LAO",
  "Lao PDR": "LAO",
  "Albania": "ALB",
  "Oman": "OMN",
  "Uzbekistan": "UZB",
  "Bolivia": "BOL",
  "Philippines": "PHL",
  "Singapore": "SGP",
  "Chile": "CHL",
  "Brazil": "BRA",
  "Australia": "AUS",
  "Ghana": "GHA",
  "Cuba": "CUB",
};

/* ── math ── */
const D2R = Math.PI / 180;

type Vec3 = { x: number; y: number; z: number };

function latLngToVec(lat: number, lng: number): Vec3 {
  const phi = (90 - lat) * D2R;
  const theta = (lng + 180) * D2R;
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

function rotate(v: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x = v.x * cy + v.z * sy;
  const z = -v.x * sy + v.z * cy;
  const y2 = v.y * cp - z * sp;
  const z2 = v.y * sp + z * cp;
  return { x, y: y2, z: z2 };
}

function project(v: Vec3, r: number, cx: number, cy: number) {
  return { x: cx + v.x * r, y: cy - v.y * r, z: v.z };
}

function arcPoints(a: Vec3, b: Vec3, n = 32): Vec3[] {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return [a, b];
  const so = Math.sin(omega);
  const pts: Vec3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const k1 = Math.sin((1 - t) * omega) / so;
    const k2 = Math.sin(t * omega) / so;
    pts.push({ x: k1 * a.x + k2 * b.x, y: k1 * a.y + k2 * b.y, z: k1 * a.z + k2 * b.z });
  }
  return pts;
}

function pointInRing(lat: number, lng: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ln1, la1] = ring[i], [ln2, la2] = ring[j];
    const intersect =
      (la1 > lat) !== (la2 > lat) &&
      lng < ((ln2 - ln1) * (lat - la1)) / ((la2 - la1) || 1e-9) + ln1;
    if (intersect) inside = !inside;
  }
  return inside;
}

function sampleScanline(
  lat: number, lngStart: number, lngEnd: number,
  yaw: number, pitch: number, r: number, cx: number, cy: number
): string | null {
  const pts: { x: number; y: number }[] = [];
  const steps = Math.max(6, Math.ceil((lngEnd - lngStart) / 1.2));
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const ln = lngStart + (lngEnd - lngStart) * t;
    const v = rotate(latLngToVec(lat, ln), yaw, pitch);
    if (v.z < 0) pts.push(project(v, r, cx, cy));
    else if (pts.length) break;
  }
  if (pts.length < 2) return null;
  return pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
}

function polygonCentroid(polys: [number, number][][]): [number, number] {
  let sx = 0, sy = 0, n = 0;
  polys.forEach((ring) => ring.forEach(([lng, lat]) => { sx += lng; sy += lat; n++; }));
  return n ? [sx / n, sy / n] : [0, 0];
}

function polygonArea(polys: [number, number][][]): number {
  let a = 0;
  polys.forEach((ring) => {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
    }
  });
  return Math.abs(a / 2);
}

/* ── topojson loader ── */
type TopoFeature = {
  name: string;
  code: string | null;
  polygons: [number, number][][];
  centroid: [number, number];
  area: number;
};

let _topoCache: { features: TopoFeature[] } | null = null;
let _topoPromise: Promise<{ features: TopoFeature[] }> | null = null;

function loadCountries(): Promise<{ features: TopoFeature[] }> {
  if (_topoCache) return Promise.resolve(_topoCache);
  if (_topoPromise) return _topoPromise;
  _topoPromise = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then((r) => r.json())
    .then((topo: Topology) => {
      const fc = feature(topo, topo.objects.countries as GeometryCollection);
      const features = (fc.features as GeoJSON.Feature[]).map((f) => {
        const polys: [number, number][][] = [];
        const geom = f.geometry as GeoJSON.Geometry;
        if (geom.type === "Polygon") {
          polys.push((geom as GeoJSON.Polygon).coordinates[0] as [number, number][]);
        } else if (geom.type === "MultiPolygon") {
          (geom as GeoJSON.MultiPolygon).coordinates.forEach((p) =>
            polys.push(p[0] as [number, number][])
          );
        }
        const name = (f.properties as Record<string, string>)?.name ?? "";
        return {
          name,
          code: NAME_TO_CODE[name] ?? null,
          polygons: polys,
          centroid: polygonCentroid(polys),
          area: polygonArea(polys),
        };
      });
      _topoCache = { features };
      return _topoCache;
    });
  return _topoPromise;
}

/* ── GlobeEntry: our Country mapped to globe format ── */
type GlobeEntry = {
  code: string;
  name: string;
  flag: string;
  region: string;
  lat: number;
  lng: number;
  match: number;
  capital: string;
  summary: string;
};

function toGlobeEntry(c: Country): GlobeEntry | null {
  const meta = COUNTRY_META[c.code];
  if (!meta) return null;
  return {
    code: c.code,
    name: c.name,
    flag: c.flag,
    region: c.continent,
    lat: meta.lat,
    lng: meta.lng,
    match: c.matchScore ?? 0,
    capital: meta.capital,
    summary: c.why ?? c.description,
  };
}

/* ── CountryCard popup ── */
function CountryCard({
  entry,
  accent,
  onClose,
  onExplore,
}: {
  entry: GlobeEntry | null;
  accent: string;
  onClose: () => void;
  onExplore: (code: string) => void;
}) {
  const [bar, setBar] = useState(0);
  useEffect(() => {
    if (!entry) return;
    setBar(0);
    const t = setTimeout(() => setBar(entry.match), 60);
    return () => clearTimeout(t);
  }, [entry?.code]);

  if (!entry) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 30,
        background: "rgba(5,8,14,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "cc-fade 220ms ease",
      }}
    >
      <style>{`
        @keyframes cc-fade { from { opacity:0 } to { opacity:1 } }
        @keyframes cc-pop  { from { opacity:0; transform:translateY(8px) scale(0.98) } to { opacity:1; transform:none } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 340,
          background: "linear-gradient(180deg,#131a26 0%,#0e131d 100%)",
          border: "1px solid #1f2a3d",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
          color: "#e8edf5",
          fontFamily: "Inter,system-ui,sans-serif",
          animation: "cc-pop 260ms cubic-bezier(.2,.8,.2,1)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 28, height: 28, borderRadius: 8,
            background: "transparent", border: "1px solid #243049",
            color: "#7a8aa4", cursor: "pointer", fontSize: 14,
            display: "grid", placeItems: "center",
          }}
        >×</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "#0a0f18", border: "1px solid #1f2a3d",
            display: "grid", placeItems: "center", fontSize: 28,
          }}>{entry.flag}</div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7a93", marginBottom: 3 }}>
              {entry.capital}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>{entry.name}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7a93" }}>Travel match</span>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 20, fontWeight: 500, color: accent }}>
              {entry.match}<span style={{ fontSize: 12, opacity: 0.7 }}>%</span>
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "#1a2334", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${bar}%`,
              background: `linear-gradient(90deg,${accent}99,${accent})`,
              boxShadow: `0 0 10px ${accent}88`,
              transition: "width 900ms cubic-bezier(.2,.8,.2,1)",
              borderRadius: 3,
            }} />
          </div>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.55, color: "#a8b3c7", margin: "0 0 18px" }}>{entry.summary}</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onExplore(entry.code)}
            style={{
              flex: 1, height: 42, borderRadius: 12,
              background: accent, border: "none", color: "#06120c",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            Explore {entry.name}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 6.5h8m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── main Globe SVG ── */
const ACCENT = "#1D9E75";

function GlobeSVG({
  size,
  entries,
  regionFilter,
  onPick,
  selectedCode,
}: {
  size: number;
  entries: GlobeEntry[];
  regionFilter: string;
  onPick: (e: GlobeEntry) => void;
  selectedCode: string | null;
}) {
  const [yaw, setYaw] = useState(2.4);
  const [pitch, setPitch] = useState(-0.25);
  const [zoom, setZoom] = useState(1);
  const draggingRef = useRef<{ x: number; y: number; yaw: number; pitch: number; moved: boolean } | null>(null);
  const [topo, setTopo] = useState<{ features: TopoFeature[] } | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let alive = true;
    loadCountries().then((d) => { if (alive) setTopo(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let id: number;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000; last = t;
      if (!draggingRef.current) setYaw((y) => y + dt * 0.08);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let id: number;
    const start = performance.now();
    const tick = () => {
      setPulse(((performance.now() - start) / 1000) % 2.4);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const visible = entries.filter(
    (c) => (regionFilter === "all" || c.region === regionFilter) && c.match >= 0
  );

  const cx = size / 2, cy = size / 2;
  const r = (size / 2) * 0.78 * zoom;

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const d = draggingRef.current;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setYaw(d.yaw + dx * 0.006);
    setPitch(Math.max(-1.2, Math.min(1.2, d.pitch + dy * 0.006)));
  };
  const onPointerUp = () => { draggingRef.current = null; };
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.7, Math.min(3.5, z * (e.deltaY > 0 ? 0.92 : 1.08))));
  };

  /* country outlines */
  const countryEls: React.ReactNode[] = [];
  const countryLabelEls: React.ReactNode[] = [];

  if (topo) {
    topo.features.forEach((feat, fi) => {
      const segments: { pts: { x: number; y: number }[]; closed: boolean }[] = [];
      feat.polygons.forEach((ring) => {
        let current: { x: number; y: number }[] = [];
        let closedFront = true;
        for (let i = 0; i < ring.length; i++) {
          const [lng, lat] = ring[i];
          const v = rotate(latLngToVec(lat, lng), yaw, pitch);
          if (v.z < 0.02) {
            current.push(project(v, r, cx, cy));
          } else {
            if (current.length > 1) segments.push({ pts: current, closed: false });
            current = [];
            closedFront = false;
          }
        }
        if (current.length > 1) segments.push({ pts: current, closed: closedFront });
      });

      const matched = feat.code ? entries.find((c) => c.code === feat.code) : null;
      const isMatched = !!matched;
      const isSelected = matched?.code === selectedCode;

      /* lines style for non-matched, outlines for matched */
      if (!isMatched) {
        const ring = feat.polygons[0];
        if (ring) {
          let minLat = 999, maxLat = -999, minLng = 999, maxLng = -999;
          ring.forEach(([ln, la]) => {
            if (la < minLat) minLat = la; if (la > maxLat) maxLat = la;
            if (ln < minLng) minLng = ln; if (ln > maxLng) maxLng = ln;
          });
          const step = Math.max(2.5, (maxLat - minLat) / 18);
          for (let la = Math.ceil(minLat / step) * step; la <= maxLat; la += step) {
            let inside = false, runStart = minLng;
            for (let ln = minLng; ln <= maxLng; ln += 1.2) {
              const hit = pointInRing(la, ln, ring);
              if (hit && !inside) { inside = true; runStart = ln; }
              else if (!hit && inside) {
                const p = sampleScanline(la, runStart, ln, yaw, pitch, r, cx, cy);
                if (p) countryEls.push(<path key={`l${fi}-${la.toFixed(1)}-${runStart.toFixed(1)}`} d={p} stroke="#1e293b" strokeOpacity="0.55" strokeWidth="0.7" fill="none" strokeLinecap="round" />);
                inside = false;
              }
            }
            if (inside) {
              const p = sampleScanline(la, runStart, maxLng, yaw, pitch, r, cx, cy);
              if (p) countryEls.push(<path key={`l${fi}-${la.toFixed(1)}-end`} d={p} stroke="#1e293b" strokeOpacity="0.55" strokeWidth="0.7" fill="none" strokeLinecap="round" />);
            }
          }
        }
        /* border */
        segments.forEach((seg, si) => {
          const d = seg.pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ") + (seg.closed ? " Z" : "");
          countryEls.push(<path key={`b${fi}-${si}`} d={d} fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.7" strokeLinejoin="round" />);
        });
      } else {
        /* matched country — filled outline */
        segments.forEach((seg, si) => {
          const d = seg.pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ") + (seg.closed ? " Z" : "");
          countryEls.push(
            <path key={`f${fi}-${si}`} d={d}
              fill={isSelected ? `${ACCENT}33` : `${ACCENT}1a`}
              stroke={`${ACCENT}cc`}
              strokeWidth={0.9}
              strokeLinejoin="round" />
          );
        });
      }

      /* country name label for large unmatched countries when zoomed */
      const [clng, clat] = feat.centroid;
      const cv = rotate(latLngToVec(clat, clng), yaw, pitch);
      if (!isMatched && cv.z < -0.05) {
        const p = project(cv, r, cx, cy);
        const importance = Math.min(1, feat.area / 600);
        const labelThreshold = 1.0 + (1 - importance) * 1.6;
        if (zoom >= labelThreshold) {
          const fade = Math.min(1, (zoom - labelThreshold) / 0.3);
          const fontSize = Math.max(7, 8 + importance * 3);
          countryLabelEls.push(
            <text key={`cl-${fi}`} x={p.x} y={p.y}
              fill="#5a6883" fontSize={fontSize}
              textAnchor="middle" fontWeight="500" letterSpacing="0.04em"
              opacity={fade * 0.85 * Math.min(1, -cv.z * 4)}
              style={{ paintOrder: "stroke", stroke: "#0d1117", strokeWidth: 2.5 }}>
              {feat.name}
            </text>
          );
        }
      }
    });
  }

  /* graticule */
  const grat: React.ReactNode[] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: { x: number; y: number }[] = [];
    for (let lng = -180; lng <= 180; lng += 6) {
      const v = rotate(latLngToVec(lat, lng), yaw, pitch);
      if (v.z < 0) pts.push(project(v, r, cx, cy));
      else if (pts.length) {
        grat.push(<path key={`gla${lat}-${lng}`} d={pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ")} stroke="#141c2c" strokeWidth="0.5" fill="none" />);
        pts.length = 0;
      }
    }
    if (pts.length) grat.push(<path key={`gla${lat}-end`} d={pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ")} stroke="#141c2c" strokeWidth="0.5" fill="none" />);
  }
  for (let lng = -150; lng <= 180; lng += 30) {
    const pts: { x: number; y: number }[] = [];
    for (let lat = -85; lat <= 85; lat += 4) {
      const v = rotate(latLngToVec(lat, lng), yaw, pitch);
      if (v.z < 0) pts.push(project(v, r, cx, cy));
      else if (pts.length) {
        grat.push(<path key={`gln${lng}-${lat}`} d={pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ")} stroke="#141c2c" strokeWidth="0.5" fill="none" />);
        pts.length = 0;
      }
    }
    if (pts.length) grat.push(<path key={`gln${lng}-end`} d={pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ")} stroke="#141c2c" strokeWidth="0.5" fill="none" />);
  }

  /* arcs between nearby matched countries */
  const arcEls: React.ReactNode[] = [];
  if (visible.length > 1) {
    const pairs: { key: string; i: number; j: number }[] = [];
    for (let i = 0; i < visible.length; i++) {
      const dists = visible.map((c, j) => {
        if (i === j) return { j, d: Infinity };
        const a = latLngToVec(visible[i].lat, visible[i].lng);
        const b = latLngToVec(c.lat, c.lng);
        const dot = a.x * b.x + a.y * b.y + a.z * b.z;
        return { j, d: Math.acos(Math.max(-1, Math.min(1, dot))) };
      }).sort((a, b) => a.d - b.d).slice(0, 2);
      dists.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!pairs.find((p) => p.key === key)) pairs.push({ key, i, j });
      });
    }
    pairs.forEach(({ key, i, j }) => {
      const a = latLngToVec(visible[i].lat, visible[i].lng);
      const b = latLngToVec(visible[j].lat, visible[j].lng);
      const pts = arcPoints(a, b, 40).map((p) => ({ x: p.x * 1.18, y: p.y * 1.18, z: p.z * 1.18 }));
      const rotated = pts.map((p) => rotate(p, yaw, pitch));
      let d = "", pen = false;
      rotated.forEach((p) => {
        const proj = project(p, r, cx, cy);
        if (p.z < 0.05) {
          d += (pen ? "L" : "M") + proj.x.toFixed(1) + " " + proj.y.toFixed(1) + " ";
          pen = true;
        } else pen = false;
      });
      if (d) arcEls.push(<path key={`arc-${key}`} d={d} stroke={ACCENT} strokeOpacity="0.28" strokeWidth="0.8" fill="none" />);
    });
  }

  /* dots + labels */
  const dotEls: React.ReactNode[] = [];
  const labelEls: React.ReactNode[] = [];

  visible.forEach((c) => {
    const v = rotate(latLngToVec(c.lat, c.lng), yaw, pitch);
    if (v.z >= 0.15) return;
    const p = project(v, r, cx, cy);
    const matchT = Math.max(0, (c.match - 60) / 40);
    const rad = 3 + matchT * 5;
    const pulseT = ((pulse + (c.code.charCodeAt(0) % 7) / 7) % 2.4) / 2.4;
    const pulseR = rad + pulseT * 22;
    const pulseO = (1 - pulseT) * 0.55;
    const sel = c.code === selectedCode;
    const fade = Math.max(0, Math.min(1, (-v.z - 0.05) * 2));

    dotEls.push(
      <g key={`d-${c.code}`} style={{ cursor: "pointer" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (!draggingRef.current?.moved) onPick(c);
        }}>
        <circle cx={p.x} cy={p.y} r={pulseR} fill={ACCENT} opacity={pulseO * fade * 0.35} />
        <circle cx={p.x} cy={p.y} r={rad + 2} fill={ACCENT} opacity={0.16 * fade} />
        <circle cx={p.x} cy={p.y} r={rad} fill={ACCENT} opacity={fade} />
        <circle cx={p.x} cy={p.y} r={rad - 1.5} fill="#0d1117" opacity={fade * 0.4} />
        <circle cx={p.x} cy={p.y} r={rad * 0.55} fill="#eafff5" opacity={fade} />
        {sel && <circle cx={p.x} cy={p.y} r={rad + 8} stroke={ACCENT} strokeWidth="1.2" fill="none" opacity={0.9} />}
        <circle cx={p.x} cy={p.y} r={Math.max(rad + 8, 16)} fill="transparent" />
      </g>
    );

    const labelX = p.x + rad + 8;
    const labelY = p.y + 3;
    labelEls.push(
      <g key={`l-${c.code}`} opacity={fade} pointerEvents="none">
        <text x={labelX} y={labelY} fill="#e8edf5" fontSize="11" fontWeight="500" letterSpacing="0.02em"
          style={{ paintOrder: "stroke", stroke: "#0d1117", strokeWidth: 3 }}>{c.name}</text>
        <text x={labelX} y={labelY + 12} fill={ACCENT} fontSize="10" fontWeight="600"
          style={{ paintOrder: "stroke", stroke: "#0d1117", strokeWidth: 3 }}>{c.match}%</text>
      </g>
    );
  });

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ touchAction: "none", userSelect: "none", display: "block" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <defs>
        <radialGradient id="globe-fill" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#11192a" />
          <stop offset="60%" stopColor="#0c121f" />
          <stop offset="100%" stopColor="#080b13" />
        </radialGradient>
        <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor={ACCENT} stopOpacity="0" />
          <stop offset="92%" stopColor={ACCENT} stopOpacity="0.16" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="globe-shade" cx="65%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
        <clipPath id={`globe-clip-${size}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      <circle cx={cx} cy={cy} r={r * 1.16} fill="url(#globe-glow)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#globe-fill)" />

      <g clipPath={`url(#globe-clip-${size})`}>
        <g>{grat}</g>
        <g>{countryEls}</g>
        <g>{arcEls}</g>
        <g pointerEvents="none">{countryLabelEls}</g>
      </g>

      <circle cx={cx} cy={cy} r={r} fill="url(#globe-shade)" pointerEvents="none" />
      <g>{dotEls}</g>
      <g pointerEvents="none">{labelEls}</g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ACCENT} strokeWidth="0.6" opacity="0.3" />

      {!topo && (
        <text x={cx} y={cy} fill="#3a4660" fontSize="11" textAnchor="middle" letterSpacing="0.16em">
          LOADING GLOBE…
        </text>
      )}
    </svg>
  );
}

/* ── public component ── */
export default function GlobeMap({
  countries,
  regionFilter = "all",
  onSelect,
}: {
  countries: Country[];
  regionFilter?: string;
  onSelect?: (c: Country) => void;
}) {
  const [selected, setSelected] = useState<GlobeEntry | null>(null);

  const entries: GlobeEntry[] = countries
    .map(toGlobeEntry)
    .filter((e): e is GlobeEntry => e !== null);

  function handlePick(e: GlobeEntry) {
    setSelected(e);
  }

  function handleExplore(code: string) {
    const original = countries.find((c) => c.code === code);
    if (original) {
      onSelect?.(original);
      // navigate to country detail page
      window.location.href = `/country/${code}`;
    }
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "#0d1117", position: "relative", display: "grid", placeItems: "center" }}>
      {/* hint */}
      <div style={{
        position: "absolute", bottom: 14, left: 16, zIndex: 10,
        display: "flex", alignItems: "center", gap: 6,
        fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#4a5568",
        letterSpacing: "0.08em",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />
        drag · scroll · tap to explore
      </div>

      <GlobeSVG
        size={460}
        entries={entries}
        regionFilter={regionFilter}
        onPick={handlePick}
        selectedCode={selected?.code ?? null}
      />

      <CountryCard
        entry={selected}
        accent={ACCENT}
        onClose={() => setSelected(null)}
        onExplore={handleExplore}
      />
    </div>
  );
}
