import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import ProfilePage from "@/components/profile/ProfilePage";
import { fetchPublicUser, fetchUserListings } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, listings] = await Promise.all([
    fetchPublicUser(id),
    fetchUserListings(id),
  ]);

  if (!user) notFound();

  return (
    <>
      <Nav />
      <ProfilePage user={user} listings={listings} />
      <Footer />
    </>
  );
}
