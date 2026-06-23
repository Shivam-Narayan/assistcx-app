import { Skeleton } from "@/components/skeleton";
import React from "react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  isLoading: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLoading }) => {
  return (
    <div className="flex items-center px-4 py-2.5">
      <div className="w-56 shrink-0 text-sm text-muted-foreground">
        {label}
      </div>
      <div className="flex-1 text-sm font-medium">
        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : value ? (
          value
        ) : (
          <span className="text-muted-foreground italic font-normal">
            Not set
          </span>
        )}
      </div>
    </div>
  );
};

export default InfoRow;
