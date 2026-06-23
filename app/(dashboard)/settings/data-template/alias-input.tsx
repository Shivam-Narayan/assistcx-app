import { useState, useEffect } from "react";
import { useController, Control } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AliasInputProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any, any, any>;
  localError?: any;
  setLocalError?: any;
}

export const AliasInput: React.FC<AliasInputProps> = ({
  name,
  control,
  localError,
  setLocalError,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [input, setInput] = useState("");

  // Ensure keywords is always a string array
  const aliases: string[] = Array.isArray(field.value) ? field.value : [];

  const handleAdd = () => {
    const value = input.trim();
    if (value.length > 25) {
      setLocalError("Only 25 characters allowed per keyword");
      return;
    }
    if (value && !aliases.includes(value)) {
      const updated = [...aliases, value];
      field.onChange(updated);
    }
    setInput("");
    setLocalError("");
  };

  const handleRemove = (val: string) => {
    const updated = aliases.filter((a) => a !== val);
    field.onChange(updated);
    setLocalError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check if the input contains commas
    if (value.includes(",")) {
      const parts = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v.length <= 25 && !aliases.includes(v));

      if (parts.length > 0) {
        const updated = [...aliases, ...parts];
        field.onChange(updated);
      }

      setInput("");
      setLocalError("");
    } else {
      setInput(value);
      if (value.length > 25) {
        setLocalError("Only 25 characters allowed per keyword");
      } else {
        setLocalError("");
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-within:ring-1 focus-within:ring-ring focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        {aliases.map((alias) => (
          <Badge
            key={alias}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {alias}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => handleRemove(alias)}
            />
          </Badge>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter keywords"
          className="outline-hidden w-auto flex-1 placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
        />
      </div>
      {localError && (
        <p className="text-[0.8rem] font-medium text-destructive">
          {localError}
        </p>
      )}
    </>
  );
};
