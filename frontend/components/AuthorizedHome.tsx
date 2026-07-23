import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Nav from "@/components/Nav";
import TopListings from "@/components/home/TopListings";
import type { City } from "@/lib/types";

interface Props {
  cities: City[];
}

export default function AuthorizedHome({ cities }: Props) {
  return (
    <>
      <Nav />
      <main>
        <Hero cities={cities} />
        <TopListings />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
