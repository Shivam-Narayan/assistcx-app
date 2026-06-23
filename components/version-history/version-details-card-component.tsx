import moment from "moment";
import React from "react";
import CopyToClipboard from "../copy-to-clipboard";

interface VersionData {
  user_id: string | number;
  user_name: string;
  user_email: string;
  entity_type: string;
  entity_id: string | number;
  id: string | number;
  created_at: string;
}

interface VersionDetailsCardProps {
  versionData: VersionData;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "secondary";
  className?: string;
}

const VersionDetailsCard: React.FC<VersionDetailsCardProps> = ({
  versionData,
}) => {
  const Badge: React.FC<BadgeProps> = ({
    children,
    variant = "secondary",
    className = "",
  }) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const variants = {
      secondary: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`${baseClasses} ${
          variants[variant] || variants.secondary
        } ${className}`}
      >
        {children}
      </span>
    );
  };

  const dataTemplateInfo = [
    {
      label: "User",
      value: `${versionData?.user_name || "N/A"}${
        versionData?.user_email ? ` (${versionData.user_email})` : ""
      }`,
      showCopy: false,
    },

    {
      label: "Created At",
      value: versionData?.created_at
        ? moment
            .utc(versionData.created_at)
            .local()
            .format("MMM DD, YYYY hh:mm A")
        : "N/A",
      showCopy: false,
    },
    {
      label: versionData?.entity_type === "agent" ? "Agent ID" : "Template ID",
      value: versionData?.entity_id || "N/A",
      showCopy: true,
    },
    {
      label: "Version ID",
      value: versionData?.id || "N/A",
      showCopy: true,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col divide-y divide-dashed">
        {dataTemplateInfo.map((row, index) => (
          <div key={index} className="flex flex-row py-2.5 items-center group">
            <div className="w-1/3 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm">
                {row.label}
              </Badge>
            </div>
            <div className="w-2/3 text-sm text-gray-700 break-words flex items-center justify-between">
              <span>{row?.value}</span>
              {row.showCopy && (
                <CopyToClipboard
                  text={JSON.stringify(row?.value) || ""}
                  tooltipLabel={`Copy ${row.label}`}
                  className="dark:bg-slate-100 cursor-pointer ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionDetailsCard;
