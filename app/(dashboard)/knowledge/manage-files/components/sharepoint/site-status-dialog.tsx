"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Link } from "lucide-react";

type props = {
  sitesStatus: any;
  setSitesStatus: any;
};

export default function SitesStatusDialog({
  sitesStatus,
  setSitesStatus,
}: props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sitesStatus?.unsuccessful_downloads?.length > 0) {
      setOpen(true);
    }
  }, [sitesStatus]);

  const handleClose = () => {
    setOpen(false);
    setSitesStatus({ successful_downloads: [], unsuccessful_downloads: [] });
  };

  if (!sitesStatus) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Inaccessible Items</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
          {sitesStatus.unsuccessful_downloads.map((site: any, idx: number) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-gray-900">{site.name}</p>
              <p className="text-xs text-red-600 mt-1">{site.error}</p>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} className="cursor-pointer">
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
