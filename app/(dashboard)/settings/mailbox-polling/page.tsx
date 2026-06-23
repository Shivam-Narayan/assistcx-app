import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import MailboxPolingMainPage from "./mailbox-page";


export const metadata: Metadata = {
  title: "Mailbox Polling",
  description: "",
};

export default async function MailboxPolingPage() {
  
  return (
    <Suspense fallback={<Loading />}>
      <MailboxPolingMainPage />
    </Suspense>
  );
}
