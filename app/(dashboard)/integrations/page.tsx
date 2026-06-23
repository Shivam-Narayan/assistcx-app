import React, { Suspense } from "react";
import { Metadata } from "next";
import Loading from "./loading";
import IntegrationsPage from "./Integrations";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Integrations",
};

const IntegrationDashboard = () => {
  return (
    <Suspense fallback={<Loading />}>
      <IntegrationsPage />
    </Suspense>
  );
};

export default IntegrationDashboard;
