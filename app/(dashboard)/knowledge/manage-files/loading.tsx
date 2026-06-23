import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RenderDataTableSkeleton() {
  const numRows = 12;
  const numColumns = 6;

  const numHeaderCol = 6;
  const numHeaderRow = 1;

  const renderSkeletonRows = () => {
    const skeletonRows = [];

    for (let i = 0; i < numRows; i++) {
      skeletonRows.push(
        <TableRow key={i}>
          {Array.from({ length: numColumns }).map((_, j) => (
            <TableCell key={j} className="py-4">
              <div
                className={`bg-card-foreground/20 dark:bg-card-foreground/10 h-3 rounded w-48`}
              ></div>
            </TableCell>
          ))}
        </TableRow>
      );
    }

    return skeletonRows;
  };
  const renderSkeletonHeader = () => {
    const skeletonHeader = [];

    for (let i = 0; i < numHeaderRow; i++) {
      skeletonHeader.push(
        <TableRow key={i}>
          {Array.from({ length: numHeaderCol }).map((_, j) => (
            <TableHead key={j} className="">
              <div
                className={`bg-card-foreground/20 dark:bg-card-foreground/10 h-3 rounded w-24`}
              ></div>
            </TableHead>
          ))}
        </TableRow>
      );
    }

    return skeletonHeader;
  };

  return (
    <Card className="col-span-7 lg:col-span-7 p-0 gap-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader>{renderSkeletonHeader()}</TableHeader>
          <TableBody>{renderSkeletonRows()}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div
      role="status"
      className="w-[-webkit-fill-available]! min-h-screen space-y-4 shadow-sm md:p-6"
    >
      <div className="animate-pulse">
        <div className="flex items-center justify-between py-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            <div className="flex flex-1 items-center space-x-2">
              <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-10 lg:w-10 mb-2.5" />
              <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-36 sm:w-36 lg:w-48 mb-2.5" />
            </div>
          </h2>
          <h2 className="text-3xl font-semibold tracking-tight">
            <div className="flex flex-1 items-center space-x-2">
              <div className="hidden xl:block h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-56 mb-2.5" />
              <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-36 mb-2.5" />
            </div>
          </h2>
        </div>
        <div className=" xl:hidden sm:flex items-center justify-between py-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            <div className="flex flex-1 items-center space-x-2">
              <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-36 sm:w-36 lg:w-48 mb-2.5" />
            </div>
          </h2>
          <h2 className="text-3xl font-semibold tracking-tight">
            <div className="flex flex-1 items-center space-x-2">
              <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-56 mb-2.5" />
            </div>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7 mt-6">
          <RenderDataTableSkeleton />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
