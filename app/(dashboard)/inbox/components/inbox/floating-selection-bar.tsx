import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomAlertDialog from "@/components/custom-alert-dialog";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete, canEdit } from "@/lib/permissions";
import {
  resetEmailState,
  setCurrentPage,
  setSelectedEmailId,
} from "@/redux/new-inbox/inbox-email-slice";
import { useAppSelector } from "@/redux/store";
import { Archive, CircleCheckBig, RotateCcw, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useEmailData } from "../../hooks/useEmailData";

interface FloatingSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  totalEmailCount: number;
  selectedFilters: any;
  onSelectAll: () => void;
  onClearSelection: () => void;
  className?: string;
  checkList: string[];
  setChecklist: any;
}

export function FloatingSelectionBar({
  selectedCount,
  totalCount,
  totalEmailCount,
  selectedFilters,
  onSelectAll,
  onClearSelection,
  className = "",
  checkList,
  setChecklist,
}: FloatingSelectionBarProps) {
  const dispatch = useDispatch();
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const canEditInbox = canEdit(permissions, "task_inbox");
  const canDeleteInbox = canDelete(permissions, "task_inbox");

  const [actionType, setActionType] = useState({
    isArchive: false,
    isDelete: false,
  });
  const { axiosAuth, loading } = useAxiosAuth();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isArchivedLoading, setIsArchivedLoading] = useState(false);

  const { refreshEmailList } = useEmailData();

  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;
  const isArchivedFilterApplied =
    selectedFilters?.status?.includes?.("ARCHIVED") || false;

  const onMassActionOnEmails = (action: string) => {
    if (action === "archive") {
      setActionType({ ...actionType, isArchive: true });
    }

    if (action === "delete") {
      setActionType({ ...actionType, isDelete: true });
    }
  };

  const handleArchiveEmails = async () => {
    if (loading) return;
    const body = {
      email_ids: checkList,
    };
    setIsArchivedLoading(true);
    try {
      const result = await axiosAuth.post(url.ARCHIVE_EMAILS, body);
      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setActionType({ ...actionType, isArchive: !actionType.isArchive });
        setChecklist([]);

        handleSyncEmailState();
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsArchivedLoading(false);
    }
  };

  const handleDeleteEmails = async () => {
    if (loading) return;
    const body = {
      email_ids: checkList,
    };
    setIsDeleteLoading(true);
    try {
      const result = await axiosAuth.delete(url.DELETE_EMAILS, { data: body });
      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setActionType({ ...actionType, isDelete: !actionType.isDelete });
        setChecklist([]);

        handleSyncEmailState();
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleSyncEmailState = () => {
    dispatch(setCurrentPage(1));
    dispatch(resetEmailState());
    dispatch(setSelectedEmailId(""));
    refreshEmailList("deleteOrArchive");
  };

  return (
    <React.Fragment>
      <div
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-xs border border-gray-200 
    px-3 py-3 rounded-b-lg shadow-xs 
    flex flex-row items-center justify-between gap-4 
    transition-all duration-300 ease-out ${className}`}
      >
        {/* --- Selected Count --- */}
        <div
          className={`h-8 flex border rounded-md divide-x min-w-0 items-center justify-start transition-all duration-200 bg-primary/10 border-primary/40 divide-primary/40 `}
        >
          <p
            className={`px-2 inline-flex gap-1 items-center xl:text-sm text-xs transition-all duration-200 text-primary/70 `}
          >
            <span
              className={`font-semibold  xl:text-lg text-sm transition-all duration-200 text-primary `}
            >
              {totalEmailCount}
            </span>{" "}
            <span className="hidden xl:inline">Total</span>
          </p>
          <p
            className={`px-2 inline-flex gap-1 items-center xl:text-sm text-xs transition-all duration-200 text-primary/70 `}
          >
            <span
              className={`font-semibold xl:text-lg text-sm transition-all duration-200 text-primary `}
            >
              {selectedCount}
            </span>{" "}
            <span className="hidden lg:inline">Selected</span>
          </p>
        </div>

        {/* --- Quick Actions --- */}
        <div className="flex items-center justify-end gap-2 flex-nowrap">
          {/* Select / Clear Button */}
          <ConditionalTooltip
            content={isAllSelected ? "Clear Selection" : "Select All"}
            alwaysShow={true}
            align="center"
            side="bottom"
            showArrow={true}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className={`h-8 px-3 font-medium transition-all duration-200 
              flex items-center gap-1 text-sm border cursor-pointer border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary `}
            >
              {isAllSelected ? (
                <RotateCcw className="w-4 h-4" />
              ) : (
                <CircleCheckBig className="w-4 h-4" />
              )}
            </Button>
          </ConditionalTooltip>

          {/* Action Buttons */}
          <TooltipProvider>
            {!isArchivedFilterApplied && canEditInbox ? (
              <ConditionalTooltip
                content={selectedCount > 0 ? `Archive (${selectedCount})` : ""}
                alwaysShow={selectedCount > 0}
                align="center"
                side="bottom"
                showArrow={true}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMassActionOnEmails("archive")}
                  disabled={selectedCount === 0}
                  className={`h-8 p-0 transition-all duration-200 cursor-pointer border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary `}
                >
                  <Archive className="w-5 h-5" />
                </Button>
              </ConditionalTooltip>
            ) : isArchivedFilterApplied && canDeleteInbox ? (
              <ConditionalTooltip
                content={`Delete (${selectedCount})`}
                alwaysShow={true}
                align="center"
                showArrow={true}
                side="bottom"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMassActionOnEmails("delete")}
                  className="h-8 p-0 border-red-500 text-red-500
                  hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </ConditionalTooltip>
            ) : null}
          </TooltipProvider>
        </div>
      </div>

      {/* --- Archive Dialog --- */}
      <CustomAlertDialog
        open={actionType.isArchive}
        onOpenChange={() =>
          setActionType({ ...actionType, isArchive: !actionType.isArchive })
        }
        handleAlert={handleArchiveEmails}
        isLoading={isArchivedLoading}
        title={`Are you sure you want to archive ${selectedCount} selected email${
          selectedCount > 1 ? "s" : ""
        }?`}
        description="This action will move the selected emails to Archive. You can restore them later."
      />

      {/* --- Delete Dialog --- */}
      <CustomDeleteDialog
        open={actionType.isDelete}
        onOpenChange={() =>
          setActionType({ ...actionType, isDelete: !actionType.isDelete })
        }
        handleAlert={handleDeleteEmails}
        isLoading={isDeleteLoading}
        title={`Permanently Delete ${selectedCount} Selected Email${
          selectedCount > 1 ? "s" : ""
        }?`}
        description="Once deleted, these emails cannot be recovered. Please confirm to proceed."
      />
    </React.Fragment>
  );
}
