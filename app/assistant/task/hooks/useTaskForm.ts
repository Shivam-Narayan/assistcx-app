"use client";

import {
  isoToTimeString,
  scheduleToCron,
} from "@/helper/assistant-helper/helper";
import { CollectionData } from "@/redux/assistant/chat/chat-slice";
import { useAppSelector } from "@/redux/store";
import { errorMessageHandler } from "@/helper/helper-function";
import { ADD_TASK, EDIT_TASK } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { formSchema } from "@/lib/schemas/assistant/task/task-schemas";
import {
  clearTaskCollections,
  setTaskSelectedCollections,
} from "@/redux/assistant/task/collection-slice";
import {
  resetWebSearch,
  setWebSearchEnabled,
} from "@/redux/assistant/task/task-web-search-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import * as z from "zod";
import { handleSpaceValidation } from "@/lib/utils";
import { ScheduleType, UseTaskFormProps } from "../_components/types";

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const hasDuplicateEmail = (emails: string[], newEmail: string): boolean =>
  emails.some(
    (email) => email.toLowerCase().trim() === newEmail.toLowerCase().trim(),
  );

export function useTaskForm({
  onOpenChange,
  tab,
  mode = "add",
  initialData,
  time,
  fetchTaskList,
  id = "",
  day,
  fetchTaskDetails,
}: UseTaskFormProps) {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();

  const selectedCollections = useAppSelector(
    (state) => state.taskCollectionReducer.selected,
  );
  const webSearchEnabled = useAppSelector(
    (state) => state.taskWebSearchReducer?.enabled,
  );

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      scheduleType: (initialData?.scheduleType || tab) as ScheduleType,
      time: isoToTimeString(initialData?.time || time) as string,
      prompt: initialData?.prompt || "",
      dayOfMonth: initialData?.dayOfMonth || undefined,
      date: initialData?.date || undefined,
      dayOfWeek: initialData?.dayOfWeek || "",
      month: initialData?.month || "",
      alertRecipientsemails: Array.isArray(initialData?.alertRecipientsemails)
        ? initialData?.alertRecipientsemails
        : undefined,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const activeTab = form.watch("scheduleType");
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        scheduleType: (initialData.scheduleType || tab) as ScheduleType,
        time: (initialData.time || time) as string,
        prompt: initialData.prompt || "",
        dayOfMonth: initialData.dayOfMonth || undefined,
        date: initialData.date || "",
        dayOfWeek: initialData.dayOfWeek || day || "",
        month: initialData.month || "",
        alertRecipientsemails: Array.isArray(initialData.alertRecipientsemails)
          ? initialData.alertRecipientsemails
          : undefined,
      });

      if (
        Array.isArray(initialData?.collections) ||
        initialData?.collections === null
      ) {
        dispatch(
          setTaskSelectedCollections(
            initialData.collections as CollectionData[],
          ),
        );
      }
      dispatch(setWebSearchEnabled(initialData?.webSearch ?? false));
    } else {
      form.reset({
        ...form.getValues(),
        scheduleType: tab,
        time: time,
        dayOfWeek: day,
        alertRecipientsemails: [],
      });
    }
  }, [initialData, form, tab, dispatch, day, time]);

  const removeEmail = (email: string) => {
    const updated =
      form.getValues("alertRecipientsemails")?.filter((e) => e !== email) ?? [];
    form.setValue("alertRecipientsemails", updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = input.trim();

    if (e.key === "Enter" && value !== "") {
      e.preventDefault();
      const current = form.getValues("alertRecipientsemails") ?? [];

      if (!validateEmail(value)) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (hasDuplicateEmail(current, value)) {
        toast.error("This email address is already added");
        return;
      }
      if (current.length >= 3) {
        toast.error("Maximum 3 email addresses allowed");
        return;
      }

      form.setValue("alertRecipientsemails", [...current, value]);
      setInput("");
    } else if (e.key === "Backspace" && input === "") {
      const current = form.getValues("alertRecipientsemails") ?? [];
      const last = current.at(-1);
      if (last) {
        form.setValue("alertRecipientsemails", current.slice(0, -1));
        setInput(last);
      }
    }

    handleSpaceValidation(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const delimiters = [",", ";", " "];
    const shouldCommit = delimiters.some((d) => val.endsWith(d));

    if (shouldCommit) {
      const newEmail = val.slice(0, -1).trim();
      const current = form.getValues("alertRecipientsemails") ?? [];

      if (!validateEmail(newEmail)) {
        toast.error("Please enter a valid email address");
        setInput("");
        return;
      }
      if (hasDuplicateEmail(current, newEmail)) {
        toast.error("This email address is already added");
        setInput("");
        return;
      }
      if (current.length >= 3) {
        toast.error("Maximum 3 email addresses allowed");
        setInput("");
        return;
      }

      form.setValue("alertRecipientsemails", [...current, newEmail]);
      setInput("");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.prompt.length > 2000) {
      toast.error("Prompt should be less than 2000 characters");
      return;
    }

    const scheduleType = values.scheduleType;
    let cronExpression: string;

    if (scheduleType === "once") {
      const epochFromMoment = moment(
        `${values.date} ${values.time}:00`,
        "YYYY-MM-DD HH:mm:ss",
      ).unix();
      cronExpression = epochFromMoment.toString();
    } else {
      cronExpression = scheduleToCron({
        type: scheduleType,
        time: values.time,
        ...(scheduleType === "weekly" && { dayOfWeek: values.dayOfWeek }),
        ...(scheduleType === "monthly" && {
          dayOfMonth: values.dayOfMonth?.toString(),
        }),
        ...(scheduleType === "yearly" && { date: values.date }),
      });
    }

    const requestBody = {
      title: values.name,
      schedule: cronExpression,
      task_prompt: values.prompt,
      collections: selectedCollections,
      notification_recipients: values.alertRecipientsemails,
      web_search_enabled: webSearchEnabled,
    };

    if (!loading) {
      if (mode === "add") {
        try {
          const response = await axiosAuth.post(`${ADD_TASK}`, requestBody);
          if (response.status === 200) {
            toast.success("Task added successfully");
            fetchTaskList?.();
            handleClose();
          }
        } catch (error: any) {
          errorMessageHandler(error.message);
        }
      } else if (mode === "edit") {
        try {
          const response = await axiosAuth.patch(
            `${EDIT_TASK}/${id}`,
            requestBody,
          );
          if (response.status === 200) {
            toast.success("Task updated successfully");
            fetchTaskDetails?.();
            fetchTaskList?.();
            handleClose();
          } else {
            toast.error("Failed to update task");
          }
        } catch (error: any) {
          errorMessageHandler(error.message);
        }
      }
    }
  };

  const handleClose = () => {
    form.reset();
    dispatch(clearTaskCollections());
    dispatch(resetWebSearch());
    onOpenChange(false);
  };

  const handleSelectionChange = (items: CollectionData[] | null) => {
    dispatch(setTaskSelectedCollections(items));
    if (items == null || items.length === 0) {
      dispatch(setWebSearchEnabled(false));
    }
  };

  const handleClearAll = () => {
    dispatch(setTaskSelectedCollections(null));
    dispatch(resetWebSearch());
  };

  return {
    form,
    activeTab,
    onSubmit: form.handleSubmit(onSubmit),
    input,
    inputRef,
    handleKeyDown,
    handleInputChange,
    removeEmail,
    selectedCollections,
    webSearchEnabled,
    handleClose,
    handleSelectionChange,
    handleClearAll,
  };
}
