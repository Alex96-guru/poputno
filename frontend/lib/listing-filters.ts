import { rangesOverlap } from "./dates";
import { distanceKm, findCity, type CityIndex } from "./geo";
import type { Listing } from "./types";

export interface CatalogFilters {
  categories: string[];
  /** Matched against the author's profile interests. */
  interests: string[];
  /** Free text matched against name, description, origin and destinations. */
  query: string;
  destinations: string[];
  /** Matched against the listing's "откуда едем" city. */
  origin: string;
  /** Kilometres around `origin`. 0 means "this city only, by name". */
  radius: number;
  from: string;
  to: string;
  authorKinds: string[];
  seeking: string[];
  tripTypes: string[];
  finance: string;
  /** Kept as strings so an empty input stays empty rather than becoming 0. */
  ageMin: string;
  ageMax: string;
  withPhoto: boolean;
  /** Only people whose trip is under way right now. */
  travellingNow: boolean;
}

export type SortKey = "recent" | "rating";

export const EMPTY_FILTERS: CatalogFilters = {
  categories: [],
  interests: [],
  query: "",
  destinations: [],
  origin: "",
  radius: 0,
  from: "",
  to: "",
  authorKinds: [],
  seeking: [],
  tripTypes: [],
  finance: "",
  ageMin: "",
  ageMax: "",
  withPhoto: false,
  travellingNow: false,
};

/** Case- and ё-insensitive, so "Гёте" and "Гете" match either way round. */
function norm(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").trim();
}

function matchesText(listing: Listing, query: string): boolean {
  if (!query) return true;
  const needle = norm(query);
  return [
    listing.author.name,
    listing.description,
    listing.origin,
    ...listing.destinations,
  ].some((value) => norm(value).includes(needle));
}

/** An empty selection means "no preference", not "match nothing". */
function matchesAny(value: string, selected: string[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

function matchesInterests(listing: Listing, selected: string[]): boolean {
  return (
    selected.length === 0 ||
    listing.author.interests.some((i) => selected.includes(i))
  );
}

function matchesDestinations(listing: Listing, selected: string[]): boolean {
  return (
    selected.length === 0 ||
    listing.destinations.some((d) => selected.includes(d))
  );
}

function matchesAge(listing: Listing, min: string, max: string): boolean {
  if (!min && !max) return true;
  const { age } = listing.author;
  // An unknown age cannot be proven to fit, so it drops out of a bounded search.
  if (age === null) return false;
  if (min && age < Number(min)) return false;
  if (max && age > Number(max)) return false;
  return true;
}

/**
 * Origin match. With a radius and a known city on both sides it is measured on
 * the map; otherwise it falls back to matching the city name, so a listing from
 * a town missing from the city table is never silently dropped.
 */
function matchesOrigin(
  listing: Listing,
  filters: CatalogFilters,
  cities?: CityIndex,
): boolean {
  if (!filters.origin) return true;

  const from = cities && findCity(cities, filters.origin);
  const canMeasure =
    filters.radius > 0 &&
    from !== undefined &&
    listing.originLat !== null &&
    listing.originLon !== null;

  if (canMeasure) {
    return (
      distanceKm(from.lat, from.lon, listing.originLat!, listing.originLon!) <=
      filters.radius
    );
  }
  return norm(listing.origin).includes(norm(filters.origin));
}

function isTravellingNow(listing: Listing, today: string): boolean {
  if (!listing.startDate && !listing.endDate) return false;
  const start = listing.startDate || "0000-01-01";
  const end = listing.endDate || "9999-12-31";
  return start <= today && today <= end;
}

export function applyFilters(
  listings: Listing[],
  filters: CatalogFilters,
  options: { cities?: CityIndex; today?: string } = {},
): Listing[] {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  return listings.filter(
    (listing) =>
      matchesText(listing, filters.query) &&
      matchesAny(listing.category, filters.categories) &&
      matchesInterests(listing, filters.interests) &&
      matchesDestinations(listing, filters.destinations) &&
      matchesOrigin(listing, filters, options.cities) &&
      matchesAny(listing.authorKind, filters.authorKinds) &&
      matchesAny(listing.seeking, filters.seeking) &&
      matchesAny(listing.tripType, filters.tripTypes) &&
      (!filters.finance || listing.finance === filters.finance) &&
      matchesAge(listing, filters.ageMin, filters.ageMax) &&
      (!filters.withPhoto || listing.author.avatarUrl !== "") &&
      (!filters.travellingNow || isTravellingNow(listing, today)) &&
      rangesOverlap(listing.startDate, listing.endDate, filters.from, filters.to),
  );
}

export function sortListings(listings: Listing[], key: SortKey): Listing[] {
  const sorted = [...listings];
  if (key === "rating") {
    sorted.sort((a, b) => b.author.rating - a.author.rating);
  } else {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return sorted;
}

export function hasAnyFilter(filters: CatalogFilters): boolean {
  return (
    filters.query !== "" ||
    filters.origin !== "" ||
    filters.radius > 0 ||
    filters.from !== "" ||
    filters.to !== "" ||
    filters.finance !== "" ||
    filters.ageMin !== "" ||
    filters.ageMax !== "" ||
    filters.withPhoto ||
    filters.travellingNow ||
    filters.categories.length > 0 ||
    filters.interests.length > 0 ||
    filters.destinations.length > 0 ||
    filters.authorKinds.length > 0 ||
    filters.seeking.length > 0 ||
    filters.tripTypes.length > 0
  );
}

/** "1 попутчик", "2 попутчика", "5 попутчиков". */
export function pluralTravellers(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} попутчик`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} попутчика`;
  return `${n} попутчиков`;
}
