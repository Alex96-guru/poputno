import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ListingDetail from "@/components/listing/ListingDetail";
import Nav from "@/components/Nav";
import { fetchListing, fetchUserListings } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await fetchListing(id);

  if (!listing) notFound();

  const others = (await fetchUserListings(listing.author.id))
    .filter((l) => l.id !== listing.id)
    .slice(0, 3);

  return (
    <>
      <Nav />
      <ListingDetail listing={listing} others={others} />
      <Footer />
    </>
  );
}
