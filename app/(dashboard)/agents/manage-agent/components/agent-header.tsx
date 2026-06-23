"use client";

import {
  Archive,
  ArrowLeft,
  CloudDownload,
  CloudUpload,
  MoreVertical,
  Pencil,
  Save,
  SquareCode,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

/* Constants */
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";

/* Helpers */
import {
  errorMessageHandler,
  firstLetterCapital,
  successMessageHandler,
} from "@/helper/helper-function";

/* Hooks */
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";

/* Assets */
import DefaultIcon from "@/public/icon1.png";

/* Schemas */
import { AgentFormValues } from "../schemas/agent-schema";

/* UI Components */
import { ConfirmationDialog } from "@/components/confirmation-modal";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* Feature Components */
import VersionHistory from "@/components/version-history/version-history-page";
import ImportAgentComponent from "./import-agent";
import AgentConfigView from "./agent-config-view";
import { PublishConfirmationDialog } from "./publish-confirmation-dialog";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FileUpload {
  File: File;
}

/** Fields for marking as dirty. */
type DirtySection =
  | "identity"
  | "tools"
  | "knowledge"
  | "data_tables"
  | "planning"
  | "response_schema"
  | "settings";

/** Display labels for each dirty section. */
const DIRTY_SECTION_LABELS: Record<DirtySection, string> = {
  identity: "Identity",
  tools: "Tools",
  knowledge: "Context",
  data_tables: "Context",
  planning: "Planning",
  response_schema: "Output",
  settings: "Settings",
};

interface AgentHeaderProps {
  isEditing: boolean;
  isSaved: boolean;
  isDirty: boolean;
  setIsEditing: (value: boolean) => void;
  onBack: () => void;
  onCancel: () => void;
  onDiscard: () => void;
  /** react-hook-form dirtyFields object */
  dirtyFields: Partial<Record<DirtySection, unknown>>;
  onPublish: () => Promise<boolean>;
  onImportAgent: (files: FileUpload[]) => void;
  setInSideDropImport: (value: boolean) => void;
  handleRestoreVersionData: (data: unknown, currentJson: unknown) => void;
  currentSelectedVersion: string;
  setCurrentSelectedVersion: (value: string) => void;
  isImportLoading: boolean;
}

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────

/**
 * Recursively checks whether any field inside a react-hook-form
 * `dirtyFields` subtree is marked as `true`.
 */
function hasDirtyFields(obj: unknown): boolean {
  if (!obj) return false;
  if (Array.isArray(obj)) return obj.some(hasDirtyFields);
  if (typeof obj === "object")
    return Object.values(obj as Record<string, unknown>).some(hasDirtyFields);
  return obj === true;
}

/**
 * Derives a human-readable list of section names that have unsaved changes.
 */
function getDirtySectionLabels(
  dirtyFields: AgentHeaderProps["dirtyFields"],
): string[] {
  return (Object.entries(DIRTY_SECTION_LABELS) as [DirtySection, string][])
    .filter(([key]) => hasDirtyFields(dirtyFields[key]))
    .map(([, label]) => label);
}

// ─────────────────────────────────────────────
// Sub-component: Agent icon
// ─────────────────────────────────────────────

/** Renders either an inline SVG icon or a fallback PNG image. */
function AgentIcon({ src }: { src: string | undefined }) {
  if (typeof src === "string" && src.startsWith("<svg")) {
    return (
      <div
        className="w-8 h-8 p-1.5 rounded-md text-primary bg-primary/10 flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: src }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="w-8 h-8 p-1.5 rounded-md bg-primary/10 flex items-center justify-center">
      <Image
        src={DefaultIcon}
        alt="Agent icon"
        width={20}
        height={20}
        className="object-cover"
        priority
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-component: Dirty sections list
// ─────────────────────────────────────────────

/** Renders a bullet list of section names that have pending changes. */
function DirtySectionList({ sections }: { sections: string[] }) {
  if (!sections.length) return null;
  return (
    <ul className="list-disc pl-6">
      {sections.map((label) => (
        <li key={label}>{firstLetterCapital(label)}</li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const AgentHeader = ({
  isEditing,
  isSaved,
  isDirty,
  setIsEditing,
  onBack,
  onCancel,
  onDiscard,
  dirtyFields,
  onPublish,
  onImportAgent,
  setInSideDropImport,
  handleRestoreVersionData,
  currentSelectedVersion,
  setCurrentSelectedVersion,
  isImportLoading,
}: AgentHeaderProps) => {
  const { axiosAuth, loading: isAxiosLoading } = useAxiosAuth();
  const searchParams = useSearchParams();

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const canEditAgent = canEdit(permissions, "agents");

  /** UUID is present only when editing an existing agent, null for new agents. */
  const uuid = searchParams?.get("uuid");
  const isEditMode = Boolean(uuid);

  const { getValues, setValue, trigger } = useFormContext<AgentFormValues>();
  const {
    formState: { errors },
  } = useFormContext<AgentFormValues>();

  const formData = getValues();
  const identity = getValues("identity");
  const { name, icon } = identity || {};

  const agentIconSrc = getIconSvg(
    typeof icon === "string" ? icon : "",
    "agent_icons",
  );

  /* Dirty section names for display in confirmation dialogs */
  const dirtySectionLabels = getDirtySectionLabels(dirtyFields);

  // ── Modal / Dropdown State ──────────────────
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modals, setModals] = useState({
    discard: false,
    back: false,
    publish: false,
    export: false,
    archive: false,
    import: false,
    configView: false,
  });

  /** Helper to open/close a specific modal by key. */
  const setModal = useCallback(
    (key: keyof typeof modals, value: boolean) =>
      setModals((prev) => ({ ...prev, [key]: value })),
    [],
  );

  // ── Refs ────────────────────────────────────
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** Close the dropdown when the user clicks outside it. */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ────────────────────────────────

  /**
   * Validates the identity tab before showing the publish confirmation.
   * Shows a toast error if required identity fields are missing.
   */
  const handlePublishClick = async () => {
    const isValid = await trigger("identity");
    if (!isValid) {
      toast.error("Missing required fields in identity tab");
      return;
    }
    setModal("publish", true);
  };

  /** Confirms publishing: full-form validate + API; keep modal open on validation/API failure. */
  const handlePublishConfirm = async () => {
    const ok = await onPublish();
    if (ok) setModal("publish", false);
  };

  /** Confirms discard: calls parent handler, closes modal. */
  const handleDiscardConfirm = () => {
    onDiscard();
    setModal("discard", false);
  };

  /**
   * Navigates back; shows a confirmation modal if there are unsaved changes
   * in edit mode so the user doesn't accidentally lose work.
   */
  const handleBackClick = () => {
    if (isSaved && isEditing && isDirty) {
      setModal("back", true);
    } else {
      onBack();
    }
  };

  /**
   * Downloads the agent configuration as a JSON file.
   * Uses a temporary anchor element to trigger the browser's save dialog.
   */
  const handleExportAgent = async () => {
    if (isAxiosLoading || !uuid) return;

    try {
      const response = await axiosAuth.get(
        `${url.AGENTS_EXPORT}/${uuid}/export`,
      );

      if (response.status === 200) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: "application/json",
        });
        const blobUrl = URL.createObjectURL(blob);

        // Programmatically trigger file download
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = `${name ?? "agent"}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(blobUrl); // free memory

        setModal("export", false);
        successMessageHandler(messages.agent_export_successfully);
      }
    } catch (error) {
      errorMessageHandler(error);
      setModal("export", false);
    }
  };

  /**
   * Archives the agent. After a successful archive, the page is reloaded
   * to reflect the updated status in all dependent UI.
   */
  const handleArchiveAgent = async () => {
    if (isAxiosLoading || !uuid) return;

    try {
      const response = await axiosAuth.post(url.AGENTS_ARCHIVE, {
        agent_ids: [uuid],
      });

      if (response.status === 200) {
        setValue("status", "ARCHIVED");
        setModal("archive", false);
        successMessageHandler(messages.agent_archive_successfully);
        window.location.reload();
      }
    } catch (error) {
      errorMessageHandler(error);
      setModal("archive", false);
    }
  };

  /** Handles a completed import: closes the import drawer and delegates to parent. */
  const handleImportComplete = (files: FileUpload[]) => {
    onImportAgent(files);
    setModal("import", false);
  };

  const showEditButton =
    canEditAgent && isSaved && !isEditing && formData?.status !== "ARCHIVED";

  const showVersionHistory = isEditMode && !isEditing;

  // ── Render ───────────────────────────────────

  return (
    <>
      {/* ── Sticky Header Bar ── */}
      <div className="py-2 sticky top-0 z-10 border-b border-gray-200 bg-white dark:bg-background">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-6 h-auto sm:h-12 bg-white dark:bg-background gap-2 py-2">
          {/* Left: Back button, icon, agent name, version badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 flex-1 min-w-0">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={handleBackClick}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <AgentIcon src={agentIconSrc} />

            <div className="flex items-center gap-2 min-w-0 truncate flex-wrap">
              <span className="font-medium text-2xl">{name || "Untitled"}</span>
              {formData?.status === "ARCHIVED" && (
                <Badge
                  variant="outline"
                  className="text-sm px-2 py-0.5 ml-2 bg-slate-200 "
                >
                  Archived
                </Badge>
              )}
              {currentSelectedVersion && (
                <Badge variant="secondary" className="ml-0">
                  {currentSelectedVersion}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Action buttons and overflow menu */}
          <div className="flex items-center gap-3 relative">
            {/* Version history — only shown in edit mode when not actively editing */}
            {showVersionHistory && (
              <VersionHistory
                currentJson={formData}
                entityType="agent"
                entityId={uuid!}
                isRestoreVersionAllowed={
                  canEditAgent && formData?.status !== "ARCHIVED"
                }
                handleRestoreVersionData={handleRestoreVersionData}
                className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer"
                setCurrentSelectedVersion={setCurrentSelectedVersion}
              />
            )}

            {/* Import button — only shown for unsaved agents */}
            {canEditAgent && !isSaved && (
              <ConditionalTooltip
                content="Import"
                alwaysShow={true}
                align="center"
                side="bottom"
                showArrow={true}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModal("import", true)}
                  className="cursor-pointer gap-2 py-1.5 border border-muted-foreground/40"
                  aria-label="Import agent"
                >
                  <Upload size={20} />
                </Button>
              </ConditionalTooltip>
            )}

            {/* ── Conditional action buttons based on state ── */}

            {/* New agent: Publish button only */}
            {canEditAgent && !isSaved && (
              <Button
                className="cursor-pointer"
                type="button"
                onClick={handlePublishClick}
              >
                <Save className="h-4 w-4" />
                Publish
              </Button>
            )}

            {/* Saved + not editing: Edit button */}
            {showEditButton && (
              <Button
                className="cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}

            {/* Saved + editing: Publish + Discard/Cancel */}
            {canEditAgent && isSaved && isEditing && (
              <>
                <Button
                  className="cursor-pointer"
                  type="button"
                  onClick={handlePublishClick}
                >
                  <Save className="h-4 w-4" />
                  Publish
                </Button>

                {isDirty ? (
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={() => setModal("discard", true)}
                  >
                    Discard
                  </Button>
                ) : (
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}

            {/* ── Overflow dropdown menu (edit mode only) ── */}
            {isEditMode && (
              <div className="relative" ref={dropdownRef}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen((prev) => !prev);
                  }}
                  className="cursor-pointer p-2 rounded-md transition-colors"
                  aria-label="More options"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </Button>

                {isDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                  >
                    {/* View JSON config */}
                    <button
                      type="button"
                      role="menuitem"
                      className="cursor-pointer flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-muted"
                      onClick={() => {
                        setModal("configView", true);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <SquareCode className="h-4 w-4" />
                      View Config
                    </button>

                    {/* Export agent as JSON */}
                    {canEditAgent && (
                      <button
                        type="button"
                        role="menuitem"
                        className="cursor-pointer flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-muted"
                        onClick={() => {
                          setModal("export", true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <CloudDownload className="h-4 w-4" />
                        Export Agent
                      </button>
                    )}

                    {/* Import agent — only available while editing */}
                    {canEditAgent && isEditing && (
                      <button
                        type="button"
                        role="menuitem"
                        className="cursor-pointer flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => {
                          setModal("import", true);
                          setInSideDropImport(true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <CloudUpload className="h-4 w-4" />
                        Import Agent
                      </button>
                    )}

                    {/* Archive — hidden if already archived */}
                    {canEditAgent && formData.status !== "ARCHIVED" && (
                      <button
                        type="button"
                        role="menuitem"
                        className="cursor-pointer flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-muted"
                        onClick={() => {
                          setModal("archive", true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Archive className="h-4 w-4" />
                        Archive Agent
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Discard Changes Modal ── */}
      <ConfirmationDialog
        open={modals.discard}
        confirm={handleDiscardConfirm}
        cancel={() => setModal("discard", false)}
        title="Discard changes?"
        description="This will permanently discard all unsaved changes. This action cannot be undone."
        customContent={<DirtySectionList sections={dirtySectionLabels} />}
      />

      {/* ── Navigate Back with Unsaved Changes Modal ── */}
      <ConfirmationDialog
        open={modals.back}
        confirm={() => {
          setModal("back", false);
          onBack();
        }}
        cancel={() => setModal("back", false)}
        title="Leave without saving?"
        description="You have unsaved changes in the following sections. Going back will discard them."
        customContent={<DirtySectionList sections={dirtySectionLabels} />}
      />

      {/* ── Publish Confirmation Modal ── */}
      <PublishConfirmationDialog
        open={modals.publish}
        confirm={handlePublishConfirm}
        cancel={() => setModal("publish", false)}
        title="Publish changes?"
        description="This will save and publish all changes to the agent configuration, creating a new version. This action cannot be undone."
      />

      {/* ── JSON Config Viewer ── */}
      <AgentConfigView
        openConfigView={modals.configView}
        onOpenConfigView={(val) => setModal("configView", val)}
        agentData={formData}
      />

      {/* ── Export Agent Modal ── */}
      <ConfirmationDialog
        open={modals.export}
        confirm={handleExportAgent}
        cancel={() => setModal("export", false)}
        title="Export agent?"
        description="This will download a JSON file containing the full agent configuration. You can use it to deploy the agent in any environment."
      />

      {/* ── Archive Agent Modal ── */}
      <ConfirmationDialog
        open={modals.archive}
        confirm={handleArchiveAgent}
        cancel={() => setModal("archive", false)}
        title="Archive agent?"
        description="Archiving will deactivate this agent and remove it from the active list. You can review it anytime from the archive section."
      />

      {/* ── Import Agent Drawer ── */}
      <ImportAgentComponent
        isOpen={modals.import}
        onClose={() => setModal("import", false)}
        handleImportAgent={handleImportComplete}
        isLoading={isImportLoading}
        buttonText="Import Agent"
      />
    </>
  );
};

export default AgentHeader;
