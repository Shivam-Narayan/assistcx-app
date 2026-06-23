import { ReactNode } from "react";

import ConditionalTooltip from "../conditional-tooltip-renderer";

export function SidebarTooltip({
  collapsed,
  tooltip,
  icon,
  children,
}: {
  collapsed: boolean;
  tooltip: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  if (collapsed) {
    return (
      <ConditionalTooltip
        content={tooltip}
        alwaysShow={true}
        align="center"
        showArrow={true}
        sideOffset={20}
        side="right"
        className="z-50"
      >
        <span>{icon}</span>
      </ConditionalTooltip>
    );
  }
  return <>{children}</>;
}
