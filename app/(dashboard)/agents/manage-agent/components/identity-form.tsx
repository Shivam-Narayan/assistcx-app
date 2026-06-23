"use client";
import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import { ComboBox } from "@/components/ui/combo-box";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { agentStyles } from "@/lib/constants";
import { handleSpaceValidation } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

interface Props {
  isEditing: boolean;
}

const IdentityForm = ({ isEditing }: Props) => {
  const { control, getValues } = useFormContext();
  const agentIcons = getIconsData("agent_icons");
  const defaultIcon = getIconSvg("chat-bot", "agent_icons");
  const identity = getValues("identity");

  return (
    <>
      <FormField
        control={control}
        name="identity.icon"
        render={({ field }) => (
          <IconPicker
            label="Agent Icon"
            icons={agentIcons}
            field={field}
            defaultIcon={defaultIcon}
            disabled={!isEditing}
          />
        )}
      />
      {/* Name */}
      <FormField
        control={control}
        name="identity.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              Name<span className="text-destructive text-lg"> *</span>
            </FormLabel>
            <FormControl>
              <Input
                autoComplete="off"
                placeholder="Enter name"
                {...field}
                maxLength={80}
                minLength={6}
                onKeyDown={handleSpaceValidation}
                disabled={!isEditing}
                className="disabled:opacity-80"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Goal */}
      <FormField
        control={control}
        name="identity.goal"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              Goal<span className="text-destructive text-lg"> *</span>
            </FormLabel>
            <FormControl>
              <Input
                autoComplete="off"
                placeholder="Enter goal"
                {...field}
                maxLength={80}
                minLength={6}
                onKeyDown={handleSpaceValidation}
                disabled={!isEditing}
                className="disabled:opacity-80"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Style */}
      <FormField
        control={control}
        name="identity.style"
        render={({ field }) => (
          <FormItem className="flex flex-col mt-2!">
            <FormLabel
              className="text-foreground"
              onClick={(e) => e.preventDefault()}
            >
              Style<span className="text-destructive text-lg"> *</span>
            </FormLabel>

            <ComboBox
              items={agentStyles}
              value={field.value}
              onChange={field.onChange}
              disabled={!isEditing}
              placeholder="Select Style"
              buttonClassName="w-full disabled:opacity-70"
              searchPlaceholder="Search Style..."
            />
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Description */}
      <FormField
        control={control}
        name="identity.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">
              Description
              <span className="text-destructive text-lg"> *</span>
            </FormLabel>
            <FormControl>
              <AutoGrowingTextarea
                placeholder="Enter description"
                {...field}
                maxLength={1000}
                minLength={10}
                maxHeight={140}
                disabled={!isEditing}
                className="disabled:opacity-80"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default IdentityForm;
