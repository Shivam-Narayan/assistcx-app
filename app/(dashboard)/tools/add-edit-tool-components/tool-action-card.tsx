import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCopyToClipboard } from "@/helper/helper-function";
import toast from "react-hot-toast";
import { cn, handleSpaceValidation } from "@/lib/utils";
import { Check, ChevronDownIcon, Copy } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import ApiTypeRadioCard from "./api-type-radio";
import { endPointMethods } from "./tool-interfaces";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";

export interface ApiTypeOption {
  id: string;
  value: string;
  label: string;
}

interface ToolActionCardProps {
  form: UseFormReturn<any>;
  apiTypes: ApiTypeOption[];
  getApiType: "REST" | "ODATA" | "SOAP" | null | undefined;
  endPointMethod: string;
  userEvents: string;
  setMethodSelectionHandler: (value: string) => void;
}

export function ToolActionCard({
  form,
  apiTypes,
  getApiType,
  endPointMethod,
  userEvents,
  setMethodSelectionHandler,
}: ToolActionCardProps) {
  const [copied, copyToClipboard] = useCopyToClipboard(1500);

  return (
    <Card className="shadow-none p-0 gap-0 ">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className="flex gap-3 text-foreground/80 items-center text-lg font-medium 
           leading-none tracking-tight"
        >
          <span>Tool Action</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4 pb-2 flex flex-col ">
        <div className="space-y-3 pb-4">
          <Label className="text-foreground">API Type</Label>
          <div className="flex w-full space-x-4">
            {apiTypes.map((api) => (
              <ApiTypeRadioCard
                key={api.id}
                id={api.id}
                value={api.value}
                label={api.label}
                form={form}
                userEvents={userEvents}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3 pb-4">
          <FormField
            control={form.control}
            name="endpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground required">
                  End Point
                </FormLabel>
                <div className="flex flex-row items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="ml-auto h-9 w-fit shrink-0 rounded-r-none border-r-0 cursor-pointer"
                          disabled={
                            getApiType == "ODATA" ||
                            getApiType == "SOAP" ||
                            userEvents == "viewTool"
                          }
                        >
                          {endPointMethod ? (
                            endPointMethods.find(
                              (mth) => mth.value === endPointMethod,
                            )?.label
                          ) : (
                            <p className="font-normal text-muted-foreground">
                              METHOD
                            </p>
                          )}
                          <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="lg:w-[120px] p-0" align="end">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {endPointMethods.map((epm) => (
                              <CommandItem
                                className=""
                                value={epm.label}
                                key={epm.value}
                                onSelect={() =>
                                  setMethodSelectionHandler(epm.value)
                                }
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    epm.value === endPointMethod
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {epm.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormControl className="min-w-0 flex-1">
                    <div className="relative w-full group">
                      {userEvents === "viewTool" ? (
                        <ConditionalTooltip
                          content={field.value || "No value"}
                          maxWidth="400px"
                          className="text-sm"
                          fullWidth
                        >
                          <Input
                            id="endpoint"
                            placeholder="Enter end point"
                            {...field}
                            maxLength={600}
                            autoFocus={false}
                            className="w-full truncate rounded-l-none pr-10"
                            autoComplete="off"
                            disabled
                            onKeyDown={handleSpaceValidation}
                          />
                        </ConditionalTooltip>
                      ) : (
                        <Input
                          id="endpoint"
                          placeholder="Enter end point"
                          {...field}
                          maxLength={600}
                          autoFocus={false}
                          className="w-full rounded-l-none"
                          autoComplete="off"
                          onKeyDown={handleSpaceValidation}
                        />
                      )}

                      {userEvents === "viewTool" && (
                        <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
                          <ConditionalTooltip
                            content={copied ? "Copied!" : "Copy"}
                            alwaysShow
                            align="center"
                            showArrow
                            side="top"
                            sideOffset={4}
                          >
                            <button
                              type="button"
                              onClick={async () => {
                                if (!field.value) return;
                                try {
                                  await copyToClipboard(field.value);
                                } catch {
                                  toast.error("Unable to copy to clipboard");
                                }
                              }}
                              className="rounded-full p-1 opacity-0 pointer-events-none transition-opacity duration-20 group-hover:pointer-events-auto group-hover:opacity-100"
                            >
                              {copied ? (
                                <Check className="h-3.5! w-3.5! text-green-500" />
                              ) : (
                                <Copy
                                  size={16}
                                  className="opacity-70 hover:opacity-100"
                                />
                              )}
                            </button>
                          </ConditionalTooltip>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground required">
                  Content Type
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                  disabled={userEvents === "viewTool" || getApiType === "SOAP"}
                >
                  <FormControl>
                    <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      value="application/json"
                      className="cursor-pointer"
                    >
                      application/json
                    </SelectItem>
                    <SelectItem
                      value="application/xml"
                      className="cursor-pointer"
                    >
                      application/xml
                    </SelectItem>
                    {getApiType === "SOAP" && (
                      <SelectItem value="text/xml" className="cursor-pointer">
                        text/xml
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {endPointMethod == "POST" &&
            (getApiType == "SOAP" || getApiType == "REST") && (
              <FormField
                control={form.control}
                name="body_template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Body Template
                    </FormLabel>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Enter body template"
                        {...field}
                        rows={3}
                        disabled={userEvents == "viewTool"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ToolActionCard;
