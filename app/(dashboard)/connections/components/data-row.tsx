import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import ConnectionManageDialog from "@/components/connections-select/connection-manage-dialog";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import UserAvatar from "@/components/user-avatar";
import {
  errorMessageHandler,
  successMessageHandler,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Play, Trash2 } from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  valid: {
    label: "Healthy",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  healthy: {
    label: "Healthy",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  invalid: {
    label: "Unhealthy",
    className: "bg-red-100 text-red-700 border-red-300",
  },
  unhealthy: {
    label: "Unhealthy",
    className: "bg-red-100 text-red-700 border-red-300",
  },
  expired: {
    label: "Expired",
    className: "bg-orange-100 text-orange-700 border-orange-300",
  },
};

interface DataRowProps {
  rowItem: any;
  icon: { type: "img" | "svg"; value: string };
  onUpdateConnection: (id: string, data: Record<string, any>) => void;
  onDeleteConnection: (id: string) => void;
  onSubmitConnection: (
    formData: any,
    editingConnectionId: string | null,
  ) => Promise<boolean>;
  connectionLoading?: boolean;
  canEditConnections: boolean;
  canDeleteConnections: boolean;
}

export const DataRow = ({
  rowItem,
  icon,
  onUpdateConnection,
  onDeleteConnection,
  onSubmitConnection,
  connectionLoading,
  canEditConnections,
  canDeleteConnections,
}: DataRowProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  type mode = "edit" | "view";
  const [currentMode, setCurrentMode] = useState<mode>("view");
  const [testLoading, setTestLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [authSchemaFields, setAuthSchemaFields] = useState<any[]>([]);
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [deatilsData, setDetailsData] = useState<any>(null);

  const handleTest = async () => {
    try {
      setTestLoading(true);
      const result = await axiosAuth.post(
        `${url.CONNECTIONS}/${rowItem.id}/test`,
      );
      if (result?.status === 200) {
        if (result.data.auth_status === "unhealthy") {
          errorMessageHandler(result.data.message);
        } else {
          successMessageHandler(result.data.message);
        }
        onUpdateConnection(rowItem.id, {
          auth_status: result.data.auth_status ?? result.data.status,
        });
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setTestLoading(false);
    }
  };

  const handleAuthTypeChange = async (type: string) => {
    if (loading) return;
    try {
      setCredentialLoading(true);
      const params = new URLSearchParams();
      params.append("filters", JSON.stringify({ key: type }));
      const result = await axiosAuth.get(
        `${url.AUTH_SCHEMA_CATALOG}?${params.toString()}`,
      );
      if (result.status === 200) {
        setAuthSchemaFields(result.data);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setCredentialLoading(false);
    }
  };

  const handleEditOpen = () => {
    setCurrentMode("edit");
    setEditOpen(true);
  };

  const handleViewMode = (rowItem: any) => {
    console.log("rowItem.provider_key", rowItem?.provider_key);
    getDetailsForViewMode(rowItem.provider_key);
    setCurrentMode("view");
    setEditOpen(true);
  };

  const getDetailsForViewMode = async (fieldKey: string) => {
    try {
      setCredentialLoading(true);
      const params = new URLSearchParams();

      params.append("filters", JSON.stringify({ key: fieldKey }));
      const result = await axiosAuth.get(
        `${url.PROVIDER}?${params.toString()}`,
      );
      if (result.status === 200) {
        setDetailsData(result.data);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setCredentialLoading(false);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    const success = await onSubmitConnection(formData, rowItem.id);
    if (success) {
      setEditOpen(false);
    }
  };

  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDeleteConnection(rowItem.id);
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  const status = STATUS_CONFIG[rowItem.auth_status] ?? STATUS_CONFIG["valid"];
  const createdUser =
    rowItem?.user_name == null ? "Root User" : rowItem?.user_name;

  return (
    <>
      <TableRow key={rowItem.id}>
        <TableCell className="p-3 min-w-[300px] max-w-[400px]">
          <div className="flex items-center w-full gap-2">
            <div className="h-fit w-fit shrink-0 rounded-full bg-muted p-1 border">
              {icon.type === "img" ? (
                <img
                  src={icon.value}
                  alt={rowItem.provider_key}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <div
                  className="flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4"
                  dangerouslySetInnerHTML={{ __html: icon.value }}
                />
              )}
            </div>

            <div
              className="min-w-0 flex-1 mt-1"
              onClick={() => handleViewMode(rowItem)}
            >
              <ConditionalTooltip content={rowItem.name}>
                <span className="block font-medium truncate whitespace-nowrap hover:underline cursor-pointer">
                  {rowItem.name}
                </span>
              </ConditionalTooltip>
            </div>
          </div>
        </TableCell>

        <TableCell className="p-3">
          <ConditionalTooltip content={createdUser}>
            <div className="flex items-center gap-2 max-w-[150px]">
              <UserAvatar name={createdUser} size="sm" />
              <span className="truncate font-medium">{createdUser}</span>
            </div>
          </ConditionalTooltip>
        </TableCell>
        <TableCell className="p-3">{UTCToLocalTimezon(rowItem.date)}</TableCell>
        <TableCell className="p-3">
          {testLoading ? (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 flex items-center gap-2 w-fit pointer-events-none">
              <span className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
              Testing...
            </Badge>
          ) : (
            <Badge className={`${status.className} pointer-events-none`}>
              {status.label}
            </Badge>
          )}
        </TableCell>
        <TableCell className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {canEditConnections && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={handleTest}
                  disabled={testLoading}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Test
                </DropdownMenuItem>
              )}
              {canDeleteConnections && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ConnectionManageDialog
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        schemaKey={rowItem.auth_schema_key}
        handleAuthTypeChange={handleAuthTypeChange}
        authSchemaFields={authSchemaFields}
        credentialLoading={credentialLoading}
        onSubmitData={handleEditSubmit}
        connectionLoading={connectionLoading}
        editingConnectionId={rowItem.id}
        connectionName={rowItem.name}
        currentMode={currentMode}
        handleEditOpen={handleEditOpen}
        deatilsData={deatilsData}
        setCurrentMode={setCurrentMode}
      />

      <CustomDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        handleAlert={handleConfirmDelete}
        isLoading={deleteLoading}
        title="Are you sure you want to delete this connection?"
        description="This action cannot be undone and will permanently delete the connection."
      />
    </>
  );
};
