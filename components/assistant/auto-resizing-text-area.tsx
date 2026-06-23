import React, { useEffect, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { AutoResizingTextareaProps } from "./types";

const AutoResizingTextarea: React.FC<AutoResizingTextareaProps> = ({
  value,
  onChange,
  placeholder = "Type here...",
  className = "",
  disabled = false,
  onFocus = () => {},
  onBlur = () => {},
  id,
  name,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to measure correctly
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust to content height
      textareaRef.current.style.resize = "none"; // Disable manual resizing
    }
  }, [value]); // Trigger auto-resize whenever value changes

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value); // Notify parent of the new value
  };

  // Ensure onFocus and onBlur are triggered
  const handleFocus = () => {
    onFocus(); // Call the parent's onFocus function if provided
  };

  const handleBlur = () => {
    onBlur(); // Call the parent's onBlur function if provided
  };

  return (
    <Textarea
      ref={textareaRef}
      id={id}
      name={name}
      className={` ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={handleInput}
      rows={5}
      disabled={disabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

export default AutoResizingTextarea;
