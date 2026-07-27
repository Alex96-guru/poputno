import { Suspense } from "react";
import Messenger from "@/components/messages/Messenger";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div className="h-[calc(100vh-78px)] bg-bg" />}>
        <Messenger />
      </Suspense>
    </>
  );
}
