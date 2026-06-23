import { Metadata } from "next";
import { Suspense } from "react";
import Loader from "./loader";
import ProfileCard from "./profile-card";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile View",
};
export default function Component() {
  return (
    <Suspense fallback={<Loader />}>
      <ProfileCard />
    </Suspense>
  );
}
