"use client";

import { Badge } from "@/components/ui/badge";

interface Tool {
  name: string;
  action: string;
  description?: string;
  selection?: boolean;
  api_type?: string;
  icon?: string;
}

interface Refinement {
  refinementText?: string;
  tools?: Tool[];
}

interface RefinementListProps {
  refinementsList: Refinement[];
}

const RefinementList = ({ refinementsList }: RefinementListProps) => {
  if (!refinementsList?.length) return null;

  return (
    <>
      {refinementsList.map((refine, index) => (
        <div
          key={index}
          className="group py-4 px-4 border rounded-lg mb-4 space-y-3"
        >
          <div className="flex gap-4">
            {/* <span className="text-sm font-medium w-1/5 flex-shrink-0">
              Instructions:
            </span> */}
            <p className="text-sm break-words whitespace-pre-wrap w-4/5 text-muted-foreground">
              {refine.refinementText || "N/A"}
            </p>
          </div>

          {/* {refine.tools && refine.tools.length > 0 && (
            <div className="flex gap-4">
              <span className="text-sm font-medium w-1/5 flex-shrink-0">
                Tools:
              </span>
              <div className="flex flex-wrap gap-2 w-4/5">
                {refine.tools.map((tool, toolIndex) => (
                  <Badge key={toolIndex} variant="outline" className="text-sm">
                    {tool.name}
                  </Badge>
                ))}
              </div>
            </div>
          )} */}
        </div>
      ))}
    </>
  );
};

export default RefinementList;
