import type { City } from "./types";

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function distanceKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const dLat = toRadians(bLat - aLat);
  const dLon = toRadians(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(aLat)) *
      Math.cos(toRadians(bLat)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Case- and ё-insensitive, matching how the backend indexes city names. */
function norm(name: string): string {
  return name.trim().toLowerCase().replace(/ё/g, "е");
}

export type CityIndex = Map<string, City>;

export function indexCities(cities: City[]): CityIndex {
  return new Map(cities.map((city) => [norm(city.name), city]));
}

export function findCity(index: CityIndex, name: string): City | undefined {
  return name ? index.get(norm(name)) : undefined;
}

/** Cities whose name starts with, then merely contains, the typed text. */
export function suggestCities(cities: City[], input: string, limit = 6): City[] {
  const needle = norm(input);
  if (!needle) return cities.slice(0, limit);

  const starts: City[] = [];
  const contains: City[] = [];
  for (const city of cities) {
    const name = norm(city.name);
    if (name.startsWith(needle)) starts.push(city);
    else if (name.includes(needle)) contains.push(city);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
