"use client";
import { SmartContentViewer } from "@/components/smart-content";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  errorMessageHandler,
  getFieldType,
  isFieldRequiredFromAnyOf,
  trimValues,
} from "@/helper/helper-function";
import { AGENT_TOOLS_TEST } from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { buildDynamicZodSchema } from "@/lib/schemas/tools-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Settings, X, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TagInput } from "./tag-input";
import { handleSpaceValidation } from "@/lib/utils";

export interface SchemaField {
  title?: string;
  type?: string;
  anyOf?: { type?: string; items?: any; additionalProperties?: boolean }[];
  default?: any;
  items?: any;
  additionalProperties?: boolean;
}

export interface Schema {
  input_schema: Record<string, SchemaField>;
  required?: string[];
}

interface PropertiesFormProps {
  schema: Schema;
  id?: string;
  onClose?: () => void;
  toolName?: string;
}

export function PropertiesForm({
  toolName,
  schema,
  id,
  onClose,
}: PropertiesFormProps) {
  const { axiosAuth, loading: isLoading } = useAxiosAuth();
  const [loading, setLoading] = useState(false);
  const [toolTest, setToolTest] = useState(null);
  const fields = schema.input_schema;

  const zodSchema = buildDynamicZodSchema({ fields });
  const defaultValues = Object.fromEntries(
    Object.entries(fields).map(([key, field]) => {
      const fieldType = getFieldType(field);

      if (fieldType === "array-of-objects") {
        return [key, field.default ?? ""];
      } else if (fieldType === "object" || fieldType === "object-or-array") {
        return [key, field.default ?? ""];
      } else if (fieldType === "simple-array") {
        return [key, field.default ?? []];
      }

      return [key, field.default ?? ""];
    }),
  );

  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const handleSubmit = async (values: z.infer<typeof zodSchema>) => {
    setLoading(true);
    const requestBody = trimValues(values);

    try {
      const response = await axiosAuth.post(
        `${AGENT_TOOLS_TEST}/${id}/test`,
        requestBody,
      );
      if (response.status === 200) {
        setToolTest(response?.data);
        toast({
          title: "Success",
          description: "Test successfully completed",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed task test",
          variant: "destructive",
        });
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = form.handleSubmit(handleSubmit);

  const renderField = (key: string, field: SchemaField, formField: any) => {
    const fieldType = getFieldType(field);

    switch (fieldType) {
      case "object-or-array":
        return (
          <Textarea
            placeholder={`Enter JSON object or array of objects for ${
              field.title || key
            }\n\nExamples:\nSingle object: {"key": "value"}\nArray: [{"key": "value"}, {"key": "value"}]`}
            value={
              typeof formField.value === "string"
                ? formField.value
                : JSON.stringify(formField.value, null, 2)
            }
            onChange={(e) => {
              const value = e.target.value;
              formField.onChange(value);
            }}
            onKeyDown={handleSpaceValidation}
            className="font-mono text-sm"
            rows={8}
          />
        );

      case "array-of-objects":
      case "object":
        return (
          <Textarea
            placeholder={`Enter JSON ${
              fieldType === "array-of-objects" ? "array of objects" : "object"
            } for ${field.title || key}\n\nExample:\n${
              fieldType === "array-of-objects"
                ? '[\n  {"key": "value"},\n  {"key": "value"}\n]'
                : '{\n  "key": "value"\n}'
            }`}
            value={
              typeof formField.value === "string"
                ? formField.value
                : JSON.stringify(formField.value, null, 2)
            }
            onChange={(e) => {
              const value = e.target.value;
              formField.onChange(value);
            }}
            onKeyDown={handleSpaceValidation}
            className="font-mono text-sm"
            rows={8}
          />
        );

      case "simple-array":
        return (
          <TagInput
            value={formField.value || []}
            onChange={(newValues) => formField.onChange(newValues)}
            placeholder={`Enter ${field.title || key}`}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={`Enter ${field.title || key}`}
            {...formField}
            value={formField.value ?? ""}
            onKeyDown={handleSpaceValidation}
            onChange={(e) => formField.onChange(Number(e.target.value))}
          />
        );

      default:
        return (
          <Input
            type="text"
            onKeyDown={handleSpaceValidation}
            placeholder={`Enter ${field.title || key}`}
            {...formField}
            value={formField.value ?? ""}
          />
        );
    }
  };

  const isTestToolEnabled = Object.keys(schema.input_schema).length > 0;
  const watchedValues = trimValues(form.watch());
  const renderValuePreview = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <>
      <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center space-y-0 bg-background border-b">
        <div className="flex items-center gap-5">
          {toolTest && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setToolTest(null);
                form.reset(defaultValues);
              }}
              className="cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex flex-col gap-2">
            <DialogTitle className="flex items-center gap-2">
              {toolName ? toolName : `Tool Test`}
            </DialogTitle>
          </div>
        </div>
        <DialogClose>
          <div
            className="p-1 rounded-md cursor-pointer hover:bg-secondary"
            onClick={onClose}
          >
            <X />
          </div>
        </DialogClose>
      </DialogHeader>
      <div className="max-h-[80vh] overflow-auto">
        {!loading && !toolTest && (
          <>
            <div className="mt-5 px-5 py-5 bg-primary/5 rounded-lg flex  gap-4 mx-4 border-l-5 border-primary">
              <div className="inline-flex item-start">
                <div className="flex p-1 w-8 h-8 rounded-md bg-primary/10 items-center justify-center">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                </div>
              </div>
              <div className="inline-flex flex-col items-start">
                <h4 className="text-base font-medium text-primary flex items-center mb-2">
                  <span>Test and Validate Tool</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Execute the selected tool using custom input parameters.
                  Provide the required values below and run the test to validate
                  the tool response before publishing.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form>
                <div className="px-4 space-y-5 pb-5 pt-3 min-h-[200px]">
                  {Object.entries(fields).map(([key, field]) => {
                    const isRequired = isFieldRequiredFromAnyOf(field);

                    return (
                      <FormField
                        key={key}
                        control={form.control}
                        name={key as any}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel
                              className={`text-foreground ${isRequired ? "required" : ""}`}
                            >
                              {field.title || key}
                            </FormLabel>
                            <FormControl>
                              {renderField(key, field, formField)}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                  {!isTestToolEnabled && (
                    <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
                      <div className="bg-gray-100 rounded-full p-4">
                        <Settings className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 max-w-md">
                        Configure your test parameters to get started. Add
                        headers or any other settings you need.
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </>
        )}

        {loading && (
          <div className="px-4 space-y-5 pb-5 pt-3">
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <div className="relative">
                <Loader className="mb-4 h-8 w-8 animate-spin" />
              </div>
              <span className="text-gray-600 font-medium animate-pulse">
                Running Test...
              </span>
            </div>
          </div>
        )}

        {!loading && toolTest && (
          <div className="px-4 ">
            <div className="text-xs font-medium text-muted-foreground mb-2"></div>

            {/* option 3 */}
            <div className="grid grid-cols-1 gap-4 min-h-[200px]">
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-base font-medium uppercase">input</span>
                </div>
                <pre className="text-xs leading-5 whitespace-pre-wrap font-mono">
                  <SmartContentViewer
                    content={watchedValues}
                    className="border-none"
                  />
                </pre>
              </div>
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-base font-medium uppercase">
                    output
                  </span>
                </div>
                <SmartContentViewer
                  content={toolTest}
                  className="border-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="px-4 py-4 bg-background border-t">
        {!toolTest ? (
          <Button
            onClick={onSubmit}
            className="w-full cursor-pointer"
            disabled={loading || isLoading || !isTestToolEnabled}
          >
            {(loading || isLoading) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {loading || isLoading ? "Running Test..." : "Run Test"}
          </Button>
        ) : (
          <Button onClick={onClose} className="w-full cursor-pointer">
            Close
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
