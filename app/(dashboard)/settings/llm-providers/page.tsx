import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import LlmProvidersPage from "./llm-providers-page";

export const metadata: Metadata = {
  title: "LLM Providers",
  description: "Manage LLM provider connections and model configurations",
};

const LlmProvidersRoute = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <LlmProvidersPage />
    </Suspense>
  );
};

export default LlmProvidersRoute;
