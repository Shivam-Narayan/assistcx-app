import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Lock } from "lucide-react";
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddNewToolFormSchemaType } from "@/lib/schemas/tools-schemas";
import APIKeyFields from "./agent-tool-auth-components/api-key-fields";
import BasicAuthFields from "./agent-tool-auth-components/basic-auth-fields";
import BearerAuthFields from "./agent-tool-auth-components/bearer-auth-fields";
import OAuth2Fields from "./agent-tool-auth-components/q-auth2-fields";
import { EmptyState } from "@/components/empty-state/empty-state";

export interface AuthToolsProps {
  cardTitle?: string;
  userEvents: string;
}

export interface AgentToolAuthProps {
  formValue: UseFormReturn<AddNewToolFormSchemaType>;
}

const AUTH_TYPES = ["Basic", "Bearer", "OAuth2", "APIKey"];

const AgentToolAuth = ({
  cardTitle,
  formValue,
  userEvents,
}: AuthToolsProps & AgentToolAuthProps) => {
  const authType = formValue.watch("auth_type");

  const [open, setOpen] = React.useState(false);
  const [selectedAuth, setSelectedAuth] = React.useState(
    authType !== "" ? authType : "No Auth",
  );

  const agentToolsAuth = React.useMemo(() => {
    const authModal = AUTH_TYPES.map((key) => ({
      label: key,
      value: key,
    }));

    return [
      {
        label: "No Auth",
        value: "No Auth",
      },
      ...authModal,
    ];
  }, []);

  // Update selected auth fields based on selectedAuth
  useEffect(() => {
    if (selectedAuth) {
      formValue.setValue("auth_type", selectedAuth);
    }
  }, [selectedAuth, agentToolsAuth, formValue]);

  return (
    <Card className="shadow-none p-0 gap-0 ">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className="flex gap-3 text-foreground/80 items-center text-lg font-medium  
           leading-none tracking-tight"
        >
          <span>{cardTitle}</span>
        </CardTitle>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-[200px] justify-between cursor-pointer",
                !selectedAuth && "text-muted-foreground",
              )}
              disabled={userEvents === "viewTool"}
            >
              {selectedAuth
                ? agentToolsAuth.find((auth) => auth.value === selectedAuth)
                    ?.label
                : "Select Auth"}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 ">
            <Command>
              <CommandInput placeholder="Search auth..." />
              <CommandList>
                <CommandEmpty>No auth found.</CommandEmpty>
                <CommandGroup>
                  {agentToolsAuth.map((auth) => (
                    <CommandItem
                      className="cursor-pointer"
                      value={auth.label}
                      key={auth.value}
                      onSelect={() => {
                        setSelectedAuth(auth.value);
                        setOpen(false);
                      }}
                    >
                      {auth.label}
                      <div className="ml-auto h-6 w-6 flex items-center justify-center">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            auth.value === selectedAuth
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="px-4 py-4 pb-2 flex flex-col">
        <div className="space-y-3 pb-4">
          {selectedAuth === "No Auth" && (
            <EmptyState
              variant="card"
              compact
              icon={<Lock />}
              title="No Authentication Required"
              description="Configure an authentication method to securely connect with the external service."
            />
          )}
          {selectedAuth === "Basic" && (
            <BasicAuthFields formValue={formValue} userEvents={userEvents} />
          )}
          {selectedAuth === "Bearer" && (
            <BearerAuthFields formValue={formValue} userEvents={userEvents} />
          )}
          {selectedAuth === "OAuth2" && (
            <OAuth2Fields formValue={formValue} userEvents={userEvents} />
          )}
          {selectedAuth === "APIKey" && (
            <APIKeyFields formValue={formValue} userEvents={userEvents} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentToolAuth;
