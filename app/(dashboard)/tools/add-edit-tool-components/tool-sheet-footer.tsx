import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { canDelete } from "@/lib/permissions";
import { handleToolsEvents } from "@/redux/agents/create-agents-data-slice";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { useAppSelector } from "@/redux/store";
import { handleToolsData } from "@/redux/tools/tools-data-slice";
import { Loader2, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { convertObjectToArray } from "./tool-helper-function";
import { DEFAULT_FORM_VALUES } from "./initial-form-state";

interface ToolSheetFooterProps {
  variant: "default" | undefined;
  label: string | undefined;
  onClick?: () => void;
  isLoading?: boolean;
  handleDeleteClick?: () => void;
  form?: any;
  setHeadersList?: (items: any[]) => void;
  setQueryParametersList?: (items: any[]) => void;
  supportsCustomFields?: boolean;
}
export function ToolSheetFooter({
  variant,
  label,
  onClick,
  isLoading,
  handleDeleteClick,
  form,
  setHeadersList,
  setQueryParametersList,
  supportsCustomFields = false,
}: ToolSheetFooterProps) {
  const dispatch = useDispatch();
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const userEvents = useAppSelector(
    (state) => state?.toolsEventReducer?.toolsEventReducer?.value?.userEvent,
  );
  const toolsData = useAppSelector(
    (state) => state?.toolsDataReducer?.toolsDataReducer?.value,
  );

  const showDelete = permissions
    ? canDelete(permissions, "agent_tools") && !supportsCustomFields
    : false;

  const cancleEdit = () => {
    form.reset({ ...DEFAULT_FORM_VALUES, ...toolsData });
    if (toolsData?.headers && Object.keys(toolsData.headers).length > 0) {
      setHeadersList?.(convertObjectToArray(toolsData.headers));
    }
    if (
      toolsData?.query_params &&
      Object.keys(toolsData.query_params).length > 0
    ) {
      if (setQueryParametersList) {
        setQueryParametersList(convertObjectToArray(toolsData.query_params));
      }
    }
    dispatch(handleToolsData(toolsData));
    dispatch(handleToolsEvents("viewTool"));
    dispatch(handleSheetEvents(true));
  };
  return (
    <SheetFooter
      className={`${
        userEvents == "editTool" && "justify-between!"
      } sticky z-10 bottom-0 p-3 border-t bg-background`}
    >
      {userEvents == "editTool" && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={cancleEdit}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          {showDelete && (
            <ConditionalTooltip
              content="Delete"
              alwaysShow={true}
              align="center"
              showArrow={true}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                type="button"
                className="cursor-pointer h-9 sm:h-9 w-9 sm:w-9 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 pr-2 pl-2"
              >
                <Trash2 className="w-6 h-6" />
              </Button>
            </ConditionalTooltip>
          )}
        </div>
      )}

      <Button
        className="cursor-pointer"
        variant={variant}
        onClick={onClick}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </SheetFooter>
  );
}
