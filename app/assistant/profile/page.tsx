import Profile from "@/app/assistant/profile/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile View",
};
export default function ProfilePage() {
  return <Profile />;
}
