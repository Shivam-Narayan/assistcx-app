import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface CustomAlertDialogProps {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  handleAlert: (data: string) => void;
  isLoading?: boolean;
  isMailboxStart?: boolean;
}

const OPTIONS = [
  { id: "Continue", label: "Now" },
  { id: "one", label: "1 Day" },
  { id: "seven", label: "7 Days" },
  { id: "fifteen", label: "15 Days" },
] as const;

const CustomAlertDialog = ({
  open,
  title,
  description,
  onOpenChange,
  handleAlert,
  isLoading = false,
  isMailboxStart,
}: CustomAlertDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string>("Continue");

  const handleContinueClick = () => {
    handleAlert(isMailboxStart ? selectedOption : "Continue");
  };

  useEffect(() => {
    if (open) {
      setSelectedOption("Continue");
    }
  }, [open, isMailboxStart]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {isMailboxStart && (
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="grid grid-cols-4 gap-2 py-4"
          >
            {OPTIONS.map(({ id, label }) => (
              <FieldLabel key={id} htmlFor={id}>
                <Field
                  orientation="horizontal"
                  className={`p-2 cursor-pointer gap-1 rounded-lg transition-all duration-200`}
                >
                  <FieldContent>
                    <FieldTitle>{label}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem
                    value={id}
                    id={id}
                    className={`flex-shrink-0 mt-0.5 transition-all duration-200`}
                  />
                </Field>
              </FieldLabel>
              // <Label
              //   key={id}
              //   htmlFor={id}
              //   className={`p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
              //     selectedOption === id
              //       ? "border-black bg-gray-50 shadow-xs"
              //       : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
              //   }`}
              // >
              //   <div className="flex items-center space-x-2">
              //     <RadioGroupItem value={id} id={id} />
              //     <span className="text-sm font-medium">{label}</span>
              //   </div>
              // </Label>
            ))}
          </RadioGroup>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleContinueClick}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlertDialog;
