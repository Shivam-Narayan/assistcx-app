"use client";

import AutoResizingTextarea from "@/components/assistant/auto-resizing-text-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CollectionData } from "@/redux/assistant/chat/chat-slice";
import { setWebSearchEnabled } from "@/redux/assistant/task/task-web-search-slice";
import { useAppSelector } from "@/redux/store";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useDispatch } from "react-redux";
import { useTaskForm } from "../hooks/useTaskForm";
import { TaskFormHeader } from "./task-form-header";
import { TaskFormRecipients } from "./task-form-recipients";
import { TaskFormSchedule } from "./task-form-schedule";
import { TaskFormSource } from "./task-form-source";
import { TaskFormProps } from "./types";



export default function TaskForm({
  open,
  onOpenChange,
  tab,
  mode = "add",
  time,
  initialData,
  fetchTaskList,
  id = "",
  day,
  fetchTaskDetails,
}: TaskFormProps) {
  const {
    form,
    activeTab,
    onSubmit,
    input,
    inputRef,
    handleKeyDown,
    handleInputChange,
    removeEmail,
    selectedCollections,
    handleClose,
    handleSelectionChange,
    handleClearAll,
  } = useTaskForm({
    open,
    onOpenChange,
    tab,
    mode,
    initialData,
    time,
    fetchTaskList,
    id,
    day,
    fetchTaskDetails,
  });

  const dispatch = useDispatch();
  const webSearchEnabled = useAppSelector(
    (state) => state.taskWebSearchReducer?.enabled,
  );
  const isKnowledgeMode = !!selectedCollections?.length;
  const isWebSearchMode = webSearchEnabled && !isKnowledgeMode;

  const handleWebSearchToggle = () => {
    if (isKnowledgeMode) handleClearAll();
    dispatch(setWebSearchEnabled(isKnowledgeMode ? true : !webSearchEnabled));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="hidden">Create Task</DialogTitle>
        <div className="flex flex-col h-full p-4 z-10 bg-white rounded-lg max-h-[80vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-5">
              <TaskFormHeader form={form} onClose={handleClose} />
              <TaskFormSource
                isWebSearchMode={isWebSearchMode}
                isKnowledgeMode={isKnowledgeMode}
                selectedCollections={
                  selectedCollections as CollectionData[] | []
                }
                onWebSearchToggle={handleWebSearchToggle}
                onSelectionChange={handleSelectionChange as any}
                onClearAll={handleClearAll}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Instruction
                    </FormLabel>
                    <FormControl>
                      <AutoResizingTextarea
                        id="prompt"
                        name="prompt"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Enter Task Instruction"
                        className="min-h-20 max-h-32"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <TaskFormSchedule form={form} activeTab={activeTab} />
              <TaskFormRecipients
                form={form}
                input={input}
                inputRef={inputRef}
                onKeyDown={handleKeyDown}
                onInputChange={handleInputChange}
                onRemoveEmail={removeEmail}
              />

              <div className="flex justify-end pt-1">
                <Button type="submit" className="cursor-pointer">
                  {mode === "add" ? "Create Task" : "Update Task"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
