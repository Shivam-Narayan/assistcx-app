import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import UserAvatar from "@/components/user-avatar";
import * as helperFun from "@/helper/helper-function";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import ApiKeyDialog from "./app-key-dialog";
import { cellObject } from "./hook/useGetApiKeyData";

interface ApiKeyRowProps {
  rowItem: cellObject;
  loadTableData: (data: any, type: PostActionStateSyncAction) => void;
  isFullAccess: boolean;
  isEditAccess: boolean;
}

const ApiKeyRow = ({
  rowItem,
  loadTableData,
  isFullAccess,
  isEditAccess,
}: ApiKeyRowProps) => {
  const [openconfirmModel, setOpenconfirmModel] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { axiosAuth, loading } = useAxiosAuth();
  const [isEdit, setIsEdit] = useState(false);
  const handleConfirmDelete = async () => {
    if (loading || !rowItem?.id) return;
    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_API_KEY}/${rowItem?.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        loadTableData(rowItem, "delete");
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };
  const createdUser =
    rowItem?.user_name == null ? "Root User" : rowItem?.user_name;
  return (
    <>
      <TableRow>
        <TableCell className="p-3 font-medium max-w-xs">
          <ConditionalTooltip content={rowItem.name || ""}>
            <div className="truncate">{rowItem.name}</div>
          </ConditionalTooltip>
        </TableCell>

        <TableCell className="p-3">
          <ConditionalTooltip content={rowItem?.key_hint || ""}>
            <Badge
              variant="secondary"
              className="border border-border font-mono inline-block max-w-[250px] truncate"
            >
              {rowItem?.key_hint}
            </Badge>
          </ConditionalTooltip>
        </TableCell>
        <TableCell className="p-3">
          <ConditionalTooltip content={createdUser}>
            <div className="flex items-center gap-2 max-w-[150px]">
              <UserAvatar name={createdUser} size="sm" />
              <span className="truncate font-medium">{createdUser}</span>
            </div>
          </ConditionalTooltip>
        </TableCell>

        <TableCell className="p-3 w-fit min-w-[180px]">
          {helperFun.UTCToLocalTimezon(rowItem?.created_at)}
        </TableCell>
        {(isEditAccess || isFullAccess) && (
          <TableCell className="p-3 w-fit text-center max-w-[120px] min-w-[120px]">
            <div className="space-x-2 flex items-center ">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={() => setIsEdit(true)}
              >
                <Edit2 className="h-5 w-5" />
              </Button>
              {isFullAccess && (
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() => setOpenconfirmModel(true)}
                >
                  <Trash2 className="h-5 w-5 " />
                </Button>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>
      {openconfirmModel && (
        <CustomDeleteDialog
          open={openconfirmModel}
          onOpenChange={setOpenconfirmModel}
          handleAlert={handleConfirmDelete}
          isLoading={isDeleteLoading}
          title={`Are you sure you want to delete '${rowItem?.name}' API Key?`}
          description={
            "This action cannot be undone and will permanently delete the selected API key and its associated configurations."
          }
        />
      )}
      {isEdit && (
        <ApiKeyDialog
          mode="edit"
          open={isEdit}
          setOpen={setIsEdit}
          rowData={rowItem}
          onClose={() => setIsEdit(false)}
          loadTableData={loadTableData}
        />
      )}
    </>
  );
};
export default ApiKeyRow;
