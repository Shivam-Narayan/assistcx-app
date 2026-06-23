"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import HeaderHoverCard from "@/components/header";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import { SmartContentViewer } from "@/components/smart-content";
import { LLMToolSelector } from "@/components/tool-selectors/llm-tool-selector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComboBox } from "@/components/ui/combo-box";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  knowledgeFormSchema,
  KnowledgeFormSchemaType,
  smartFormSchema,
  SmartFormSchemaType,
} from "@/lib/schemas/knowledge-schemas";
import {
  displayNameToStrictSnakeName,
  formatComboBoxData,
  handleSpaceValidation,
} from "@/lib/utils";
import { IconsData } from "@/types/types";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Brain,
  BrainCircuit,
  Code,
  Eye,
  PlusCircleIcon,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { AliasInput } from "./components/alias-input";
import { ImportJsonDialog } from "./components/import-json-dialog";
import SortableField from "./components/sortable-field";
import SortableKnowledgeTopic from "./components/sortable-knowledge-topic";

const dataTypeList = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Date", value: "date" },
  { label: "List", value: "list" },
];

interface CreateUpdateCollectionProps {
  formValidation: UseFormReturn<any>;
  iconsData: IconsData;
  type: string;
  isAdvanced: any;
  setIsAdvanced: (value: boolean) => void;
  savedFields: any;
  setSavedFields: any;
  knowledgeFields: any;
  setKnowledgeFields: any;
}

const CreateUpdateCollection = ({
  formValidation,
  iconsData,
  type,
  isAdvanced,
  setIsAdvanced,
  savedFields,
  setSavedFields,
  knowledgeFields,
  setKnowledgeFields,
}: CreateUpdateCollectionProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const defaultIcon = getIconSvg("ai-book", "collection_icons");

  const [embeddingModels, setEmbeddingModels] = React.useState<any>([]);
  const [embeddingSearch, setEmbeddingSearch] = useState("");
  const [localError, setLocalError] = useState("");
  // --- State for Smart Fields ---
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSmartFormOpen, setIsSmartFormOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );
  // --- State for Knowledge Topics ---
  const [knowledgeIndex, setKnowledgeIndex] = useState<number | null>(null);
  const [isKnowledgeFormOpen, setIsKnowledgeFormOpen] = useState(false);
  // --- Import JSON dialogs ---
  const [importSmartOpen, setImportSmartOpen] = useState(false);
  const [importKnowledgeOpen, setImportKnowledgeOpen] = useState(false);
  // --- Form Instances ---
  const smartForm = useForm<SmartFormSchemaType>({
    resolver: zodResolver(smartFormSchema),
    defaultValues: { fields: [] },
    mode: "onChange",
  });

  const knowledgeForm = useForm<KnowledgeFormSchemaType>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: { fields: [] },
    mode: "onChange",
  });

  const getEmbeddingModels = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.get(url.GET_EMBEDDING_MODELS);
        setEmbeddingModels(result.data?.embedding_models || []);
      } catch (error: any) {
        setEmbeddingModels([]);
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getEmbeddingModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleAvailabilityChange = (newValue: string) => {
    formValidation.setValue("availability", newValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
    formValidation.clearErrors("availability");
  };

  const handleEmbeddingModelChange = (newValue: string) => {
    formValidation.setValue("embedding_model", newValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
    formValidation.clearErrors("embedding_model");
  };

  // const mountPathItems = formatComboBoxData(mountPaths);
  const availabilityItems = formatComboBoxData(["PUBLISHED", "UNLISTED"]);
  const embeddingModelItems =
    embeddingModels?.map((model: any) => ({
      label: model.name,
      value: model.embedding_model,
      description: model.description,
      ...model,
    })) || [];

  const filteredEmbeddingModelItems = embeddingModelItems.filter(
    (item: any) => {
      const text = `${item.label} ${item.value}`.toLowerCase();
      return text.includes(embeddingSearch.toLowerCase());
    },
  );

  // --- Handlers for Smart Fields ---
  const addsmartNewFormHandler = () => {
    smartForm.reset({
      fields: [{ name: "", description: "", data_type: "", keywords: [] }],
    });
    setEditingIndex(null);
    setIsSmartFormOpen(true);
    setLocalError("");
  };

  const handlesmartDeleteField = (indexToDelete: number) => {
    setSavedFields((prev: any) =>
      prev.filter((_: any, index: any) => index !== indexToDelete),
    );
  };

  const handlesmartEditField = (indexToEdit: number) => {
    const field = savedFields[indexToEdit];
    smartForm.reset({ fields: [field] });
    setEditingIndex(indexToEdit);
    setIsSmartFormOpen(true);
    setLocalError("");
  };

  const handlesmartCancel = () => {
    smartForm.reset({ fields: [] });
    setEditingIndex(null);
    setIsSmartFormOpen(false);
    setLocalError("");
  };

  const onSmartSave = (data: any) => {
    if (localError && localError.trim() !== "") {
      return;
    }
    const newField = data.fields[0];
    const isNameTaken = savedFields.some(
      (field: any, index: any) =>
        field.name === newField.name && index !== editingIndex,
    );

    if (isNameTaken) {
      smartForm.setError("fields.0.name", {
        type: "manual",
        message: "Field name must be unique.",
      });
      return;
    }
    if (editingIndex !== null) {
      setSavedFields((prev: any) =>
        prev.map((field: any, index: any) =>
          index === editingIndex ? newField : field,
        ),
      );
    } else {
      setSavedFields((prev: any) => [...prev, newField]);
    }
    handlesmartCancel();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = savedFields.findIndex(
        (item: any) => item.name === active.id,
      );
      const newIndex = savedFields.findIndex(
        (item: any) => item.name === over.id,
      );

      const newFields = arrayMove(savedFields, oldIndex, newIndex);
      setSavedFields(newFields); // assuming you're using useState
    }
  };

  // --- Handlers for Knowledge Topics ---
  const addKnowledgeNewFormHandler = () => {
    knowledgeForm.reset({
      fields: [{ name: "", description: "", keywords: [] }],
    });
    setKnowledgeIndex(null);
    setIsKnowledgeFormOpen(true);
    setLocalError("");
  };

  const handleKnowledgeSave = (data: any) => {
    if (localError && localError.trim() !== "") {
      return;
    }
    const newField = data.fields[0];
    const isNameTaken = knowledgeFields.some(
      (field: any, index: any) =>
        field.name === newField.name && index !== knowledgeIndex,
    );
    if (isNameTaken) {
      knowledgeForm.setError("fields.0.name", {
        type: "manual",
        message: "Topic name must be unique.",
      });
      return;
    }
    if (knowledgeIndex !== null) {
      setKnowledgeFields((prev: any) =>
        prev.map((field: any, index: any) =>
          index === knowledgeIndex ? newField : field,
        ),
      );
    } else {
      setKnowledgeFields((prev: any) => [...prev, newField]);
    }
    handleKnowledgeCancel();
  };

  const handleKnowledgeCancel = () => {
    knowledgeForm.reset({ fields: [] });
    setKnowledgeIndex(null);
    setIsKnowledgeFormOpen(false);
    setLocalError("");
  };

  const handleKnowledgeEditField = (index: number) => {
    const selected = knowledgeFields[index];
    knowledgeForm.reset({ fields: [selected] });
    setKnowledgeIndex(index);
    setIsKnowledgeFormOpen(true);
    setLocalError("");
  };

  const handleKnowledgeDeleteField = (index: number) => {
    setKnowledgeFields((prev: any) =>
      prev.filter((_: any, i: any) => i !== index),
    );
  };

  const handleKnowledgeDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = knowledgeFields.findIndex(
      (item: any) => item.name === active.id,
    );
    const newIndex = knowledgeFields.findIndex(
      (item: any) => item.name === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;
    const newFields = arrayMove(knowledgeFields, oldIndex, newIndex);
    setKnowledgeFields(newFields);
  };

  useEffect(() => {
    if (!isAdvanced && type === "update") {
      // Reset Smart Fields
      setSavedFields([]);
      setEditingIndex(null);
      setIsSmartFormOpen(false);
      smartForm.reset({ fields: [] });

      // Reset Knowledge Topics
      setKnowledgeFields([]);
      setKnowledgeIndex(null);
      setIsKnowledgeFormOpen(false);
      knowledgeForm.reset({ fields: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvanced, type]);

  const renderFieldForm = (
    formInstance: UseFormReturn<any>,
    onSubmit: (data: any) => void,
    onCancel: () => void,
    isEditing: boolean,
    isKnowledgeTopic: boolean = false,
  ) => {
    const itemType = isKnowledgeTopic ? "Topic" : "Field";
    const itemTypeLower = itemType;

    return (
      <div className="p-4 border rounded-lg bg-background">
        <Form {...formInstance}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {formInstance.getValues("fields").map((_: any, index: any) => (
              <div className="space-y-4" key={index}>
                <FormField
                  control={formInstance.control}
                  name={`fields.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        <div className="flex items-center gap-1">
                          <span>{itemType} Name</span>
                          <InfoIconWithMessage
                            content={`${itemTypeLower} names must be unique and contain only lowercase letters, numbers and underscores. Spaces and hyphens are replaced with underscores; other special characters are removed.`}
                          />
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter ${itemTypeLower} name`}
                          {...field}
                          onChange={(e) => {
                            field.onChange(
                              displayNameToStrictSnakeName(e.target.value),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* This is only for Smart Fields, not Knowledge Topics */}
                {!isKnowledgeTopic && (
                  <FormField
                    control={formInstance.control}
                    name={`fields.${index}.data_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground required">
                          <div className="flex items-center gap-1">
                            <span>Data Type</span>
                            <InfoIconWithMessage
                              content={`Choose the data type from the dropdown (e.g., Boolean, Date, List).`}
                            />
                          </div>
                        </FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                              <SelectValue placeholder="Select data type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dataTypeList.map((item, i) => (
                              <SelectItem
                                value={item.value}
                                key={i}
                                className="cursor-pointer"
                              >
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={formInstance.control}
                  name={`fields.${index}.keywords`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        <div className="flex items-center gap-1">
                          <span>Keywords</span>
                          <InfoIconWithMessage content="Type a word and press Enter or a Comma to make it into a keyword." />
                        </div>
                      </FormLabel>

                      <FormControl>
                        <AliasInput
                          name={`fields.${index}.keywords`}
                          control={formInstance.control}
                          localError={localError}
                          setLocalError={setLocalError}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 
                <FormItem>
                  <FormLabel className="text-foreground">
                    <div className="flex items-center gap-1">
                      <span>Keywords</span>
                      <InfoIconWithMessage
                        content={`Optional: Add keywords for better search and filtering.`}
                      />
                    </div>
                  </FormLabel>
                  <AliasInput
                    name={`fields.${index}.keywords`}
                    control={formInstance.control}
                  />
                  
                </FormItem> */}
                <FormField
                  control={formInstance.control}
                  name={`fields.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        <div className="flex items-center gap-1">
                          <span>Description</span>
                          <InfoIconWithMessage
                            content={`This helps others understand the ${itemTypeLower}’s purpose and expected content.`}
                          />
                        </div>
                      </FormLabel>
                      <FormControl>
                        <AutoGrowingTextarea
                          placeholder="Enter description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                onClick={formInstance.handleSubmit(onSubmit)}
              >
                {isEditing ? `Update ${itemType}` : `Save ${itemType}`}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  };

  const isEditCollection = type === "update";
  const showEmbeddingModelField = !isEditCollection;

  return (
    <>
      <Card className="shadow-none p-0 gap-0">
        <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle
            className="flex gap-3 items-center text-lg font-medium 
           leading-none tracking-tight"
          >
            <span>Common Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2 flex flex-col">
          <div className="p-4 pt-2 ">
            <Form {...formValidation}>
              <div className="space-y-3 pt-2 pb-4">
                <FormField
                  control={formValidation.control}
                  name="icon"
                  render={({ field }) => (
                    <IconPicker
                      label="Collection Icon"
                      icons={iconsData}
                      field={field}
                      defaultIcon={defaultIcon}
                    />
                  )}
                />
                <FormField
                  control={formValidation.control}
                  name="collection_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name"
                          {...field}
                          onKeyDown={handleSpaceValidation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formValidation.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        Description
                      </FormLabel>
                      <FormControl>
                        <AutoGrowingTextarea
                          placeholder="Enter description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showEmbeddingModelField && (
                  <FormField
                    control={formValidation.control}
                    name="embedding_model"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel className="text-foreground">
                          Embedding Model
                        </FormLabel>
                        <LLMToolSelector
                          items={filteredEmbeddingModelItems}
                          value={field.value}
                          onChange={handleEmbeddingModelChange}
                          placeholder="Select Embedding Model"
                          buttonClassName="w-full hover:bg-background"
                          searchPlaceholder="Search embedding models..."
                          localSearch={embeddingSearch}
                          setLocalSearch={setEmbeddingSearch}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={formValidation.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="text-foreground required">
                        Availability{" "}
                      </FormLabel>
                      <ComboBox
                        items={availabilityItems}
                        value={field.value}
                        onChange={handleAvailabilityChange}
                        placeholder="Select Availability"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
            {type === "update" && (
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>Advanced Knowledge Extraction</ItemTitle>
                  <ItemDescription className="line-clamp-none">
                    Enable this to extract complex, structured knowledge from
                    documents using enhanced parsing rules, AI-based entity
                    recognition, and deeper semantic analysis.
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Switch
                    className="cursor-pointer"
                    checked={isAdvanced}
                    onCheckedChange={setIsAdvanced}
                  />
                </ItemActions>
              </Item>
            )}
          </div>
        </CardContent>
      </Card>

      {type === "update" && isAdvanced && (
        <>
          {/* --- Smart Fields Card --- */}
          <Card className="h-full max-h-full w-full max-w-full flex flex-col shrink-0 snap-center shadow-none border p-0 gap-0">
            <Tabs
              defaultValue="form"
              className="flex flex-col flex-1 min-h-0 gap-0"
            >
              <CardHeader
                className="border-b px-4 py-3 [.border-b]:pb-2 flex items-center justify-between text-xl font-semibold 
           leading-none tracking-tight"
              >
                <HeaderHoverCard
                  title="Smart Fields"
                  message={`Automatically detect and map key information fields using AI to simplify data extraction.`}
                  type="card"
                  isRequired={false}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <TabsList className="bg-muted h-9 p-0.5">
                    <ConditionalTooltip
                      content="Form view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="form"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="Form view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Eye className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>

                    <ConditionalTooltip
                      content="JSON view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="json"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="JSON view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Code className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>
                  </TabsList>
                  <ConditionalTooltip
                    content="Import"
                    alwaysShow={true}
                    align="center"
                    showArrow={true}
                    side="bottom"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 cursor-pointer shrink-0"
                      onClick={() => setImportSmartOpen(true)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </ConditionalTooltip>
                </div>
              </CardHeader>

              <CardContent className="flex grow flex-col p-4 space-y-4  overflow-y-auto">
                <TabsContent
                  value="form"
                  className="flex-1 overflow-y-auto m-0"
                >
                  {savedFields.length === 0 && !isSmartFormOpen ? (
                    <EmptyState
                      variant="card"
                      compact
                      icon={<BrainCircuit />}
                      title="No Smart Fields Defined"
                      description="Add fields to structure and standardize extracted information across this collection."
                      action={
                        <Button
                          className="cursor-pointer"
                          variant="outline"
                          size="sm"
                          onClick={addsmartNewFormHandler}
                        >
                          <PlusCircleIcon className="h-4 w-4" /> Add Field
                        </Button>
                      }
                    />
                  ) : (
                    <>
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                      >
                        <SortableContext
                          items={savedFields.map((field: any) => field.name)}
                          strategy={verticalListSortingStrategy}
                        >
                          {savedFields.map((field: any, index: any) =>
                            isSmartFormOpen && editingIndex === index ? (
                              <div
                                key={`edit-smart-${index}`}
                                className="border rounded-lg p-4 my-2 bg-muted/50"
                              >
                                {renderFieldForm(
                                  smartForm,
                                  onSmartSave,
                                  handlesmartCancel,
                                  true,
                                  false,
                                )}
                              </div>
                            ) : (
                              <SortableField
                                key={field.name}
                                field={field}
                                index={index}
                                onEdit={handlesmartEditField}
                                onDelete={handlesmartDeleteField}
                              />
                            ),
                          )}
                        </SortableContext>
                      </DndContext>

                      {isSmartFormOpen && editingIndex === null && (
                        <div className="border rounded-lg p-4 my-2 bg-muted/30 border-dashed">
                          {renderFieldForm(
                            smartForm,
                            onSmartSave,
                            handlesmartCancel,
                            false,
                            false,
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent
                  value="json"
                  className="flex-1 overflow-y-auto mt-0 py-4"
                >
                  <div className="rounded-md border bg-card overflow-hidden min-h-[240px] max-h-[360px] flex-1 flex flex-col">
                    <SmartContentViewer
                      content={savedFields}
                      maxHeight="100%"
                      fullHeight
                      className="border-none"
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
            {!isSmartFormOpen && savedFields.length !== 0 && (
              <CardFooter className="flex items-center justify-center px-4 py-3 bg-accent rounded-b-md">
                <div
                  className="flex justify-center items-center cursor-pointer font-medium hover:underline"
                  onClick={addsmartNewFormHandler}
                >
                  <PlusCircleIcon className="mr-2 h-4 w-4" />{" "}
                  <span>Add Field</span>
                </div>
              </CardFooter>
            )}
          </Card>

          <ImportJsonDialog
            open={importSmartOpen}
            onOpenChange={setImportSmartOpen}
            type="smart_fields"
            existingNames={savedFields.map((f: any) => f.name)}
            existingData={savedFields}
            onImport={(items) => {
              setSavedFields(items as any);
            }}
          />

          {/* --- Knowledge Topics Card --- */}
          <Card className="h-full max-h-full w-full max-w-full flex flex-col shrink-0 snap-center shadow-none border p-0 gap-0">
            <Tabs
              defaultValue="form"
              className="flex flex-col flex-1 min-h-0 gap-0"
            >
              <CardHeader
                className="border-b px-4 py-3 [.border-b]:pb-2 flex items-center justify-between text-xl font-semibold 
           leading-none tracking-tight"
              >
                <HeaderHoverCard
                  title="Knowledge Topics"
                  message={`Group related information into key topics for better organization and retrieval.`}
                  type="card"
                  isRequired={false}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <TabsList className="bg-muted h-9 p-0.5">
                    <ConditionalTooltip
                      content="Form view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="form"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="Form view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Eye className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>

                    <ConditionalTooltip
                      content="JSON view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="json"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="JSON view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Code className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>
                  </TabsList>
                  <ConditionalTooltip
                    content="Import"
                    alwaysShow={true}
                    align="center"
                    showArrow={true}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 cursor-pointer shrink-0"
                      onClick={() => setImportKnowledgeOpen(true)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </ConditionalTooltip>
                </div>
              </CardHeader>

              <CardContent className="flex grow flex-col p-4 space-y-4 overflow-y-auto">
                <TabsContent
                  value="form"
                  className="flex-1 overflow-y-auto mt-0"
                >
                  {knowledgeFields.length === 0 && !isKnowledgeFormOpen ? (
                    <EmptyState
                      variant="card"
                      compact
                      icon={<Brain />}
                      title="No Knowledge Topics Defined"
                      description="Create topics to organize content and improve semantic retrieval."
                      action={
                        <Button
                          className="cursor-pointer"
                          variant="outline"
                          size="sm"
                          onClick={addKnowledgeNewFormHandler}
                        >
                          <PlusCircleIcon className="h-4 w-4" /> Add Topic
                        </Button>
                      }
                    />
                  ) : (
                    <>
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleKnowledgeDragEnd}
                        sensors={sensors}
                      >
                        <SortableContext
                          items={knowledgeFields.map(
                            (field: any) => field.name,
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          {knowledgeFields.map((field: any, index: any) =>
                            isKnowledgeFormOpen && knowledgeIndex === index ? (
                              <div
                                key={`edit-knowledge-${index}`}
                                className="border rounded-lg p-4 my-2 bg-muted/50"
                              >
                                {renderFieldForm(
                                  knowledgeForm,
                                  handleKnowledgeSave,
                                  handleKnowledgeCancel,
                                  true,
                                  true,
                                )}
                              </div>
                            ) : (
                              <SortableKnowledgeTopic
                                key={field.name}
                                field={field}
                                index={index}
                                onEdit={handleKnowledgeEditField}
                                onDelete={handleKnowledgeDeleteField}
                              />
                            ),
                          )}
                        </SortableContext>
                      </DndContext>

                      {isKnowledgeFormOpen && knowledgeIndex === null && (
                        <div className="border rounded-lg p-4 my-2 bg-muted/30 border-dashed">
                          {renderFieldForm(
                            knowledgeForm,
                            handleKnowledgeSave,
                            handleKnowledgeCancel,
                            false,
                            true,
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent
                  value="json"
                  className="flex-1 overflow-y-auto mt-0 py-4"
                >
                  <div className="rounded-md border bg-card overflow-hidden min-h-[240px] max-h-[360px] flex-1 flex flex-col">
                    <SmartContentViewer
                      content={knowledgeFields}
                      maxHeight="100%"
                      fullHeight
                      className="border-none"
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
            {!isKnowledgeFormOpen && knowledgeFields.length !== 0 && (
              <CardFooter className="flex items-center justify-center px-4 py-3 bg-accent rounded-b-md">
                <div
                  className="flex justify-center items-center cursor-pointer font-medium hover:underline"
                  onClick={addKnowledgeNewFormHandler}
                >
                  <PlusCircleIcon className="mr-2 h-4 w-4" />{" "}
                  <span>Add Topic</span>
                </div>
              </CardFooter>
            )}
          </Card>

          <ImportJsonDialog
            open={importKnowledgeOpen}
            onOpenChange={setImportKnowledgeOpen}
            type="knowledge_topics"
            existingNames={knowledgeFields.map((f: any) => f.name)}
            existingData={knowledgeFields}
            onImport={(items) => {
              setKnowledgeFields(items as any);
            }}
          />
        </>
      )}
    </>
  );
};

export default CreateUpdateCollection;
