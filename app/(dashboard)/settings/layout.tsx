"use client";

import { ReactNode, Suspense } from "react";
import SettingMenus from "./setting-menus";
import Loading from "./loading";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* <Loading /> */}
      <Suspense fallback={<Loading />}>
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 h-screen">
            <div className="md:col-span-1 lg:col-span-1 border-r border-r-inherit">
              <SettingMenus />
            </div>
            <div className="md:col-span-5 lg:col-span-5 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
}
