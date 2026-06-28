import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MOODS, type MemoryTicket } from "../types";

interface Props {
  memories: MemoryTicket[];
  onOpenMemory: (m: MemoryTicket) => void;
  onClose: () => void;
}

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createCustomIcon(moodColor: string, isCluster = false) {
  const size = isCluster ? 36 : 28;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${isCluster ? "#8a4fff" : moodColor};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:${isCluster ? 14 : 12}px;
      color:white;
      font-weight:bold;
      cursor:pointer;
      transition:transform 0.2s;
    ">${isCluster ? "" : "📍"}</div>`,
  });
}

export function MemoryMap({ memories, onOpenMemory, onClose }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryTicket | null>(null);

  // Filter memories with coordinates
  const geotagged = useMemo(
    () => memories.filter(m => m.latitude != null && m.longitude != null),
    [memories],
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);    // Update markers when memories change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || geotagged.length === 0) return;

    // Clear old markers
    if (markersLayer.current) {
      map.removeLayer(markersLayer.current);
    }

    const layer = L.layerGroup();
    const bounds: [number, number][] = [];

    geotagged.forEach((m) => {
      const moodMeta = MOODS.find(x => x.id === m.mood);
      const color = moodMeta?.color ?? "#8a4fff";
      const lat = m.latitude!;
      const lng = m.longitude!;

      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(color),
      });

      marker.bindTooltip(m.title, {
        direction: "top",
        offset: L.point(0, -14),
        className: "memory-tooltip",
      });

      marker.on("click", () => {
        setSelectedMemory(m);
      });

      marker.addTo(layer);
      bounds.push([lat, lng]);
    });

    // Reset selection on data change
    setSelectedMemory(null);

    layer.addTo(map);
    markersLayer.current = layer;

    // Fit bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 12 });
    }
  }, [geotagged]);

  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in flex-col bg-[#09090f]">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 bg-[#09090f]/90 px-4 py-3 backdrop-blur-xl">
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.07]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Map</div>
          <div className="-mt-0.5 text-base font-bold">Memory Map</div>
        </div>
        <div className="grid h-9 w-9 place-items-center">
          <span className="text-[11px] text-white/50">{geotagged.length}</span>
        </div>
      </header>

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full" />

      {/* Bottom card for selected memory */}
      {selectedMemory && (
        <div className="absolute bottom-4 left-4 right-4 z-20 animate-fade-up">
          <button
            onClick={() => { onOpenMemory(selectedMemory); setSelectedMemory(null); }}
            className="glass w-full rounded-2xl p-4 text-left transition hover:bg-white/[0.06] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-none overflow-hidden rounded-xl">
                <img src={selectedMemory.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold line-clamp-1">{selectedMemory.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/55">
                  <span>📍 {selectedMemory.location}</span>
                  <span>·</span>
                  <span>{new Date(selectedMemory.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>
        </div>
      )}

      {/* Empty state */}
      {geotagged.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-5xl mb-3">🗺️</div>
          <h3 className="text-base font-bold">No map data</h3>
          <p className="mt-1 text-[12px] text-white/55 max-w-xs text-center">
            Memories need coordinates to appear on the map. Add a location to your tickets.
          </p>
        </div>
      )}


    </div>
  );
}
