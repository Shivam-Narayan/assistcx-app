import { SwitchOrgDialog } from "@/components/org-switch-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Shuffle } from "lucide-react";
import React, { useState } from "react";

const SwitchOrgCard = ({
  currentOrg,
  loading,
}: {
  currentOrg: string;
  loading: boolean;
}) => {
  const [isSwitchOrgOpen, setIsSwitchOrgOpen] = useState(false);

  return (
    <React.Fragment>
      <div className="flex justify-center pb-4 ">
        <div className="flex items-center justify-between rounded-lg p-4 border border-border w-full max-w-160">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-secondary">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <p className="text-xm font-bold">{currentOrg}</p>
              )}
              {/* <p className="text-xs text-muted-foreground">
                Current organization
              </p> */}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsSwitchOrgOpen(true)}
          >
            <Shuffle className="h-4 w-4" />
            Switch
          </Button>
        </div>
      </div>

      <SwitchOrgDialog
        currentOrg={currentOrg}
        open={isSwitchOrgOpen}
        onOpenChange={setIsSwitchOrgOpen}
      />
    </React.Fragment>
  );
};

export default SwitchOrgCard;
