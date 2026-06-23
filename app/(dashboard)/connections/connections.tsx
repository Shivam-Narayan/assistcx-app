"use client";

import { useConnections } from "@/app/(dashboard)/connections/hook/useConnections";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { canDelete, canEdit } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import ProvidersList from "./components/providers-list";
import ConnectionsHeader from "./header";
import { LoadingCards } from "./loading";

export default function ConnectionsPage() {
  const connections = useConnections();
  const isHeaderStuck = useHeaderStuck();
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const canEditConnections = permissions
    ? canEdit(permissions, "connections")
    : false;
  const canDeleteConnections = permissions
    ? canDelete(permissions, "connections")
    : false;

  if (connections.isListLoading) {
    return <LoadingCards />;
  }
  return (
    <div className="flex flex-col py-6 gap-3">
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isHeaderStuck ? "border-b py-4" : ""
        }`}
      >
        <ConnectionsHeader
          searchText={connections.searchText}
          onSearchChange={connections.setSearchText}
        />
      </div>

      <div className="px-6">
        <ProvidersList
          providerList={connections.searchList}
          isListLoading={connections.isListLoading}
          connectionActions={connections}
        />
      </div>
    </div>
  );
}
