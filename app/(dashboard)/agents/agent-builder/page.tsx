"use client";

import { ConfirmationDialog } from "@/components/confirmation-modal";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import { Button } from "@/components/ui/button";
import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import {
  clearBuilderAgentData,
  getBuilderAgentData,
  setBuilderAgentData,
} from "@/lib/agent-builder-store";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { resetAgentBuilderForm } from "@/redux/agents/agent-builder-Slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as z from "zod";
import useGetAllToolList from "../Hook/useGetAllTools";
import { mapAgentToForm } from "../manage-agent/helper/helper";
import AgentBuildingLoader from "./agent-builder-loader";
import { AgentInformationCard } from "./components/agent-information-card";
import { AgentPreviewCard } from "./components/agent-preview-card";
import { OptimizationCard } from "./components/optimization-card";
import { ToolsManagementCard } from "./components/tools-management-card";

const RefineFormSchema = z.object({
  tools: z
    .array(
      z.object({
        name: z.string(),
        action: z.string(),
        description: z.string().optional(),
        selection: z.boolean().optional(),
        api_type: z.string().optional(),
        icon: z.string().optional(),
        integration_key: z.string().optional(),
        is_default: z.boolean().optional(),
      }),
    )
    .optional(),
  refinementText: z.string().optional(),
});

export type RefineFormValues = z.infer<typeof RefineFormSchema>;

const AgentBuilderPage = () => {
  const router = useRouter();
  const { axiosAuth } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [builderData, setBuilderData] = useState<any>(() =>
    getBuilderAgentData(),
  );
  const persistBuilderData = useCallback((data: any) => {
    setBuilderAgentData(data);
    setBuilderData(data);
  }, []);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [openFinalizeConfirmation, setOpenFinalizeConfirmation] =
    useState<boolean>(false);
  const hasInitialized = useRef(false);
  const agentBuilderformData = useAppSelector(
    (state) => state.agentBuilderFormReducer,
  );
  const agentBasicInfor = useAppSelector(
    (state) => state.agentBasicInfoReducer.agentBasicInfoReducer?.value,
  );
  const agentRules = useAppSelector(
    (state) => state.agentRulesReducer.agentRulesReducer?.value,
  );
  const agentPlanningSteps = useAppSelector(
    (state) => state.agentPlanningReducer.agentPlanningReducer?.steps ?? [],
  );
  const agentOutputFields = useAppSelector(
    (state) => state.agentOutputReducer.agentOutputReducer?.value ?? [],
  );
  const [toolsPreviewList, setToolsPreviewList] = useState<any>([]);
  const [refineLoading, setRefineLoading] = useState(false);
  const { allToolsList } = useGetAllToolList();
  const [currentOptimization, setCurrentOptimization] = useState("");
  const [optimizationHistory, setOptimizationHistory] = useState<
    Array<{ id: number | string; prompt: string; timestamp?: string }>
  >([]);
  const defaultIcon = getIconSvg("shapes", "agent_icons");

  const RefineForm = useForm<RefineFormValues>({
    resolver: zodResolver(RefineFormSchema),
    defaultValues: {
      tools: [],
      refinementText: "",
    },
    mode: "onChange",
  });

  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);

    // increase progress until it reaches 90
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval.current!);
          return 90;
        }
        return prev + 1;
      });
    }, 80);
  };

  const handleFinalize = () => {
    try {
      startTransition(() => {
        router.push("/agents/manage-agent");
      });
    } catch (error) {
      console.error("Finalize failed:", error);
    }
  };

  const selectedTools = useMemo(() => {
    return RefineForm.watch("tools") || [];
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RefineForm.watch("tools")]);

  const [finalToolList, setFinalToolList] = useState<any>([]);

  useEffect(() => {
    setFinalToolList(selectedTools);
  }, [selectedTools]);

  const handleRefineSubmit = async (refinementText?: string) => {
    const textToSubmit = refinementText || currentOptimization;
    if (!textToSubmit?.trim()) return;

    setRefineLoading(true);
    startProgress();
    try {
      const toolsPayload = (finalToolList || []).map((tool: any) => ({
        name: tool.name,
        action: tool.action,
      }));

      const payload = {
        name: agentBuilderformData.agentName,
        business_usecase: agentBuilderformData.business_usecase,
        tools: toolsPayload,
        user_instructions: textToSubmit.trim(),
      };

      const result = await axiosAuth.post(url.AGENT_BUILDER, payload);

      if (result.status === 200) {
        const mappedData = mapAgentToForm({
          icon: defaultIcon,
          ...result.data,
        });

        persistBuilderData(mappedData);

        const newTools =
          result.data?.tools?.map((tool: any) => ({
            name: tool.name,
            action: tool.action,
            description: tool.description,
            selection: tool.selection,
            api_type: tool.api_type,
            icon: tool.icon,
            integration_key: tool.integration_key,
            is_default: tool.is_default,
          })) || [];
        setToolsPreviewList(newTools);
        setProgress(100);

        setOptimizationHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            prompt: textToSubmit,
            timestamp: new Date().toISOString(),
          },
        ]);

        setCurrentOptimization("");
        RefineForm.setValue("refinementText", "");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      errorMessageHandler(error);
    } finally {
      setRefineLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  useEffect(() => {
    if (agentBasicInfor || agentRules || agentBuilderformData?.tools) {
      const formattedTools =
        agentBuilderformData?.tools?.map((tool: any) => ({
          name: tool.label || tool.name,
          action: tool.value || tool.action,
          description: tool.description,
          icon: tool.icon,
          integration_key: tool.integration_key,
          is_default: tool.is_default,
        })) || [];

      const builderSource = {
        ...agentBasicInfor,
        ...agentRules,
        tools: formattedTools,
        plan: agentPlanningSteps,
        response_schema: agentOutputFields,
      };

      const formattedRules =
        builderSource?.rules?.map((r: any) => r?.rule ?? r) || [];

      const formattedSuccessCriteria =
        builderSource?.success_criteria?.map((c: any) => c?.criterion ?? c) ||
        [];

      const finalData = {
        icon: defaultIcon,
        name: builderSource?.name,
        goal: builderSource?.goal,
        style: builderSource?.style,
        description: builderSource?.description,
        instructions: builderSource?.instructions,
        rules: formattedRules,
        success_criteria: formattedSuccessCriteria,
        tools: formattedTools,
        plan: agentPlanningSteps,
        response_schema: agentOutputFields,
      };

      persistBuilderData(mapAgentToForm(finalData));
    }
  }, [
    agentBasicInfor,
    agentRules,
    agentBuilderformData?.tools,
    agentPlanningSteps,
    agentOutputFields,
    persistBuilderData,
  ]);

  useEffect(() => {
    if (!hasInitialized.current && agentBuilderformData?.tools?.length) {
      const formattedTools = agentBuilderformData.tools.map((tool: any) => ({
        name: tool.label || tool.name,
        action: tool.value || tool.action,
        description: tool.description,
        selection: tool.selection,
        api_type: tool.api_type,
        icon: tool.icon,
        integration_key: tool.integration_key,
        is_default: tool.is_default,
      }));

      RefineForm.reset({
        ...RefineForm.getValues(),
        tools: formattedTools,
      });
      hasInitialized.current = true;
    }
  }, [agentBuilderformData?.tools, RefineForm]);

  const apiResponseTools = useMemo(() => {
    return agentBuilderformData?.tools ?? builderData?.tools ?? [];
  }, [agentBuilderformData?.tools, builderData?.tools]);

  const enrichedApiTools = useMemo(() => {
    return apiResponseTools
      .map((selectedTool: any) => {
        const toolAction = selectedTool.value || selectedTool.action;
        const fullToolData = allToolsList?.find(
          (item) => item.action === toolAction,
        );

        return {
          name: selectedTool.name || fullToolData?.name || "",
          action: toolAction,
          description:
            selectedTool.description || fullToolData?.description || "",
          selection: false,
          api_type: selectedTool.api_type || fullToolData?.api_type || "REST",
          icon: selectedTool.icon || fullToolData?.icon,
          integration_key:
            selectedTool.integration_key || fullToolData?.integration_key || "",
          is_default:
            selectedTool.is_default ?? fullToolData?.is_default ?? false,
        };
      })
      .filter(Boolean);
  }, [apiResponseTools, allToolsList]);

  const enrichToolsPreviewList = (
    toolsPreviewList: any[],
    allToolsList: any[],
  ) => {
    return toolsPreviewList.map((tool: any) => {
      const fullTool = allToolsList?.find((item) => {
        return item.action === tool.action;
      });

      return {
        name: tool.name || fullTool?.name || "",
        action: tool.action,
        description: tool.description || fullTool?.description || "",
        selection: false,
        api_type: tool.api_type || fullTool?.api_type || "REST",
        icon: tool.icon || fullTool?.icon,
        integration_key:
          tool.integration_key || fullTool?.integration_key || "",
        is_default: tool.is_default ?? fullTool?.is_default ?? false,
      };
    });
  };

  const formattedToolsPreviewList = useMemo(() => {
    return enrichToolsPreviewList(toolsPreviewList, allToolsList);
  }, [toolsPreviewList, allToolsList]);

  const previewAgentConfig = {
    name: agentBuilderformData.agentName || "Untitled Agent",
    businessUsecase: agentBuilderformData.business_usecase || "",
    description:
      builderData?.profile?.description || agentBasicInfor?.description || "",
    instructions:
      builderData?.profile?.instructions || agentRules?.instructions || "",
    agentRules: (builderData?.profile?.rules || agentRules?.rules || [])
      .map((rule: any) => (typeof rule === "string" ? rule : rule?.rule || ""))
      .filter(Boolean),
    successCriteria: (
      builderData?.profile?.success_criteria ||
      agentRules?.success_criteria ||
      []
    )
      .map((criteria: any) =>
        typeof criteria === "string" ? criteria : criteria?.criteria || "",
      )
      .filter(Boolean),
    planningSteps: builderData?.planning?.length
      ? builderData.planning
      : agentPlanningSteps,
    outputFields: builderData?.output?.length
      ? builderData.output
      : agentOutputFields,
    tools:
      formattedToolsPreviewList.length > 0
        ? formattedToolsPreviewList
        : enrichedApiTools,
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-xs">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={() => setOpenConfirmation(true)}
                disabled={isLoadingAgent}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-primary/80 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-base xl:text-xl font-semibold text-slate-900">
                AI Agent Builder
              </h1>
              {isLoadingAgent && (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground 
  `}
                >
                  <span className="flex items-center justify-center h-4 w-4">
                    <JumpingLoadingAnimation color={"bg-primary-foreground"} />
                  </span>
                  <span>Building Agent...</span>
                </span>
              )}
            </div>
            <Button
              className="px-6 py-2.5 gap-2 cursor-pointer bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              onClick={() => setOpenFinalizeConfirmation(true)}
              disabled={isLoadingAgent || refineLoading}
            >
              {refineLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {refineLoading ? "Refining…" : "Finalize"}
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="mx-auto px-6 py-6 xl:px-8 xl:py-8 ">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-134px)]">
            {/* LEFT COLUMN - Configuration */}
            <div className="lg:col-span-5  overflow-auto">
              <div className="h-full space-y-6 overflow-auto">
                <AgentInformationCard
                  agentName={agentBuilderformData.agentName}
                  businessUsecase={agentBuilderformData.business_usecase}
                />

                <ToolsManagementCard
                  selectedTools={finalToolList}
                  setSelectedTools={(value: any) =>
                    RefineForm.setValue("tools", value)
                  }
                  isLoading={isLoadingAgent || refineLoading}
                  allToolsList={allToolsList}
                />

                <OptimizationCard
                  currentOptimization={currentOptimization}
                  setCurrentOptimization={setCurrentOptimization}
                  optimizationHistory={optimizationHistory}
                  onAddOptimization={() => handleRefineSubmit()}
                  isLoading={isLoadingAgent || refineLoading}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Agent Preview */}
            <div className="lg:col-span-7 space-y-6 flex flex-col overflow-auto  ">
              {isLoadingAgent || refineLoading ? (
                <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col flex-1 items-center justify-center">
                  <AgentBuildingLoader
                    progress={progress}
                    progressText={
                      progress < 95
                        ? "Configuring the agent..."
                        : progress < 100
                          ? "Finalizing the agent..."
                          : "Complete!"
                    }
                  />
                </div>
              ) : (
                <AgentPreviewCard agentConfig={previewAgentConfig} />
              )}
            </div>
          </div>
        </div>
      </div>

      {openConfirmation && (
        <ConfirmationDialog
          open={openConfirmation}
          confirm={() => {
            router.back();
            clearBuilderAgentData();
            dispatch(resetAgentBuilderForm());
          }}
          cancel={() => setOpenConfirmation(false)}
          title="Are you sure you want to go back?"
          description="Your current changes will be lost. Confirm if you want to go back."
        />
      )}

      {openFinalizeConfirmation && (
        <ConfirmationDialog
          open={openFinalizeConfirmation}
          confirm={async () => {
            try {
              await handleFinalize();
            } finally {
              setOpenFinalizeConfirmation(false);
            }
          }}
          cancel={() => setOpenFinalizeConfirmation(false)}
          title="Are you sure you want to proceed with the current agent configuration?"
          description="This action cannot be undone"
        />
      )}
    </>
  );
};

export default AgentBuilderPage;
