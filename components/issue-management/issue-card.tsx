import { useIssueOperation } from "@/app/(dashboard)/issues/hook/useIssueOpration";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  capitalizeFirstLetter,
  getTagsFromIdsOrNames,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import { ArrowRight, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { type Issue } from "./issue-detail-sheet";

// Extended issue type with additional fields
export interface ExtendedIssue extends Issue {
  user_name: string;
  created_at: string;
  updated_at: string;
  tag_ids: string[];
}

interface IssueCardProps {
  issue: ExtendedIssue;
  onViewDetails: (issue: ExtendedIssue) => void;
}

export const IssueCard = ({ issue, onViewDetails }: IssueCardProps) => {
  const { allTagsList } = useIssueOperation();
  const issueTags = getTagsFromIdsOrNames(issue.tag_ids, allTagsList);

  return (
    <Card
      className="group gap-3 py-3 transition-all hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 hover:bg-muted dark:hover:bg-slate-600/80 cursor-pointer"
      onClick={() => onViewDetails(issue)}
    >
      <CardHeader className="py-0 px-4 gap-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold leading-tight">
            {capitalizeFirstLetter(issue.title)}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-0 -mt-2.5">
        <CardDescription className="line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          {issue.description}
        </CardDescription>
        {issueTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {issueTags.map((tag: any) => (
              <Badge
                key={tag.id}
                className="flex items-center justify-center !text-black  px-1.5 py-0.5 rounded-full font-normal text-xs shadow-none"
                style={
                  tag.color
                    ? { backgroundColor: tag.color }
                    : { backgroundColor: "#e5e7eb" }
                }
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 !pt-2 pb-0 mt-0 justify-between border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-gray-500 dark:text-gray-400">Reported by:</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {issue.user_name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
          <Calendar className="w-3 h-3" />
          <span>{UTCToLocalTimezon(issue.updated_at)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueCard;
