import Main from "@/app/assistant/main";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Assistant",
  description:
    "AI-powered email assistant to help you manage and respond to emails efficiently.",
};
export default function Home() {
  return <Main />;
}
