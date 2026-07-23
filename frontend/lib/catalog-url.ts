import { EMPTY_FILTERS, type CatalogFilters } from "./listing-filters";

/**
 * Catalog filters <-> query string.
 *
 * The home page's search bar and the catalog's own panel drive the same state,
 * so the URL is the handover point between them — and a filtered search stays
 * shareable and survives a reload.
 */

export function filtersToQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  const put = (key: string, value: string) => {
    if (value) params.set(key, value);
  };

  put("q", filters.query);
  put("category", filters.categories.join(","));
  put("interests", filters.interests.join(","));
  put("to", filters.destinations.join(","));
  put("from", filters.origin);
  if (filters.radius > 0) params.set("radius", String(filters.radius));
  put("start", filters.from);
  put("end", filters.to);
  put("kind", filters.authorKinds.join(","));
  put("who", filters.seeking.join(","));
  put("trip", filters.tripTypes.join(","));
  put("money", filters.finance);
  put("ageMin", filters.ageMin);
  put("ageMax", filters.ageMax);
  if (filters.withPhoto) params.set("photo", "1");
  if (filters.travellingNow) params.set("now", "1");

  return params.toString();
}

/** Values Next hands a page: a string, a repeated string, or nothing. */
type ParamValue = string | string[] | undefined;

function one(value: ParamValue): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function list(value: ParamValue): string[] {
  return one(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function filtersFromParams(
  params: Record<string, ParamValue>,
): CatalogFilters {
  return {
    ...EMPTY_FILTERS,
    query: one(params.q),
    categories: list(params.category),
    interests: list(params.interests),
    destinations: list(params.to),
    origin: one(params.from),
    radius: Math.max(0, Number(one(params.radius)) || 0),
    from: one(params.start),
    to: one(params.end),
    authorKinds: list(params.kind),
    seeking: list(params.who),
    tripTypes: list(params.trip),
    finance: one(params.money),
    ageMin: one(params.ageMin),
    ageMax: one(params.ageMax),
    withPhoto: one(params.photo) === "1",
    travellingNow: one(params.now) === "1",
  };
}
