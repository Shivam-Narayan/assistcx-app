import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SheetClose, SheetHeader } from "@/components/ui/sheet";
import { X } from "lucide-react";

interface FileViewerLoaderProps {
  enableKnowledgeFetching?: boolean;
}
export const FileViewerLoader = ({
  enableKnowledgeFetching,
}: FileViewerLoaderProps) => {
  const tabCount = enableKnowledgeFetching ? 5 : 4;
  const widthClass = enableKnowledgeFetching ? "w-[20%]" : "w-[25%]";
  return (
    <>
      <SheetHeader className="sticky top-0 z-10 flex p-4  space-y-0 bg-background">
        <div className="flex-row justify-between items-center flex ">
          <div className="flex items-center gap-2 animate-pulse">
            <div className="h-5 w-5 rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
            <div className="h-5 w-40 rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
          </div>
          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </div>
        <div className="px-4 py-3 animate-pulse flex flex-row gap-2">
          {Array.from({ length: tabCount }).map((_, index) => (
            <div
              key={index}
              className={`h-4 ${widthClass} rounded bg-card-foreground/20 dark:bg-card-foreground/10`}
            />
          ))}
        </div>
      </SheetHeader>

      <div className="flex-1 p-4 space-y-4 animate-pulse">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="h-5 w-40 rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
            <div className="h-8 w-8 rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[180px_1fr] items-center gap-4"
              >
                <div className="h-4 w-32 rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
                <div className="h-4 w-full max-w-md rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
