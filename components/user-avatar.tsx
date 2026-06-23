import React, { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/helper/helper-function";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  textColor?: string;
  backgroundColor?: string;
  size?: "sm" | "md" | "lg" | "xl" | "xs";
  className?: string;
}

const sizeClasses = {
  xs: "h-4 w-4 text-xs",
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-12 w-12 text-lg",
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  textColor = "text-white",
  backgroundColor = "bg-primary",
  size = "md",
  className,
}) => {
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback
        className={`
          flex items-center justify-center
          font-medium uppercase
          ${textColor} ${backgroundColor}
        `}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
