import HomeGate from "@/components/HomeGate";
import { fetchPersons, fetchPopularDestinations } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [persons, destinations] = await Promise.all([
    fetchPersons(),
    fetchPopularDestinations(),
  ]);

  return <HomeGate persons={persons} destinations={destinations} />;
}