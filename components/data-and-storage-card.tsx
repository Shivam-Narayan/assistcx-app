import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STORAGE_TYPES } from "@/lib/constants";
import { cn, formatComboBoxData, handleSpaceValidation } from "@/lib/utils";
import React from "react";
import {
  FieldValues,
  Form,
  FormProvider,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { ComboBox } from "./ui/combo-box";

interface DataAndStorageComponentProps<T extends FieldValues> {
  handleStorageType: UseFormReturn<T>;
  isRequired?: boolean;
  mountPaths?: string[];
  isEditable: boolean;
}

const StorageOption = <T extends FieldValues>({
  id,
  value,
  label,
  storage_type,
  register,
  isEditable,
  onUnselect,
}: {
  id: string;
  value: string;
  label: string;
  storage_type: string | undefined;
  register: UseFormReturn<T>["register"];
  isEditable?: boolean;
  onUnselect?: () => void;
}) => {
  const isSelected = storage_type === value;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditable) return;
    if (isSelected) {
      e.preventDefault();
      onUnselect && onUnselect();
    }
  };

  return (
    <div className="relative w-full">
      <input
        {...register("storage_type" as Path<T>)}
        className="peer hidden"
        id={id}
        type="radio"
        value={value}
        disabled={!isEditable}
      />
      <span
        className={`absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 ${
          storage_type === value ? "border-primary" : "border-border"
        }`}
      ></span>
      <label
        className={`flex cursor-pointer flex-col rounded-lg border p-4 peer-checked:border ${
          storage_type === value ? "bg-muted border-primary" : "border-border"
        }`}
        htmlFor={id}
        onClick={handleClick}
      >
        <span className="text-base font-semibold">{label}</span>
      </label>
    </div>
  );
};

const DataAndStorageCard = <T extends FieldValues>({
  handleStorageType,
  isRequired,
  mountPaths,
  isEditable,
}: DataAndStorageComponentProps<T>) => {
  const storage_type = handleStorageType.watch("storage_type" as Path<T>);

  const clearStorageType = () => {
    handleStorageType.setValue(
      "storage_type" as Path<T>,
      "" as PathValue<T, Path<T>>,
    );
    handleStorageType.setValue(
      "mount_path" as Path<T>,
      "" as PathValue<T, Path<T>>,
    );
    handleStorageType.setValue(
      "bucket_name" as Path<T>,
      "" as PathValue<T, Path<T>>,
    );
  };

  return (
    <>
      <div className="flex items-center justify-center w-full overflow-x-hidden">
        <div className="w-full space-y-2">
          <Label className="text-foreground">
            Storage Type
            {/* {isRequired && (
              <span className="text-destructive text-lg">&nbsp;*</span>
            )} */}
          </Label>

          <div className="flex flex-wrap gap-4 w-full min-w-0">
            <div
              className={cn(
                "flex-1 min-w-[240px]",
                !isEditable && "pointer-events-none opacity-60",
              )}
            >
              <StorageOption
                id="radio_1"
                value={STORAGE_TYPES.LOCAL}
                label="Mounted Storage"
                storage_type={storage_type}
                register={handleStorageType.register}
                isEditable={isEditable}
                onUnselect={clearStorageType}
              />
            </div>
            <div
              className={cn(
                "flex-1 min-w-[240px]",
                !isEditable && "pointer-events-none opacity-60",
              )}
            >
              <StorageOption
                id="radio_2"
                value={STORAGE_TYPES.REMOTE}
                label="Remote Bucket"
                storage_type={storage_type}
                register={handleStorageType.register}
                isEditable={isEditable}
                onUnselect={clearStorageType}
              />
            </div>
          </div>

          {handleStorageType.formState.errors.storage_type?.message && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {typeof handleStorageType.formState.errors.storage_type
                ?.message === "string" &&
                handleStorageType.formState.errors.storage_type.message}
            </p>
          )}

          {/* Conditional field render */}
          {storage_type === STORAGE_TYPES.LOCAL && (
            <MountedStorageFields
              handleStorageType={handleStorageType}
              mountPaths={mountPaths}
              isEditable={isEditable}
            />
          )}
          {storage_type === STORAGE_TYPES.REMOTE && (
            <RemoteS3BucketFields
              handleStorageType={handleStorageType}
              isEditable={isEditable}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default DataAndStorageCard;

function MountedStorageFields<T extends FieldValues>({
  handleStorageType,
  mountPaths = [],
  isEditable,
}: DataAndStorageComponentProps<T>) {
  const mountPathItems = formatComboBoxData(mountPaths);
  return (
    <div className="space-y-4 py-1 px-1">
      <FormProvider {...handleStorageType}>
        <Form>
          <div className="w-full space-y-4">
            {/* Mount Path Dropdown */}
            <FormField
              control={handleStorageType.control}
              name={"mount_path" as Path<T>}
              render={({ field }) => (
                <FormItem className="flex flex-col ">
                  <FormLabel
                    className="text-foreground"
                    onClick={(e) => e.preventDefault()}
                  >
                    Mount Path
                    <span className="text-destructive text-lg">*</span>
                  </FormLabel>
                  <ComboBox
                    items={mountPathItems}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!isEditable}
                    placeholder="Select Mount Path"
                    displayAsBadge={true}
                    buttonClassName="w-full"
                    popoverSideOffset={4}
                    commandGroupClassName="max-h-[160px] overflow-y-auto"
                    searchPlaceholder="Search Mount Path"
                  />

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Folder Name */}
            <FormField
              control={handleStorageType.control}
              name={"folder_name" as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Data Folder
                    <span className="text-destructive text-lg">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter folder name"
                      {...field}
                      maxLength={80}
                      autoFocus={false}
                      autoComplete="off"
                      onKeyDown={handleSpaceValidation}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </FormProvider>
    </div>
  );
}

function RemoteS3BucketFields<T extends FieldValues>({
  handleStorageType,
  isEditable,
}: DataAndStorageComponentProps<T>) {
  return (
    <div className="space-y-4 py-1 px-1">
      <FormProvider {...handleStorageType}>
        <Form>
          <div className="w-full space-y-4">
            {/* Bucket Name */}
            <FormField
              control={handleStorageType.control}
              name={"bucket_name" as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Bucket Name
                    <span className="text-destructive text-lg">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter bucket name"
                      {...field}
                      maxLength={80}
                      autoFocus={false}
                      autoComplete="off"
                      onKeyDown={handleSpaceValidation}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Folder Name (shared with mounted) */}
            <FormField
              control={handleStorageType.control}
              name={"folder_name" as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Data Folder
                    <span className="text-destructive text-lg">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter folder name"
                      {...field}
                      maxLength={80}
                      autoFocus={false}
                      autoComplete="off"
                      onKeyDown={handleSpaceValidation}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </FormProvider>
    </div>
  );
}
