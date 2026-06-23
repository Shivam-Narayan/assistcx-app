import { Skeleton } from "@/components/ui/skeleton";

export const LoadingCards = () => {
  const cards = [];
  for (let i = 0; i < 6; i++) {
    cards.push(
      <div
        key={i}
        className="flex flex-col w-full border rounded-md p-4 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full bg-muted" />
            <div className="ml-3 flex flex-col gap-2">
              <Skeleton className="w-32 h-5 rounded-md bg-muted" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-4 w-full rounded-md bg-muted" />
          <Skeleton className="h-4 w-5/6 rounded-md bg-muted" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Skeleton className="h-6 w-20 rounded-full bg-muted" />
          <Skeleton className="h-6 w-16 rounded-full bg-muted" />
        </div>
        <div className="flex justify-between items-center border-t mt-4 pt-4">
          <Skeleton className="h-7 w-24 rounded-md bg-muted" />
          <Skeleton className="h-5 w-9 rounded-full bg-muted" />
        </div>
      </div>,
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
      {cards}
    </div>
  );
};

const Loading = () => {
  return (
    <div role="status" className="flex flex-col gap-3 px-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5 w-full gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 rounded-md bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-56 rounded-md bg-muted" />
        </div>
      </div>
      <LoadingCards />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
