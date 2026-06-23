import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import Loader from "./loader";

interface DataTableLoaderProps {
  rows?: number;
  columns?: { header_name: string }[];
}

const DataTableLoader = ({
  rows = 6,
  columns = [],
}: DataTableLoaderProps) => {
  return (

    <div className="flex items-center justify-center scale-75 mt-10">
      <Loader />
    </div>

    // <Card className="shadow-none p-0 gap-0">
    //   <Table>
    //     {/* Header*/}
    //     <TableHeader>
    //       <TableRow>
    //         {columns.map((col, i) => (
    //           <TableHead key={i} className="p-3">
    //             {col.header_name}
    //           </TableHead>
    //         ))}
    //       </TableRow>
    //     </TableHeader>

    //     {/* Skeleton rows */}
    //     <TableBody>
    //       {Array.from({ length: rows }).map((_, rowIndex) => (
    //         <TableRow key={rowIndex} className="animate-pulse">
    //           {columns.map((_, colIndex) => (
    //             <TableCell key={colIndex} className="p-3">
    //               <div className="h-4 w-full rounded-md bg-muted/60" />
    //             </TableCell>
    //           ))}
    //         </TableRow>
    //       ))}
    //     </TableBody>
    //   </Table>
    // </Card>
  );
};

export default DataTableLoader;
