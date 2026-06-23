import Loader from "@/app/(dashboard)/profile/loader";
import ProfileCard from "@/app/(dashboard)/profile/profile-card";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile View",
};

export default function Profile() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="mt-12 lg:mt-0">
        <ProfileCard />
      </div>
    </Suspense>
  );
}
