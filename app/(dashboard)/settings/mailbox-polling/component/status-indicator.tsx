import { Badge } from "@/components/ui/badge";

export const StatusIndicator = ({ enabled }: { enabled: any }) => {
  return (
    <Badge
      variant="outline"
      className={`text-sm border ${
        enabled
          ? "border-green-500 text-green-600 bg-green-50"
          : "border-gray-400 text-gray-500 bg-gray-50"
      }`}
    >
      {enabled ? "Enabled" : "Disabled"}
    </Badge>
  );
};
