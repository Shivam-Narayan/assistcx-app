import { GitBranch, Loader2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import ConditionalTooltip from "../conditional-tooltip-renderer";

const VersionDetailsSheet = lazy(() => import("./version-details-sheet"));

interface VersionHistoryProps {
  currentJson: any;
  entityType: string;
  entityId: string;
  isRestoreVersionAllowed?: boolean;
  handleRestoreVersionData: any;
  className?: string;
  setCurrentSelectedVersion?: React.Dispatch<React.SetStateAction<any>>;
}

const VersionHistory = ({
  currentJson,
  entityType,
  entityId,
  isRestoreVersionAllowed = true,
  handleRestoreVersionData,
  className,
  setCurrentSelectedVersion,
}: VersionHistoryProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleToggleSheet = () => {
    setSheetOpen(!sheetOpen);
  };

  return (
    <>
      <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
        <ConditionalTooltip
          content="Version History"
          alwaysShow={true}
          showArrow={true}
          align="center"
          side="bottom"
        >
          <div
            onClick={() => setSheetOpen(true)}
            className={
              className || "p-2 rounded-md cursor-pointer hover:bg-secondary"
            }
          >
            <GitBranch size={20} />
          </div>
        </ConditionalTooltip>

        <VersionDetailsSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          currentJson={currentJson}
          entityType={entityType}
          entityId={entityId}
          handleToggleSheet={handleToggleSheet}
          isRestoreVersionAllowed={isRestoreVersionAllowed}
          handleRestoreVersionData={handleRestoreVersionData}
          setCurrentSelectedVersion={setCurrentSelectedVersion}
        />
      </Suspense>
    </>
  );
};

export default VersionHistory;
