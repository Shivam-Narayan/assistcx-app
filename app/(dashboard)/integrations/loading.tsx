import { Skeleton } from "@/components/skeleton";

export const LoadingCards = () => {
  const cards = [];
  for (let i = 0; i < 9; i++) {
    cards.push(
      <div
        key={i}
        className="flex flex-col w-full border rounded-md p-4 hover:shadow-md transition-all duration-300"
      >
        {/* Header - Logo and Title */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full bg-card-foreground/20 dark:bg-card-foreground/10" />
            <div className="ml-3 flex flex-col">
              <Skeleton className="w-32 h-5 rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
            </div>
          </div>
        </div>

        {/* Content - Description */}
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-4 w-full rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
          <Skeleton className="h-4 w-5/6 rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Skeleton className="h-6 w-20 rounded-full bg-card-foreground/20 dark:bg-card-foreground/10" />
          <Skeleton className="h-6 w-16 rounded-full bg-card-foreground/20 dark:bg-card-foreground/10" />
        </div>

        {/* Footer - Button and Status */}
        <div className="flex justify-between items-center border-t mt-4 pt-4">
          <Skeleton className="h-7 w-24 rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
          <Skeleton className="h-5 w-5 rounded-full bg-card-foreground/20 dark:bg-card-foreground/10" />
        </div>
      </div>
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
      <div className="flex items-center justify-between py-5 w-full">
        <h2 className="text-3xl font-semibold tracking-tight">Integrations</h2>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-56" />
          <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-32" />
        </div>
      </div>
      <LoadingCards />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
