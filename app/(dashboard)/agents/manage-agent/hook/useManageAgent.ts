"use client";

import {
  errorMessageHandler,
  formatAgentPublishValidationErrors,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAgentForm } from "./useAgentForm";
import { useAgentConfigData } from "./useAgentConfigData";
import { mapAgentToForm, transformAgentPayload } from "../helper/helper";
import {
  clearBuilderAgentData,
  getBuilderAgentData,
} from "@/lib/agent-builder-store";

interface FileUpload {
  File: File;
}

export const useManageAgent = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const uuid = searchParams?.get("uuid");
  const fetchedRef = useRef(false);
  const { axiosAuth, loading } = useAxiosAuth();
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  const [isEditing, setIsEditing] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [inSideDropImport, setInSideDropImport] = useState(false);
  const [lastSavedValues, setLastSavedValues] = useState<any>(null);
  const [currentSelectedVersion, setCurrentSelectedVersion] =
    useState<any>(null);

  const { providerList, getProviderList } = useAgentConfigData();
  const methods = useAgentForm();
  const {
    formState: { isDirty, dirtyFields },
    handleSubmit,
    reset,
  } = methods;
  const router = useRouter();

  const handlePublish = useCallback(
    async (data: any): Promise<boolean> => {
      try {
        const payload = transformAgentPayload(data, providerList);

        let result;

        if (uuid) {
          result = await axiosAuth.put(`${url.UPDATE_AGENTS}/${uuid}`, payload);

          if (result?.status === 200) {
            successMessageHandler(messages.agent_updated_successfully);
          }
        } else {
          result = await axiosAuth.post(url.ADD_AGENTS, payload);

          if (result?.status === 200) {
            successMessageHandler(messages.agent_added_successfully);
            router.replace(`${pathname}?uuid=${result.data.id}`);
          }
        }

        if (result?.status !== 200) {
          return false;
        }

        clearBuilderAgentData();
        setIsEditing(false);
        setIsSaved(true);
        reset(data);
        setLastSavedValues(data);
        return true;
      } catch (error: any) {
        errorMessageHandler(error?.response?.data?.detail);
        return false;
      }
    },
    [axiosAuth, pathname, providerList, reset, router, uuid],
  );

  const runPublish = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      handleSubmit(
        async (data) => {
          const ok = await handlePublish(data);
          resolve(ok);
        },
        (errors) => {
          errorMessageHandler(formatAgentPublishValidationErrors(errors));
          resolve(false);
        },
      )();
    });
  }, [handleSubmit, handlePublish]);

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDiscard = () => {
    if (lastSavedValues) {
      reset(lastSavedValues);
    }
    setCurrentSelectedVersion(null);
    setIsEditing(false);
  };

  const handleBack = () => {
    router.push("/agents");
    clearBuilderAgentData();
  };

  const handleImportAgent = (filesToUpload: FileUpload[]) => {
    filesToUpload.forEach((fileUploaded) => {
      setIsImportLoading(true);
      const file = fileUploaded.File;

      if (file.type.includes("application/json") && file.size > 0 && !loading) {
        const reader = new FileReader();

        reader.onload = async (event) => {
          const fileContent = event.target?.result as string;

          if (!fileContent.trim()) {
            errorMessageHandler(
              "The file is empty or contains only whitespace.",
            );
            setIsImportLoading(false);
            return;
          }
          try {
            const jsonContent = JSON.parse(fileContent);

            if (
              (typeof jsonContent === "object" &&
                !Object.keys(jsonContent).length) ||
              (Array.isArray(jsonContent) && jsonContent.length === 0)
            ) {
              errorMessageHandler("The JSON content is empty.");
              setIsImportLoading(false);
              return;
            }

            if (
              !(typeof jsonContent === "object" && jsonContent !== null) &&
              !Array.isArray(jsonContent)
            ) {
              errorMessageHandler("Invalid JSON format.");
              setIsImportLoading(false);
              return;
            }

            const mappedData = mapAgentToForm(jsonContent, "ACTIVE");

            reset(mappedData);

            if (inSideDropImport) {
              setIsSaved(true);

              // force form dirty so Discard button appears
              methods.setValue(
                "identity.name",
                mappedData.identity.name + " ",
                {
                  shouldDirty: true,
                },
              );
            } else {
              setIsSaved(false);
            }

            setIsEditing(true);
            // toast.success("Agent imported successfully");
          } catch (error: any) {
            if (typeof error?.response?.data?.detail === "string") {
              errorMessageHandler(error?.response?.data?.detail);
            } else {
              errorMessageHandler("Invalid JSON or JSON file");
            }
            setIsImportLoading(false);
          } finally {
            setIsImportLoading(false);
          }
        };

        reader.readAsText(file);
      } else {
        errorMessageHandler("Please upload a valid JSON file.");
        setIsImportLoading(false);
      }
    });
  };

  const handleRestoreVersionData = (data: any, currentJson: any) => {
    try {
      const mappedData = mapAgentToForm(data.config_data);

      reset(mappedData);

      // make form dirty so discard button appears
      methods.setValue("identity.name", mappedData.identity.name + " ", {
        shouldDirty: true,
      });

      setIsEditing(true);
      setIsSaved(true);
      setActiveTab("identity");
      setCurrentSelectedVersion(null);
      successMessageHandler("Version restored successfully");
    } catch (error) {
      // errorMessageHandler("Failed to restore version");
    }
  };

  const fetchAgent = async (id: string) => {
    try {
      setIsAgentLoading(true);
      const result = await axiosAuth.get(`${url.UPDATE_AGENTS}/${id}`);
      const data = result.data.agents[0];
      const mappedData = mapAgentToForm(data);
      reset(mappedData);
      setLastSavedValues(mappedData);
      setIsEditing(false);
      setIsSaved(true);
    } catch (err: any) {
      errorMessageHandler(err);
    } finally {
      setIsAgentLoading(false);
    }
  };

  useEffect(() => {
    getProviderList();
  }, [loading]);

  useEffect(() => {
    if (!uuid || loading || fetchedRef.current) return;

    fetchedRef.current = true;
    fetchAgent(uuid);
  }, [uuid, loading]);

  useEffect(() => {
    const builderData = getBuilderAgentData();

    if (builderData) {
      reset(builderData);
      setIsEditing(true);
      setIsSaved(false);
      fetchedRef.current = true;
      clearBuilderAgentData();
    }
  }, []);
  return {
    methods,
    isEditing,
    isSaved,
    setIsSaved,
    isDirty,
    setIsEditing,
    handleBack,
    handleCancel,
    handleDiscard,
    dirtyFields,
    onPublish: runPublish,
    handleImportAgent,
    setInSideDropImport,
    handleRestoreVersionData,
    currentSelectedVersion,
    setCurrentSelectedVersion,
    isImportLoading,
    activeTab,
    setActiveTab,
    isAgentLoading,
  };
};
