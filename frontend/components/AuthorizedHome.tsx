import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Listings from "@/components/Listings";
import Nav from "@/components/Nav";
import PopularPills from "@/components/PopularPills";
import type { Person } from "@/lib/types";

interface Props {
  persons: Person[];
  destinations: string[];
}

export default function AuthorizedHome({ persons, destinations }: Props) {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PopularPills destinations={destinations} />
        <Listings persons={persons} />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}