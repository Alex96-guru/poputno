import Catalog from "@/components/catalog/Catalog";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { fetchPersons } from "@/lib/api";

export default async function CatalogPage() {
  const persons = await fetchPersons();

  return (
    <>
      <Nav />
      <Catalog persons={persons} />
      <Footer />
    </>
  );
}
