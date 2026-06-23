import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Toolbar from "./toolbar";

export const LoadingCards = () => {
  const cards = [];
  for (let i = 0; i < 9; i++) {
    cards.push(
      <Card key={i} className="p-0 gap-0">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full me-3 bg-card-foreground/20 dark:bg-card-foreground/10" />
              <div>
                <div className="h-3 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-24 md:w-24 lg:w-24 xl:w-32 mb-2"></div>
                <div className="h-2 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-28 md:w-28 lg:w-28 xl:w-40"></div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <div className="h-2.5 bg-card-foreground/20 rounded dark:bg-card-foreground/10 min-w-15 mb-2.5" />
            <div className="h-2.5 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-40" />
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-4 justify-start px-6 py-4">
          <div className="w-32 h-3 bg-card-foreground/20 rounded dark:bg-card-foreground/10" />
          <div className="w-24 h-3 bg-card-foreground/20 rounded dark:bg-card-foreground/10" />
        </CardFooter>
      </Card>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 animate-pulse">
      {cards}
    </div>
  );
};

const Loading = () => {
  return (
    <div role="status" className="flex flex-col gap-3 px-6 w-full">
      <div className="flex items-center justify-between py-5 w-full">
        <h2 className="text-3xl font-semibold tracking-tight">Agents</h2>
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
