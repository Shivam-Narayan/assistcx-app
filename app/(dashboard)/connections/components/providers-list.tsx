import { EmptyState } from "@/components/empty-state/empty-state";
import { useConnections } from "../hook/useConnections";
import ActiveProviderCard from "./active-provider-card";
import AvailableProviderCard from "./available-provide-card";
import ProviderDetailsSheet from "./provider-details-sheet";

type ProvidersListProps = {
  providerList: any;
  isListLoading: boolean;
  connectionActions: ReturnType<typeof useConnections>;
};

const ProvidersList = ({
  providerList,
  isListLoading,
  connectionActions,
}: ProvidersListProps) => {
  const {
    openDetailSheet,
    setOpenDetailSheet,
    providerDetails,
    detailsLoading,
    handleDeleteConnection,
    isDeleteLoading,
    handleTestConnection,
    isTestLoading,
    handleSubmit,
    selectedItem,
    setSelectedItem,
    setMode,
  } = connectionActions;

  const totalResults =
    providerList.active.length + providerList.available.length;

  if (totalResults === 0) {
    return (
      <EmptyState
        variant="fullpage"
        title="No Providers Found"
        description="Try a different search term."
      />
    );
  }
  return (
    <>
      <div className="flex flex-col gap-4 h-fit">
        {/* Active Providers */}
        {providerList.active.length > 0 && (
          <>
            <h3>Active Providers</h3>
            <div className="grid gap-5 2xl:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {providerList.active.map((data: any) => (
                <ActiveProviderCard
                  key={data.key}
                  provider={data}
                  connectionActions={connectionActions}
                />
              ))}
            </div>
          </>
        )}
        {/* Available Providers */}
        {providerList.available.length > 0 && (
          <>
            <h3>Available Providers</h3>
            <div className="grid gap-5 2xl:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {providerList.available?.map((data: any) => (
                <AvailableProviderCard
                  key={data.key}
                  provider={data}
                  connectionActions={connectionActions}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ProviderDetailsSheet
        open={openDetailSheet}
        onOpenChange={setOpenDetailSheet}
        data={providerDetails}
        onDeleteConnection={handleDeleteConnection}
        isDeleteLoading={isDeleteLoading}
        detailsLoading={detailsLoading}
        onTestConnection={handleTestConnection}
        isTestLoading={isTestLoading}
        handleSubmit={handleSubmit}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        setMode={setMode}
      />
    </>
  );
};

export default ProvidersList;
