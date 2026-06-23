import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import ApiKeyPage from "./api-key-page";

export const metadata: Metadata = {
  title: "API Keys",
  description: "",
};

const ManageApiKeyPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <ApiKeyPage />
    </Suspense>
  );
};

export default ManageApiKeyPage;
