"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorMessageHandler } from "@/helper/helper-function";
import { setBuilderAgentData } from "@/lib/agent-builder-store";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { setSearchAgentText } from "@/redux/agents/agent-search-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import {
  ArrowLeft,
  Bot,
  BotIcon,
  CloudUpload,
  Loader,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { lazy, Suspense, useState } from "react";
import { useDispatch } from "react-redux";
import AgentBuilderForm from "./agent-builder/agent-builder-form";
import ImportAgentComponent from "./manage-agent/components/import-agent";
import { mapAgentToForm } from "./manage-agent/helper/helper";

const CreateAgentMenuCard = lazy(() => import("./create-agent-menu-card"));

export interface ToolbarProps {
  refreshData?: () => void;
  activeTab?: string;
  setActiveTab: (activeTab: string) => void;
}

interface FileUpload {
  File: File;
}

const Toolbar = ({ refreshData, activeTab, setActiveTab }: ToolbarProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchAgents = useAppSelector(
    (state) => state?.searchAgentReducer?.searchText,
  );

  const [isLoading, setLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importAgent, setImportAgent] = useState(false);
  const [agentBuilder, setAgentBuilder] = useState(false);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const isCreateAgents = canEdit(permissions, "agents");

  const handleStartFromScratch = () => {
    router.push("/agents/manage-agent");
  };

  const handleSearch = (text: string) => {
    dispatch(setSearchAgentText(text));
  };

  const handleImportAgent = (filesToUpload: FileUpload[]) => {
    filesToUpload.forEach((fileUploaded) => {
      setLoading(true);
      const file = fileUploaded.File;
      if (file.type.includes("application/json") && file.size > 0 && !loading) {
        const reader = new FileReader();

        reader.onload = async (event) => {
          const fileContent = event.target?.result as string;

          if (!fileContent.trim()) {
            errorMessageHandler(
              "The file is empty or contains only whitespace.",
            );
            setLoading(false);
            return;
          }
          try {
            const jsonContent = JSON.parse(fileContent);

            // Check if jsonContent is a valid JSON object or array
            if (
              (typeof jsonContent === "object" &&
                !Object.keys(jsonContent).length) ||
              (Array.isArray(jsonContent) && jsonContent.length === 0)
            ) {
              errorMessageHandler("The JSON content is empty.");
              setLoading(false);
              return;
            }

            // Ensure jsonContent is a valid array or object
            if (
              !(typeof jsonContent === "object" && jsonContent !== null) &&
              !Array.isArray(jsonContent)
            ) {
              errorMessageHandler("Invalid JSON format.");
              setLoading(false);
              return;
            }

            //  handlePrefillAgentPage(jsonContent);
            const mappedData = mapAgentToForm(jsonContent, "ACTIVE");
            setBuilderAgentData(mappedData);
            router.push("/agents/manage-agent");
          } catch (error: any) {
            if (typeof error?.response?.data?.detail === "string") {
              errorMessageHandler(error?.response?.data?.detail);
            } else {
              errorMessageHandler("Invalid JSON or JSON file");
            }
            setLoading(false);
          } finally {
            // refreshData?.();
            setLoading(false);
            setIsImportModalOpen(false);
          }
        };

        reader.readAsText(file);
      } else {
        errorMessageHandler("Please upload a valid JSON file.");
        setLoading(false);
      }
    });
  };

  return (
    <React.Fragment>
      <div className="flex flex-col lg:flex-row gap-2 justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight leading-normal">
            Agents
          </h2>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`h-9 bg-primary/10 border border-primary/20 `}>
              <TabsTrigger
                value="active"
                className={`px-4 cursor-pointer transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground `}
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className={`px-4 cursor-pointer transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground `}
              >
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3 justify-between">
          <div className="relative grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="Search..."
              value={searchAgents}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchAgents && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isCreateAgents && (
            <Button
              className="cursor-pointer"
              onClick={() => {
                setIsImportModalOpen(true);
                setImportAgent(false);
                setAgentBuilder(false);
              }}
            >
              <Bot className="h-4 w-4" />
              Create Agent
            </Button>
          )}
        </div>
      </div>

      {isImportModalOpen && (
        <>
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogContent className="flex flex-col max-h-[85vh] overflow-hidden gap-2 sm:max-w-2xl p-0">
              <DialogHeader className="sticky top-0 z-10 flex flex-row justify-between items-start space-y-0 bg-background px-6 pt-6 pb-2 ">
                <div className="w-full flex flex-col gap-2">
                  <DialogTitle className="flex items-center">
                    {(importAgent || agentBuilder) && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="mr-4 cursor-pointer"
                        onClick={() => {
                          if (importAgent) setImportAgent(false);
                          if (agentBuilder) setAgentBuilder(false);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}

                    {importAgent
                      ? "Import Agent"
                      : agentBuilder
                        ? "Agent Builder"
                        : "Create Agent"}
                  </DialogTitle>
                  {!importAgent && !agentBuilder && (
                    <DialogDescription>
                      Create and deploy agents effortlessly: start fresh, import
                      an existing configuration, or use the guided builder for
                      quick setup.
                    </DialogDescription>
                  )}
                </div>
                <DialogClose>
                  <div
                    className="p-1 rounded-md cursor-pointer hover:bg-secondary"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportAgent(false);
                      setAgentBuilder(false);
                    }}
                  >
                    <X />
                  </div>
                </DialogClose>
              </DialogHeader>

              {importAgent ? (
                <ImportAgentComponent
                  isOpen={isImportModalOpen}
                  onClose={setIsImportModalOpen}
                  handleImportAgent={handleImportAgent}
                  isLoading={isLoading}
                  isPopup={false}
                  buttonText={"Import Agent"}
                />
              ) : agentBuilder ? (
                <div className="overflow-y-auto px-1 pb-4 max-h-[70vh]">
                  <AgentBuilderForm />
                </div>
              ) : (
                <div className="pt-4 px-6 pb-6">
                  <Suspense
                    fallback={
                      <main className="flex flex-1 items-center justify-center">
                        <Loader className="h-10 w-10 animate-spin text-primary" />
                      </main>
                    }
                  >
                    <div className="flex flex-col gap-4 ">
                      <CreateAgentMenuCard
                        onClick={handleStartFromScratch}
                        icon={<BotIcon className="h-5 w-5" />}
                        title="Start From Scratch"
                        description="Build a new agent step-by-step by defining its persona, tools, knowledge sources, planning steps, expected output structure and storage settings."
                      />
                      <CreateAgentMenuCard
                        onClick={() => setImportAgent(true)}
                        icon={<CloudUpload className="h-5 w-5" />}
                        title="Import Agent"
                        description="Bring in a ready-made agent by uploading its JSON configuration file to get started right away."
                      />
                      <CreateAgentMenuCard
                        onClick={() => setAgentBuilder(true)}
                        icon={<Sparkles className="h-5 w-5" />}
                        title="Agent Builder"
                        description="Quickly build an agent by entering your business usecase and essential tools, the builder will handle the basic setup and initial configuration for you."
                      />
                    </div>
                  </Suspense>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </React.Fragment>
  );
};

export default Toolbar;
