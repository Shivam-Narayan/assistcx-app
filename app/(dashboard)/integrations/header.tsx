"use client";
import { MultiSelectComboBox } from "@/components/custom-combobox/custom-multi-select-combobox";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import React, { useState } from "react";

const frameworks = [
  {
    value: "file_management",
    label: "File Management",
  },
  {
    value: "cloud_storage",
    label: "Cloud Storage",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "language_model",
    label: "Language Model",
  },
  {
    value: "data_storage",
    label: "Data Storage",
  },
];

interface IntegrationHeaderProps {
  filterText: string[];
  onFilterChange: (val: string[]) => void;
  searchText: string;
  setSearchText: (val: string) => void;
}

const IntegrationHeader = ({
  filterText,
  onFilterChange,
  searchText,
  setSearchText,
}: IntegrationHeaderProps) => {
  const [open, setOpen] = useState(false);
  const selected = frameworks.filter((f) => filterText.includes(f.value));

  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight">
          Integrations{" "}
        </h2>
        <div className="flex items-center gap-3 justify-between">
          <div className="relative grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <MultiSelectComboBox
            displayMode="pills"
            items={frameworks}
            value={filterText}
            onChange={onFilterChange}
            placeholder="Filter Categories"
            searchPlaceholder="Filter Categories..."
            buttonClassName="w-44"
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default IntegrationHeader;
