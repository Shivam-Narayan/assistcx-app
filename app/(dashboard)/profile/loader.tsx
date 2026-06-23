import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const Loader = () => {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="px-6 py-4">
        <div className="h-8 w-36 bg-gray-200 rounded" />
      </div>

      {/* Main Content Skeleton */}
      <div className="p-6 lg:flex lg:items-start lg:gap-6">
        {/* Profile Summary Skeleton */}
        <div className="lg:col-span-1 flex justify-center mb-6 lg:mb-0">
          <div className="border rounded-lg p-3 flex flex-col items-center text-center gap-4 w-full lg:w-[300px] shrink-0">
            {/* Avatar Skeleton (size adjusted) */}
            <div className="h-20 w-20 bg-gray-200 rounded-full" />

            {/* New group for user info and role badge with smaller gap */}
            <div className="flex flex-col items-center gap-2">
              {/* User Info Placeholder */}
              <div className="space-y-1.5">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />
              </div>
              {/* Role Badge Placeholder */}
              <div className="h-6 w-28 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>

        {/* Personal & Security Info Skeleton */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          {/* Personal Information Skeleton */}
          <div className="border rounded-lg p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-12 bg-gray-200 rounded" />
                <div className="h-4 w-36 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
          {/* SecurityCard Skeleton */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 grow">
                <div className="h-5 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-full max-w-lg bg-gray-200 rounded" />
                <div className="h-4 w-11/12 max-w-md bg-gray-200 rounded" />
              </div>
              <div className="h-9 w-36 bg-gray-200 rounded-md shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
