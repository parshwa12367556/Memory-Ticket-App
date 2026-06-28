/**
 * Lightweight geocoding utility using the free Nominatim (OpenStreetMap) API.
 * No API key required — respects usage policy with a custom User-Agent.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Geocode a location string to coordinates.
 * Returns null if no results found.
 */
export async function geocodeLocation(location: string): Promise<GeocodeResult | null> {
  if (!location.trim()) return null;

  try {
    const params = new URLSearchParams({
      q: location,
      format: "json",
      limit: "1",
    });

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "MemoryTicketApp/1.0 (memory-ticket-app)",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch {
    return null;
  }
}

/**
 * Batch geocode multiple locations, skipping cached/empty ones.
 * Returns a Map of location string -> GeocodeResult.
 */
export async function batchGeocode(
  locations: string[],
  existing: Map<string, GeocodeResult>,
): Promise<Map<string, GeocodeResult>> {
  const results = new Map(existing);
  const uncached = [...new Set(locations)].filter(l => l && !results.has(l));

  // Process one at a time with a small delay to respect rate limits
  for (const loc of uncached) {
    const geo = await geocodeLocation(loc);
    if (geo) results.set(loc, geo);
    // Nominatim rate limit: 1 request per second
    await new Promise(r => setTimeout(r, 1100));
  }

  return results;
}
