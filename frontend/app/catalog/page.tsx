import Catalog from "@/components/catalog/Catalog";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { fetchCities, fetchListings } from "@/lib/api";
import { filtersFromParams } from "@/lib/catalog-url";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [listings, cities, params] = await Promise.all([
    fetchListings(),
    fetchCities(),
    searchParams,
  ]);

  return (
    <>
      <Nav />
      <Catalog
        listings={listings}
        cities={cities}
        initialFilters={filtersFromParams(params)}
      />
      <Footer />
    </>
  );
}
