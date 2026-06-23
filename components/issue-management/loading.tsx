import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const IssueRowSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="pr-4 space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-0">
          <CardContent className="flex items-start gap-3 p-3">
            <Skeleton className="h-4 w-4 rounded-full mt-1" />

            <div className="flex flex-col gap-1 w-full">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full max-w-[450px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
