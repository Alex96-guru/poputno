import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ListingDetail from "@/components/listing/ListingDetail";
import Nav from "@/components/Nav";
import { fetchPersons } from "@/lib/api";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persons = await fetchPersons();
  const person = persons.find((p) => p.id === id);

  if (!person) notFound();

  const others = persons.filter((p) => p.id !== id).slice(0, 3);

  return (
    <>
      <Nav />
      <ListingDetail person={person} others={others} />
      <Footer />
    </>
  );
}
