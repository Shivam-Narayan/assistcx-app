import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRoleName } from "@/helper/helper-function";
import { ProfileSummaryCardProps } from "@/types/types";

export const ProfileSummaryCard = ({
  userData,
  initials,
  userFullName,
}: ProfileSummaryCardProps) => {
  return (
    <div className="border rounded-lg shadow-xs p-4 flex flex-col items-center gap-3 text-center w-full max-w-full lg:max-w-md lg:w-[280px] shrink-0">
      <Avatar className="h-20 w-20">
        <AvatarImage alt="User Avatar" src="/placeholder-avatar.jpg" />
        <AvatarFallback className="text-3xl text-foreground font-bold text-primary bg-primary/10">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-2 w-full">
        <div className="w-full px-2">
          <h3 className="text-xl font-semibold break-words line-clamp-2">
            {userFullName}
          </h3>
          <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
        </div>
        {userData?.role_key && (
          <span className="text-primary bg-primary/10 text-xs font-medium px-3 py-1 rounded-full max-w-full truncate">
            {formatRoleName(userData.role_key)}
          </span>
        )}
      </div>
    </div>
  );
};
