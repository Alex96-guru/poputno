import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import ProfilePage from "@/components/profile/ProfilePage";
import { fetchPersons } from "@/lib/api";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persons = await fetchPersons();
  const person = persons.find((p) => p.id === id);

  if (!person) notFound();

  const listings = persons.filter((p) => p.id !== id).slice(0, 3);

  return (
    <>
      <Nav />
      <ProfilePage person={person} listings={listings} />
      <Footer />
    </>
  );
}
