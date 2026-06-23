"use client";

import { FormProvider } from "react-hook-form";

/* Layout & Structural Components */
import AgentFormSkeleton from "./components/agent-form-skeleton";
import AgentHeader from "./components/agent-header";
import { AgentSidebar } from "./components/agent-sidebar";

/* Tab Sections */
import IdentitySection from "./sections/identity-section";
import ContextSection from "./sections/context-section";
import PlanningSection from "./sections/planning-section";
import SettingsSection from "./sections/settings-section";
import ToolsSection from "./sections/tools-section";
import ResponseSchemaSection from "./sections/response-schema-section";

/* Hook */
import { useManageAgent } from "./hook/useManageAgent";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** All available tab keys in the agent configuration sidebar. */
type AgentTab =
  | "profile"
  | "tools"
  | "context"
  | "planning"
  | "output"
  | "settings";

/** Maps each tab key to its corresponding section component. */
const SECTION_MAP: Record<
  AgentTab,
  React.ComponentType<{ isEditing: boolean }>
> = {
  profile: IdentitySection,
  tools: ToolsSection,
  context: ContextSection,
  planning: PlanningSection,
  output: ResponseSchemaSection,
  settings: SettingsSection,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * `ManageAgent` is the top-level page component for creating and editing agents.
 *
 * Responsibilities:
 * - Owns the form context (via `FormProvider`) shared across all child sections
 * - Renders the sticky header, collapsible sidebar, and the active tab section
 * - Delegates all business logic to `useManageAgent`
 *
 */
const ManageAgent = () => {
  const {
    methods,
    isEditing,
    isSaved,
    isDirty,
    setIsEditing,
    handleBack,
    handleCancel,
    handleDiscard,
    dirtyFields,
    onPublish,
    handleImportAgent,
    setInSideDropImport,
    handleRestoreVersionData,
    currentSelectedVersion,
    setCurrentSelectedVersion,
    isImportLoading,
    activeTab,
    setActiveTab,
    isAgentLoading,
  } = useManageAgent();

  /**
   * Resolves the active section component from the tab map.
   * Falls back to `IdentitySection` for any unknown tab value.
   */
  const ActiveSection = SECTION_MAP[activeTab as AgentTab] ?? IdentitySection;

  // Show a skeleton placeholder while the agent data is being fetched
  if (isAgentLoading) {
    return (
      <FormProvider {...methods}>
        <AgentFormSkeleton />
      </FormProvider>
    );
  }

  return (
    /**
     * `FormProvider` makes the `methods` object (from react-hook-form)
     * available to all deeply nested child components via `useFormContext`.
     * This avoids prop-drilling form state through every section.
     */
    <FormProvider {...methods}>
      <form className="relative flex flex-col h-screen overflow-hidden">
        {/* Sticky top bar: navigation, agent name, publish/edit actions */}
        <AgentHeader
          isEditing={isEditing}
          isSaved={isSaved}
          isDirty={isDirty}
          setIsEditing={setIsEditing}
          onBack={handleBack}
          onCancel={handleCancel}
          onDiscard={handleDiscard}
          dirtyFields={dirtyFields}
          onPublish={onPublish}
          onImportAgent={handleImportAgent}
          setInSideDropImport={setInSideDropImport}
          handleRestoreVersionData={handleRestoreVersionData}
          currentSelectedVersion={currentSelectedVersion}
          setCurrentSelectedVersion={setCurrentSelectedVersion}
          isImportLoading={isImportLoading}
        />

        {/* Main content: sidebar navigation + active section */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar: tab navigation between agent config sections */}
          <AgentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Scrollable content area for the active tab section */}
          <div className="flex-1 p-3 xl:p-6 overflow-auto w-full">
            <div className="w-full max-w-(--breakpoint-md) mx-auto text-foreground/90">
              <ActiveSection isEditing={isEditing} />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ManageAgent;
