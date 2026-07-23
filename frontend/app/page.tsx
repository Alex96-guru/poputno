import HomeGate from "@/components/HomeGate";
import { fetchCities } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cities = await fetchCities();

  return <HomeGate cities={cities} />;
}
