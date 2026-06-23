import { Card, CardContent } from "@/components/ui/card";

export const LoadingTools = () => {
  const cards = [];
  for (let i = 0; i < 4; i++) {
    cards.push(
      <Card key={i} className="p-0 gap-0">
        <CardContent className="grid gap-6 px-5 py-5">
          <div className="flex space-x-4 w-full animate-pulse">
            <div className="h-12 w-12 rounded-full bg-card-foreground/20 dark:bg-card-foreground/10" />
            <div className="flex-1">
              <div className="flex flex-row gap-2 items-center justify-between mb-4">
                <div className="flex gap-3 items-center">
                  <div className="h-4 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-36"></div>
                  <div className="h-4 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-16"></div>
                </div>
                <div className="flex gap-1 ml-auto">
                  <div className="h-1 w-1 bg-card-foreground/20 rounded-full dark:bg-card-foreground/10"></div>
                  <div className="h-1 w-1 bg-card-foreground/20 rounded-full dark:bg-card-foreground/10"></div>
                  <div className="h-1 w-1 bg-card-foreground/20 rounded-full dark:bg-card-foreground/10"></div>
                </div>
              </div>
              <div className="mb-4 flex flex-col gap-3">
                <div className="h-2.5 bg-card-foreground/20 rounded dark:bg-card-foreground/10 min-w-15" />
                <div className="h-2.5 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-7/12" />
              </div>
              <div className="flex gap-4">
                <div className="h-5 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-40" />
                <div className="h-5 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>,
    );
  }
  return <>{cards}</>;
};

const Loading = () => {
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="h-full w-full max-w-4xl flex flex-col gap-4 mx-auto">
          <LoadingTools />
        </div>
      </div>
    </>
  );
};

export default Loading;
