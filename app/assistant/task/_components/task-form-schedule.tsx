import { DatePicker } from "@/components/assistant/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskFormScheduleProps } from "./types";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SCHEDULE_TYPES = ["once", "daily", "weekly", "monthly", "yearly"];

export function TaskFormSchedule({ form, activeTab }: TaskFormScheduleProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">Schedule</h2>
      <FormField
        control={form.control}
        name="scheduleType"
        render={({ field }) => (
          <FormItem>
            <Tabs
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                (
                  ["date", "dayOfWeek", "dayOfMonth", "month", "time"] as const
                ).forEach((f) => form.resetField(f));
              }}
              className="w-full"
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
                {/* Time — always shown */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="px-1">Time</FormLabel>
                      <FormControl className="w-full block">
                        <Input
                          type="time"
                          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date — once / yearly */}
                {(activeTab === "once" || activeTab === "yearly") && (
                  <FormField
                    control={form.control}
                    name="date"
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

                {/* Day of Week — weekly */}
                {activeTab === "weekly" && (
                  <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger className="cursor-pointer my-0! focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem
                                key={day}
                                value={day}
                                className="cursor-pointer"
                              >
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-2" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Day of Month — monthly */}
                {activeTab === "monthly" && (
                  <FormField
                    control={form.control}
                    name="dayOfMonth"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Day of Month</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            min={1}
                            max={31}
                            placeholder="1-31"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
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
          </FormItem>
        )}
      />
    </div>
  );
}
