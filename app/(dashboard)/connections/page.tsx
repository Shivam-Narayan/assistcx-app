import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import ConnectionsPage from "./connections";

export const metadata: Metadata = {
  title: "Connections",
  description: "Connections",
};

const ConnectionsDashboard = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ConnectionsPage />
    </Suspense>
  );
};

export default ConnectionsDashboard;
