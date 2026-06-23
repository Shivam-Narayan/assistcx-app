import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import { STORAGE_TYPES, StorageType } from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import {
  mailboxPollingSchema,
  MailboxPollingType,
} from "@/lib/schemas/settings/mailbox-polling-schema";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleEmailData } from "@/redux/settings/mailbox-polling/mailbox-data-slice";
import { handleUserEvents } from "@/redux/settings/mailbox-polling/mailbox-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

interface IDataRow {
  label?: string;
  value?: string;
}

const useMailboxPolling = (
  loadTableData: (
    data: any,
    type: PostActionStateSyncAction,
    changes?: Record<string, any>,
  ) => void,
) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = React.useState(false);
  const userEvents = useAppSelector(
    (state) => state?.mailboxPollingReducer?.value?.userEvent,
  );
  const emailData = useAppSelector((state) => state?.emailSliceReducer?.value);
  const sheetEvent = useAppSelector(
    (state) => state?.sheetTriggerReducer?.value.sheetEvent,
  );
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);

  const PDFParsing = emailData["polling_config"]?.pdf_parsing;

  const notificationRecipientsEmails =
    emailData["polling_config"]?.notification_recipients;

  const storageFolder = emailData?.data_store?.storage_folder;
  const storageBucket = emailData?.data_store?.storage_bucket;
  const storageType = emailData?.data_store?.storage_type;

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const isCreateAgents = canEdit(permissions, "mailbox_pollings");

  const form = useForm<MailboxPollingType>({
    resolver: zodResolver(mailboxPollingSchema),
    defaultValues: {
      emailId: "",
      mailbox_folder: "",
      pollingFrequency: "",
      description: "",
      storage_type: undefined,
      bucket_name: "",
      pdf_parsing: "local",
      copy_email_data: false,
      mailbox_priority: "",
      split_pdf_pages: false,
      folder_name: "",
      send_notifications: false,
      alert_recipients: [],
      fix_page_rotation: false,
      ocr_parser: false,
      data_parsing: false,
    },
    mode: "onChange",
  });

  const isTaskFailureAlert = form.watch("send_notifications");
  const isDataParsingEnabled = form.watch("data_parsing");

  useEffect(() => {
    if (!isTaskFailureAlert) {
      form.setValue("alert_recipients", []);
    }
  }, [isTaskFailureAlert, form]);

  useEffect(() => {
    setSheetOpen(sheetEvent);
  }, [sheetEvent]);

  useEffect(() => {
    if (
      (userEvents === "editMailboxPolling" ||
        userEvents === "viewMailboxPolling") &&
      emailData
    ) {
      const {
        email_id,
        folder,
        frequency,
        description,
        data_store,
        polling_config,
      } = emailData;

      // Basic fields
      form.setValue("emailId", email_id ?? "");
      form.setValue("mailbox_folder", folder ?? "");
      form.setValue("pollingFrequency", frequency?.toString() ?? "");
      form.setValue("description", description ?? "");

      // Storage configuration
      const storageType = data_store?.storage_type as StorageType;
      const storageBucket = data_store?.storage_bucket ?? "";

      form.setValue("storage_type", storageType);
      form.setValue("folder_name", data_store?.storage_folder ?? "");

      if (storageType === "remote") {
        form.setValue("bucket_name", storageBucket);
      } else if (storageType === "local") {
        form.setValue("mount_path", storageBucket);
      }

      // Polling configuration
      const pollingConfigMap: Record<
        string,
        {
          key: keyof typeof polling_config;
          defaultValue?: string | boolean | number;
        }
      > = {
        pdf_parsing: { key: "pdf_parsing", defaultValue: "" },
        split_pdf_pages: { key: "split_pdf_pages", defaultValue: false },
        copy_email_data: { key: "copy_email_data", defaultValue: false },
        mailbox_priority: { key: "mailbox_priority", defaultValue: "" },
        send_notifications: { key: "send_notifications", defaultValue: false },
        fix_page_rotation: { key: "fix_page_rotation", defaultValue: false },
        ocr_parser: { key: "ocr_parser", defaultValue: false },
        data_parsing: { key: "data_parsing", defaultValue: false },
      };

      Object.entries(pollingConfigMap).forEach(
        ([formKey, { key, defaultValue }]) => {
          let valueToUse = polling_config?.[key];
          const finalValue =
            typeof valueToUse === "number" && typeof defaultValue === "string"
              ? valueToUse.toString()
              : (valueToUse ?? defaultValue);

          form.setValue(formKey as any, finalValue);
        },
      );

      const recipients = (notificationRecipientsEmails || []).map(
        (user: any) => ({
          id: user.user_id,
          email: user.email_id,
          name: user.name,
        }),
      );

      form.setValue("alert_recipients", recipients);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents]);

  const emailInfo: IDataRow[] = [
    { label: "Email", value: emailData?.email_id.toLowerCase() ?? "" },
    { label: "Mailbox Folder", value: emailData?.folder ?? "" },
    { label: "Frequency", value: `${emailData?.frequency ?? ""} sec` },
    { label: "Status", value: emailData?.status ?? "" },
    { label: "Description", value: emailData?.description ?? "" },
  ];

  //=====================[Function:: Add/Edit Polling details]======================///
  async function onSubmit(values: MailboxPollingType) {
    if (!loading) {
      setLoading(true);

      // if (!validateEmails()) {
      //   setLoading(false);
      //   return;
      // }

      if (userEvents === "addMailboxPolling") {
        setLoading(true);
        let dataModal = {
          email_id: values.emailId.trim().toLowerCase(),
          folder: values.mailbox_folder,
          frequency: parseInt(values.pollingFrequency),
          description: values.description,
          delta_link: "",
          data_store: {
            storage_type: values.storage_type ?? "",
            storage_bucket:
              values.storage_type === STORAGE_TYPES.REMOTE
                ? values.bucket_name
                : values.mount_path,
            storage_folder: values.folder_name ? values.folder_name : "files",
          },
          polling_config: {
            pdf_parsing: values.pdf_parsing ?? "",
            copy_email_data: values.copy_email_data,
            mailbox_priority: Number(values.mailbox_priority),
            split_pdf_pages: values.split_pdf_pages,
            send_notifications: values.send_notifications,
            fix_page_rotation: values.fix_page_rotation,
            ocr_parser: values.ocr_parser,
            notification_recipients: (values.alert_recipients || []).map(
              (user) => user.id,
            ),
            data_parsing: values.data_parsing,
          },
        };

        try {
          const result = await axiosAuth.post(
            url.ADD_MAILBOX_POLLING,
            dataModal,
          );
          if (result?.status === 200) {
            const newItem = result.data;
            successMessageHandler(messages.mailbox_polling_added_successfully);
            setSheetOpen(false);
            loadTableData(newItem, "add");
          }
        } catch (error: any) {
          errorMessageHandler(error.response.data.detail);
        } finally {
          setLoading(false);
        }
      } else {
        // update mailbox polling
        setLoading(true);
        let body = {
          email_id: values.emailId.trim().toLowerCase(),
          folder: values.mailbox_folder,
          frequency: parseInt(values.pollingFrequency),
          description: values.description,
          delta_link: "",
          data_store: {
            storage_type: values.storage_type ?? "",
            storage_bucket:
              values.storage_type === STORAGE_TYPES.REMOTE
                ? values.bucket_name
                : values.mount_path,
            storage_folder: values.folder_name ? values.folder_name : "files",
          },
          polling_config: {
            pdf_parsing: values.pdf_parsing ?? "",
            copy_email_data: values.copy_email_data,
            mailbox_priority:  Number(values.mailbox_priority),
            split_pdf_pages: values.split_pdf_pages,
            send_notifications: values.send_notifications,
            fix_page_rotation: values.fix_page_rotation,
            ocr_parser: values.ocr_parser,
            notification_recipients: (values.alert_recipients || []).map(
              (user) => user.id,
            ),
            data_parsing: values.data_parsing,
          },
        };
        let API_ENDPOINT_PATH = emailData?.id
          ? `${url.UPDATE_MAILBOX_POLLING}/${emailData?.id}`
          : emailData?.folder
            ? `${url.UPDATE_MAILBOX_POLLING}/${emailData?.folder}`
            : `${url.UPDATE_MAILBOX_POLLING}/${emailData?.email_id}`;

        try {
          const result = await axiosAuth.patch(API_ENDPOINT_PATH, body);
          if (result?.status === 200) {
            const updatedItem = result.data;
            successMessageHandler(
              messages.mailbox_polling_updated_successfully,
            );
            setSheetOpen(false);
            loadTableData(updatedItem, "update");
          } else {
            errorMessageHandler(result);
          }
        } catch (error: any) {
          errorMessageHandler(error.response.data.detail);
        } finally {
          setLoading(false);
        }
      }
    }
  }

  //=====================[Function:: Handle Stop Polling]======================///
  async function handleStopPolling(selectedOption: string) {
    if (!loading) {
      if (emailData?.status != undefined) {
        let task_name = emailData?.task_name;
        try {
          setLoading(true);
          let body: any = {};
          let API_ENDPOINT_PATH = "";

          // Determine the endpoint and body based on current status and selected option
          if (emailData?.status == "RUNNING") {
            API_ENDPOINT_PATH = url.STOP_MAILBOX_POLLING + `/${task_name}/stop`;
          } else {
            API_ENDPOINT_PATH =
              url.START_MAILBOX_POLLING + `/${task_name}/start`;

            // Add polling_start_time
            if (selectedOption !== "Continue") {
              const now = new Date();
              let daysToSubtract = 0;

              switch (selectedOption) {
                case "one":
                  daysToSubtract = 1;
                  break;
                case "seven":
                  daysToSubtract = 7;
                  break;
                case "fifteen":
                  daysToSubtract = 15;
                  break;
              }

              const pastDate = new Date(
                now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000,
              );

              // Format as YYYY-MM-DDTHH:MM:SSZ
              body.polling_start_time =
                pastDate.toISOString().split(".")[0] + "Z";
            }
          }

          const result = await axiosAuth.post(API_ENDPOINT_PATH, body);

          if (result?.status === 200) {
            if (emailData?.status == "RUNNING") {
              successMessageHandler(messages.stop_polling_successfully);
              loadTableData(emailData, "update", {
                status: "STOPPED",
              });
            } else {
              successMessageHandler(messages.start_polling_successfully);
              const updatedItem = result.data;
              loadTableData(updatedItem, "update");
            }
            setSheetOpen(false);
            setOpen(false);
            setLoading(false);
          } else {
            setLoading(false);
            errorMessageHandler(result);
          }
        } catch (error: any) {
          setLoading(false);
          errorMessageHandler(error);
        }
      }
    }
  }

  //=====================[Function:: Handle Reset Form ]======================///
  function handleResetForm() {
    dispatch(handleSheetEvents(false));
    form.reset();
    dispatch(handleUserEvents(""));
    const resetEmailData = {
      email_id: "",
      folder: "",
      frequency: undefined,
      description: "",
      data_store: {
        storage_type: "",
        storage_bucket: "",
        mount_path: "",
        storage_folder: "",
        storage_region: "",
      },
      polling_config: {
        pdf_parsing: "",
        copy_email_data: false,
        mailbox_priority: undefined,
        split_pdf_pages: false,
        notification_recipients: [],
        send_notifications: false,
        fix_page_rotation: false,
        ocr_parser: false,
        data_parsing: false,
      },
      status: "",
      id: "",
      delta_link: "",
      task_name: "",
      created_at: "",
    };

    dispatch(handleEmailData(resetEmailData));
  }

  //=====================[Function:: Handle Edit Mailbox Polling Form dispatch ]======================///
  const handleEditMailboxPolling = () => {
    dispatch(handleUserEvents("editMailboxPolling"));
  };

  const getButtonProps = () => {
    switch (userEvents) {
      case "addMailboxPolling":
        return {
          label: "Create Mailbox Polling",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      case "viewMailboxPolling":
        return {
          label: "Stop Polling",
          onClick: () => setOpen(true),
          variant: "destructive" as const,
        };
      default:
        return {
          label: "Update Polling",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
    }
  };

  const { label, variant, onClick } = getButtonProps();

  //=====================[Function:: Handle Cancel Edit Mailbox Polling ]======================///
  const cancleEdit = () => {
    if (emailData) {
      const data = emailData;
      form.reset({
        emailId: data?.email_id ?? "",
        mailbox_folder: data?.folder ?? "",
        pollingFrequency: data?.frequency?.toString() ?? "",
        description: data?.description ?? "",
        storage_type: data.data_store?.storage_type as StorageType,
        folder_name: data.data_store?.storage_folder ?? "",
        pdf_parsing: data.polling_config?.pdf_parsing ?? "local",
        copy_email_data: data.polling_config?.copy_email_data ?? false,
        mailbox_priority:
          data.polling_config?.mailbox_priority?.toString() ?? "",
        split_pdf_pages: data.polling_config?.split_pdf_pages ?? false,
        send_notifications: data.polling_config?.send_notifications ?? false,
        fix_page_rotation: data.polling_config?.fix_page_rotation ?? false,
        ocr_parser: data.polling_config?.ocr_parser ?? false,
        data_parsing: data.polling_config?.data_parsing ?? false,
        bucket_name:
          data.data_store?.storage_type === STORAGE_TYPES.REMOTE
            ? data.data_store.storage_bucket
            : "",
        mount_path:
          data.data_store?.storage_type === STORAGE_TYPES.LOCAL
            ? data.data_store.storage_bucket
            : "",
        alert_recipients: (
          data.polling_config?.notification_recipients || []
        ).map((ele: any) => ({
          id: ele.user_id || ele.id,
          email: ele.email_id || ele.email,
          name: ele.name,
        })),
      });
    }

    dispatch(handleUserEvents("viewMailboxPolling"));
  };

  const handleDeleteClick = () => {
    setOpenconfirmModel(true);
  };

  const handleConfirmDelete = async () => {
    if (loading || !emailData?.id) return;

    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_MAILBOX_POLLING}/${emailData.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);

      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        setSheetOpen(false);
        loadTableData(emailData, "delete");
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return {
    sheetOpen,
    setSheetOpen,
    handleResetForm,
    userEvents,
    handleEditMailboxPolling,
    emailInfo,
    form,
    handleConfirmDelete,
    handleDeleteClick,
    openconfirmModel,
    setOpenconfirmModel,
    isDeleteLoading,
    isLoading,
    label,
    variant,
    onClick,
    cancleEdit,
    handleStopPolling,
    isCreateAgents,
    isDataParsingEnabled,
    isTaskFailureAlert,
    open,
    setOpen,
    notificationRecipientsEmails,
    emailData,
    storageFolder,
    storageBucket,
    storageType,
  };
};

export default useMailboxPolling;
