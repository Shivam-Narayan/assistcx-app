import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStatusColor } from "@/helper/helper-function";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Archive, Delete, Files, HardDrive, Trash2, X } from "lucide-react";
import { getIconsData, getIconSvg } from "./icon-manager/icon-render-component";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { formatFileSize } from "@/lib/utils";
import ConditionalTooltip from "./conditional-tooltip-renderer";

interface agentKnowledgeInterface {
  name: string;
  action: string;
  availability: string;
  function: string;
  description: string;
  selection?: boolean;
  api_type: string;
  icon: string;
  index_name: string;
  file_count?: any;
  total_size?: any;
}

export interface emptyDataInterface {
  isDisabled?: boolean;
  pageType: string;
  index: number;
  knowledge: agentKnowledgeInterface;
  className: string;
  removeRuleHandler?: (index: number) => void;
  onSelectionchangeHandler?: (selection: boolean, index: number) => void;
  editKnowledge?: (knowledgeE: any) => void;
  viewKnowledge?: (knowledgeE: any) => void;
  isCreatUpdateAgentKnowledge?: boolean;
}

const CustomAgentKnowledgeCard = ({
  isDisabled,
  index,
  pageType,
  knowledge,
  className,
  isCreatUpdateAgentKnowledge,
  removeRuleHandler,
  onSelectionchangeHandler,
  editKnowledge,
  viewKnowledge,
}: emptyDataInterface) => {
  const iconsData = getIconsData("collection_icons");
  const defaultIcon = getIconSvg("ai-book", "collection_icons");
  const removeRuleOnClickHandler = (index: number) => {
    removeRuleHandler ? removeRuleHandler(index) : null;
  };

  const onSelectionchangeHandlerF = (selection: boolean, index: number) => {
    onSelectionchangeHandler
      ? onSelectionchangeHandler(selection, index)
      : null;
  };

  const onEditClickHandler = (knowledgeE: any) => {
    editKnowledge ? editKnowledge(knowledgeE) : null;
  };

  const onViewClickHandler = (knowledgeE: any) => {
    viewKnowledge ? viewKnowledge(knowledgeE) : null;
  };

  return (
    <Card
      className={`cursor-pointer p-0 gap-0 group ${className} break-words overflow-hidden hover:bg-primary/5 hover:border-primary/20 `}
      onClick={() => onViewClickHandler(knowledge)}
    >
      <CardContent className="grid gap-4 px-4 !py-4 relative">
        <div className="flex gap-3 w-full">
          <div className="shrink-0">
            <div className="p-2.5 bg-primary/10 text-primary rounded-full">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    knowledge.icon && iconsData?.[knowledge.icon]
                      ? iconsData[knowledge.icon]
                      : defaultIcon,
                }}
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-1 min-w-0">
            <div className="flex flex-row justify-between items-center min-w-0">
              <div className="flex flex-row gap-2 items-center text-lg font-semibold min-w-0 flex-1 overflow-hidden mr-3">
                <p className="text-lg font-medium text-foreground/90 break-words hyphens-auto min-w-0 overflow-hidden">
                  {knowledge.name}
                </p>
                {knowledge?.availability ? (
                  <span className="text-sm font-normal shrink-0">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        knowledge?.availability,
                      )} whitespace-nowrap`}
                    >
                      {knowledge?.availability}
                    </Badge>
                  </span>
                ) : null}
              </div>

              {!isDisabled && pageType == "1" ? (
                <Checkbox
                  className="justify-end ml-auto h-5 w-5 shrink-0 cursor-pointer"
                  checked={knowledge.selection}
                  onCheckedChange={(checked) =>
                    onSelectionchangeHandlerF(Boolean(checked), index)
                  }
                />
              ) : null}

              {!isDisabled && pageType == "2" ? (
                <div className="absolute top-3 right-3 ">
                  <ConditionalTooltip
                    content="Remove Collection"
                    alwaysShow={true}
                    align="center"
                    showArrow={true}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRuleOnClickHandler(index);
                      }}
                      aria-label="Delete"
                      className="p-1 h-8 w-8 items-center rounded-md cursor-pointer cursor-pointer h-6 w-6 md:h-8 md:w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-primary" />
                    </Button>
                  </ConditionalTooltip>
                </div>
              ) : null}

              {!isDisabled && pageType == "3" ? (
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="px-2 py-0.5 rounded-md cursor-pointer data-[state=open]:bg-muted hover:bg-secondary">
                        <DotsHorizontalIcon className="h-5 w-5" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        className="h-8 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          onViewClickHandler(knowledge);
                        }}
                      >
                        <DropdownMenuLabel className="font-normal">
                          View Knowledge
                        </DropdownMenuLabel>
                      </DropdownMenuItem>
                      {isCreatUpdateAgentKnowledge && <DropdownMenuSeparator />}
                      {isCreatUpdateAgentKnowledge && (
                        <DropdownMenuItem
                          className="h-8 cursor-pointer font-base"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditClickHandler(knowledge);
                          }}
                        >
                          <DropdownMenuLabel className="font-normal">
                            Edit Knowledge
                          </DropdownMenuLabel>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 break-words hyphens-auto overflow-hidden">
              {knowledge.description}
            </p>
            <div className="flex items-center gap-6 text-sm mt-2">
              <div className="flex items-center gap-1">
                <Files className="h-4 w-4 text-muted-foreground " />
                <span>{knowledge?.file_count} files</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4 text-muted-foreground " />
                <span>{formatFileSize(knowledge?.total_size)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomAgentKnowledgeCard;
