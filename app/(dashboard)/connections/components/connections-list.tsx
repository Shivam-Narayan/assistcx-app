"use client";

import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { getIconsData } from "@/components/icon-manager/icon-render-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UTCToLocalTimezon } from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CalendarDays, Pencil, Play, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import EditConnectionDialog from "./edit-connection";

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

type PropsList = {
  connectionList: any;
  onDeleteConnection?: (id: number) => Promise<void>;
  isDeleteLoading?: boolean;
  onTestConnection?: any;
  isTestLoading?: boolean;
  setSelectedItem?: any;
  setMode?: any;
  selectedItem?: any;
  handleSubmit: any;
  formLoading?: boolean;
};

const ConnectionsList = ({
  connectionList,
  onDeleteConnection,
  isDeleteLoading,
  onTestConnection,
  isTestLoading,
  setSelectedItem,
  setMode,
  selectedItem,
  handleSubmit,
  formLoading,
}: PropsList) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectId, setSelectId] = useState<number>();
  const IconsList = getIconsData("ai_icons");

  const handleDeleteConfimation = (id: number) => {
    setSelectId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectId) return;
    await onDeleteConnection?.(selectId);
    setDeleteOpen(false);
  };

  const handleViewMode = (item: any) => {
    setOpenViewModal(true);
  };

  const handleTest = async (id: any) => {
    await onTestConnection(id);
  };

  const handleEdit = (item: any) => {
    setOpenViewModal(true);
    setMode("edit");
    setSelectedItem(item);
  };

  return (
    <>
      <div className="space-y-4">
        {(connectionList ?? []).map((item: any) => {
          const createdUser = item?.user_name ?? "Root User";

          const status =
            STATUS_CONFIG[item.auth_status] ?? STATUS_CONFIG["valid"];

          return (
            <Card
              key={item.id}
              className={cn(
                "group p-0 relative overflow-hidden transition-all duration-200 ",
              )}
            >
              <CardContent className="p-3">
                <div className="flex justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3
                        className="font-semibold text-base truncate cursor-pointer hover:underline"
                        onClick={() => handleViewMode(item)}
                      >
                        {item.name}
                      </h3>

                      <Badge
                        className={`${status.className} pointer-events-none h-4 px-2 text-xs`}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground dark:text-white">
                        {createdUser || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer text-foreground/90 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-foreground/10 data-[state=open]:opacity-100 transition-opacity"
                        >
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => handleTest(item.id)}
                          // disabled={isTestLoading}
                        >
                          <Play className=" h-4 w-4" />
                          Test
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => handleDeleteConfimation(item.id)}
                        >
                          <Trash2 className=" h-4 w-4 text-red-600 " />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>{UTCToLocalTimezon(item?.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CustomDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title="Are you sure you want to delete this connection?"
        description="This action cannot be undone and will permanently delete the connection."
      />

      <EditConnectionDialog
        open={openViewModal}
        onOpenChange={setOpenViewModal}
        selectedItem={selectedItem}
        onSubmitData={handleSubmit}
        formLoading={formLoading}
      />
    </>
  );
};

export default ConnectionsList;
