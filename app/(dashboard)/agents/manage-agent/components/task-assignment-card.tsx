"use client";

import { DatePicker } from "@/components/assistant/date-picker";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ComboBox } from "@/components/ui/combo-box";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  Brain,
  CalendarCheck,
  Clock,
  LucideIcon,
  Mail,
  MessageSquare,
  SquareCheck,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useAgentConfigData } from "../hook/useAgentConfigData";
import { AgentFormValues } from "../schemas/agent-schema";
import { Badge } from "@/components/ui/badge";

type InfoRowProps = {
  value: any;
};

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SCHEDULE_TYPES = ["daily", "weekly", "monthly", "yearly"];

type SettingItemProps = {
  value: string;
  label: string;
  description: string;
  isSelected: boolean;
  isEditable: boolean;
  extraContent?: React.ReactNode;
  Icon: LucideIcon;
  onClick?: (value: string) => void;
};

const SettingItem = ({
  Icon,
  value,
  label,
  description,
  isSelected,
  isEditable,
  extraContent,
  onClick,
}: SettingItemProps) => (
  <Item
    variant="outline"
    onClick={() => {
      onClick?.(value);
    }}
  >
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <ItemTitle>{label}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </div>

        <div
          className={`${isEditable ? "cursor-pointer" : "none"} border-input flex h-4 w-4 items-center justify-center rounded-full border`}
        >
          {isSelected && <div className="bg-primary h-2 w-2 rounded-full" />}
        </div>
      </div>

      {isSelected && extraContent && (
        <div
          className="mt-3 rounded-lg border border-primary/40 border-dashed bg-muted/30 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {extraContent}
        </div>
      )}
    </div>
  </Item>
);

// Task Source item list
const assignmentItems = [
  {
    value: "ai",
    label: "AI Assignment",
    description:
      "Automatically route tasks to this agent based on intent classification",
    Icon: Brain,
  },
  {
    value: "mailbox",
    label: "Mailbox Assignment",
    description:
      "Assign specific mailbox to this agent to receive new emails as tasks",
    Icon: Mail,
    extraContent: <MailboxAssignmentFields />,
  },
  {
    value: "task_api",
    label: "External Task API",
    description:
      "Receive tasks via an external task API instead of intent or mailbox routing",
    Icon: Zap,
  },
  {
    value: "schedule",
    label: "Schedule",
    description:
      "Trigger tasks automatically based on predefined schedules and recurring time intervals",
    Icon: Clock,
    extraContent: <SheduleCard />,
  },
  {
    value: "assistant",
    label: "Assistant",
    description:
      "Enable this agent to act as an AI assistant for handling conversations",
    Icon: MessageSquare,
  },
];

const TaskAssignmentCard = ({ isEditing }: { isEditing: boolean }) => {
  const { control, watch, setValue, trigger } =
    useFormContext<AgentFormValues>();
  const assignmentType = watch("settings.assignment_type");
  const {
    formState: { errors },
  } = useFormContext<AgentFormValues>();

  const handleTaskSourceClick = (value: string) => {
    if (!isEditing) return;

    if (assignmentType === value) {
      setValue("settings.assignment_type", null, {
        shouldDirty: true,
      });
    } else {
      setValue("settings.assignment_type", value as any, {
        shouldDirty: true,
      });
    }

    trigger("settings");
  };

  const selectedItem = assignmentItems.find(
    (item) => item.value === assignmentType,
  );

  return (
    <Card className="overflow-hidden shadow-none p-0 gap-0">
      <CardHeader className="border-b bg-muted px-4 !py-4">
        <h3 className="text-base font-semibold leading-none tracking-tight">
          Task Source
        </h3>
        <p className="text-xs text-muted-foreground">
          Choose how tasks are routed and assigned to this agent
        </p>
      </CardHeader>

      {isEditing ? (
        <CardContent className="py-6">
          <ItemGroup className="gap-4">
            {assignmentItems.map((item) => (
              <SettingItem
                key={item.value}
                {...item}
                isSelected={assignmentType === item.value}
                isEditable={isEditing}
                onClick={handleTaskSourceClick}
              />
            ))}
          </ItemGroup>
        </CardContent>
      ) : assignmentType == null ? (
        <CardContent className="py-6">
          <EmptyState
            variant="card"
            compact
            icon={<SquareCheck />}
            title="No Task Source Selected"
            description="This agent does not have a task source configured yet. Select a task source to define how tasks are routed and assigned."
          />
        </CardContent>
      ) : (
        <>
          {selectedItem && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <selectedItem.Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <h4 className="font-medium">{selectedItem.label}</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedItem.description}
                  </p>

                  <div className="mt-2">
                    <AssignmentDetails assignmentType={assignmentType} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default TaskAssignmentCard;

function MailboxAssignmentFields() {
  const { loading } = useAxiosAuth();
  const { getMailboxPolling, mailboxData } = useAgentConfigData();
  const { control } = useFormContext<AgentFormValues>();

  const mailboxDatalist = mailboxData.map((item: any) => ({
    value: item.value,
    label: item.label,
  }));

  useEffect(() => {
    getMailboxPolling();
  }, [loading]);

  return (
    <div className="space-y-4 py-1">
      <FormField
        control={control}
        name="settings.mailbox_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              Mailbox<span className="text-destructive text-lg">&nbsp;*</span>
            </FormLabel>
            <ComboBox
              items={mailboxDatalist}
              value={field.value}
              onChange={field.onChange}
              placeholder="Search Mail"
              buttonClassName="w-full bg-white dark:bg-input/30"
              searchPlaceholder="Search Mail"
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function SheduleCard() {
  const { control, watch, setValue, trigger, getValues } =
    useFormContext<AgentFormValues>();
  const activeTab = watch("settings.schedule_config.type") || "daily";

  // Ensure type is always written into the form (|| "daily" only sets display)
  useEffect(() => {
    if (!getValues("settings.schedule_config.type")) {
      setValue("settings.schedule_config.type", "daily", {
        shouldDirty: true,
      });
    }
  }, []);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const type = value as "daily" | "weekly" | "monthly" | "yearly";
        setValue("settings.schedule_config.type", type, {
          shouldDirty: true,
          shouldValidate: true,
        });

        // Clear sibling fields that don't apply to the new type
        if (type !== "weekly") setValue("settings.schedule_config.dayOfWeek", undefined);
        if (type !== "monthly") setValue("settings.schedule_config.dayOfMonth", undefined);
        if (type !== "yearly") setValue("settings.schedule_config.date", undefined);

        trigger("settings.schedule_config");
      }}
      className="mt-3 w-full"
    >
      <TabsList className="flex flex-wrap sm:gap-4 !h-auto py-1 px-1 rounded-md border w-full">
        {SCHEDULE_TYPES.map((type) => (
          <TabsTrigger
            key={type}
            value={type}
            className={`h-8 cursor-pointer hover:bg-white capitalize md:px-5 ${
              activeTab === type ? "bg-primary! !text-white" : ""
            }`}
          >
            {type}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-3 flex gap-4">
        <FormField
          control={control}
          name="settings.schedule_config.time"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-foreground">Time</FormLabel>
              <FormControl>
                <Input
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  type="time"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {activeTab === "yearly" && (
          <FormField
            control={control}
            name="settings.schedule_config.date"
            render={({ field }) => (
              <DatePicker
                label="Select Date"
                field={field}
                disabledPastDate={true}
                toYear={new Date().getFullYear() + 1}
              />
            )}
          />
        )}

        {activeTab === "weekly" && (
          <FormField
            control={control}
            name="settings.schedule_config.dayOfWeek"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-foreground">Day of Week</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {activeTab === "monthly" && (
          <FormField
            control={control}
            name="settings.schedule_config.dayOfMonth"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-foreground">Day of Month</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={field.value != null ? Number(field.value) : ""}
                    placeholder="1-31"
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(
                        value >= 1 && value <= 31 ? value : undefined,
                      );
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </Tabs>
  );
}

function AssignmentDetails({
  assignmentType,
}: {
  assignmentType: string | null;
}) {
  const { watch } = useFormContext<AgentFormValues>();
  const mailboxName = watch("settings.mailbox_name");
  const scheduleType = watch("settings.schedule_config.type");
  const scheduleTime = watch("settings.schedule_config.time");

  switch (assignmentType) {
    case "mailbox":
      return <InfoRow value={mailboxName || "-"} />;

    case "schedule":
      return (
        <InfoRow
          value={
            scheduleType
              ? `${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)}${
                  scheduleTime ? ` at ${scheduleTime}` : ""
                }`
              : "-"
          }
        />
      );

    default:
      return null;
  }
}

function InfoRow({ value }: InfoRowProps) {
  return (
    <Badge
      variant="outline"
      className="flex w-fit rounded-full items-center bg-primary/10 text-primary px-3 py-2"
    >
      <span className="wrap-break-word min-w-0 overflow-hidden">
        {value || "-"}
      </span>
    </Badge>
  );
}
