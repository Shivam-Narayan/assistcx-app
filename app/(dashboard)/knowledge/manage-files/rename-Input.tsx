import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleSpaceValidation } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";

interface RenameInputProps {
  initialName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

export default function RenameInput({
  initialName,
  onRename,
  onCancel,
}: RenameInputProps) {
  const [newName, setNewName] = React.useState(initialName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus and select text when component mounts
  React.useEffect(() => {
    // Small timeout to ensure the input is rendered
    const timeoutId = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Select the name part without the extension
        const lastDotIndex = initialName.lastIndexOf(".");
        if (lastDotIndex > 0) {
          inputRef.current.setSelectionRange(0, lastDotIndex);
        } else {
          inputRef.current.select();
        }
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRename(newName.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input
        ref={inputRef}
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={handleSpaceValidation}
        className="w-full"
      />
      <span className={`${!newName ? "cursor-not-allowed" : ""}`}>
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="hover:bg-primary/10"
          disabled={!newName}
        >
          <CheckCircle strokeWidth={1.5} size={20} />
        </Button>
      </span>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="hover:bg-primary/10"
        onClick={onCancel}
      >
        <XCircle strokeWidth={1.5} size={20} />
      </Button>
    </form>
  );
}
