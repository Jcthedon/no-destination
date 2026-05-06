"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Country } from "@/lib/data";

// Country coordinates [lat, lng]
const COORDS: Record<string, [number, number]> = {
  PRT: [39.4, -8.2],
  JPN: [36.2, 138.3],
  COL: [4.6, -74.1],
  MAR: [31.8, -7.1],
  ISL: [64.9, -19.0],
  VNM: [14.1, 108.3],
  MEX: [23.6, -102.6],
  GEO: [42.3, 43.4],
  THA: [15.9, 100.9],
  PER: [-9.2, -75.0],
  ITA: [41.9, 12.6],
  ESP: [40.5, -3.7],
  NZL: [-40.9, 174.9],
  IND: [20.6, 78.9],
  ARG: [-38.4, -63.6],
  GRC: [39.1, 21.8],
  TUR: [38.9, 35.2],
  HRV: [45.1, 15.2],
  IDN: [-2.5, 118.0],
  KEN: [0.0, 37.9],
  NPL: [28.4, 84.1],
  CRI: [9.7, -83.8],
  JOR: [30.6, 36.2],
  CZE: [49.8, 15.5],
  KOR: [36.5, 127.8],
  NOR: [60.5, 8.5],
  LKA: [7.9, 80.8],
  ECU: [-1.8, -78.2],
  LAO: [18.2, 103.9],
  ALB: [41.2, 20.2],
  OMN: [21.5, 55.9],
  UZB: [41.4, 64.6],
  BOL: [-16.3, -63.6],
  PHL: [12.9, 121.8],
  SGP: [1.4, 103.8],
  CHL: [-35.7, -71.5],
  BRA: [-14.2, -51.9],
  AUS: [-25.3, 133.8],
  GHA: [7.9, -1.0],
  CUB: [21.5, -79.5],
};

// Smooth 7-step gradient: deep green → lime → yellow → orange → red → gray
function matchColor(score: number): string {
  if (score >= 92) return "#059669"; // emerald
  if (score >= 84) return "#1D9E75"; // brand green
  if (score >= 76) return "#65a30d"; // lime green
  if (score >= 68) return "#ca8a04"; // amber
  if (score >= 60) return "#ea580c"; // orange
  if (score >= 50) return "#dc2626"; // red
  return "#9ca3af";                  // gray
}

function markerSize(score: number): number {
  // Higher match = slightly larger pin (range 36–50px)
  return Math.round(36 + (score / 100) * 14);
}

function makeIcon(score: number, flag: string) {
  const color = matchColor(score);
  const size = markerSize(score);
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2.5px solid white;
      border-radius:50%;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      box-shadow:0 2px 12px rgba(0,0,0,0.28);
      cursor:pointer;
      font-family:system-ui,sans-serif;
      transition:transform 0.15s;
    ">
      <span style="font-size:${Math.round(size * 0.34)}px;line-height:1">${flag}</span>
      <span style="font-size:${Math.round(size * 0.2)}px;font-weight:800;color:white;line-height:1.3">${score}%</span>
    </div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
}

type Props = {
  countries: Country[];
  onSelect?: (country: Country) => void;
};

export default function InteractiveMap({ countries, onSelect }: Props) {
  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.13) !important;
          padding: 0 !important;
          overflow: hidden;
          border: 1px solid #f3f4f6;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          font-size: 16px !important;
          color: #374151 !important;
        }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(255,255,255,0.7) !important;
        }
      `}</style>
      <MapContainer
        center={[20, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        style={{ height: "100%", width: "100%", borderRadius: "16px", zIndex: 0 }}
        scrollWheelZoom={true}
      >
        {/* CartoDB Voyager — English labels, clean modern style */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />
        {countries.map((country) => {
          const coords = COORDS[country.code];
          if (!coords || !country.matchScore) return null;
          const score = country.matchScore;
          const color = matchColor(score);
          return (
            <Marker
              key={country.code}
              position={coords}
              icon={makeIcon(score, country.flag)}
              eventHandlers={{ click: () => onSelect?.(country) }}
            >
              <Popup>
                <div style={{ width: 190, padding: "14px 16px" }}>
                  <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 2px", color: "#111827" }}>
                    {country.flag} {country.name}
                  </p>
                  <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 10px" }}>{country.region}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99 }}>
                      <div style={{ height: 6, width: `${score}%`, background: color, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color }}>{score}%</span>
                  </div>
                  <a
                    href={`/country/${country.code}`}
                    style={{
                      display: "block", textAlign: "center",
                      padding: "7px 0",
                      background: "#1D9E75", color: "white",
                      borderRadius: 10, fontSize: 13,
                      fontWeight: 700, textDecoration: "none",
                    }}
                  >
                    Explore →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
