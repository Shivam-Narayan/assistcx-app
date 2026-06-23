import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbItem as BreadcrumbItemType } from "@/types/types"; // Adjust the import path as necessary
import { ArrowLeft, Home } from "lucide-react";

interface BreadcrumbNavProps {
  path: BreadcrumbItemType[];
  onCrumbClick: (index: number) => void;
  showBack?: boolean;
}

export default function BreadcrumbNav({
  path,
  onCrumbClick,
  showBack = false,
}: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {showBack && (
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => onCrumbClick(-1)}
              className="flex gap-2 items-center hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {/* Home button */}
        <BreadcrumbItem className="-ml-2">
          <BreadcrumbLink
            onClick={() => onCrumbClick(-2)}
            className="flex gap-2 items-center hover:text-foreground cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {path.map((item, index) => (
          <BreadcrumbItem key={item.id}>
           <BreadcrumbSeparator />
            {index === path.length - 1 ? (
              <BreadcrumbPage className="cursor-pointer">
                {item.name}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                onClick={() => onCrumbClick(index)}
                className="hover:text-foreground cursor-pointer"
              >
                {item.name}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
