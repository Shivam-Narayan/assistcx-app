import { Metadata } from "next";

import { RefreshButton } from "@/components/refresh-button";
import { Suspense } from "react";
import { DashboardActions } from "./dashboard";
import { DashboardFilter } from "./dashboard-filter";
import Loading from "./loading";
import { DateRangeBlock } from "./component/date-range-block";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col">
        <div className="flex-1 space-y-5 px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between py-2">
            <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight">
              Dashboard
            </h2>
            <div className="flex gap-2 items-start sm:items-center">
              <DateRangeBlock />
              <DashboardFilter />
              <RefreshButton />
            </div>
          </div>
          <DashboardActions />
        </div>
      </div>
    </Suspense>
  );
}
