import React, { useRef, useEffect, useCallback, forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { handleSpaceValidation } from "@/lib/utils";

interface AutoGrowingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
}

// Use forwardRef to forward the ref to the Textarea component
const AutoGrowingTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoGrowingTextareaProps
>(({ maxHeight = 260, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const currentRef =
      textareaRef.current ??
      (ref as React.RefObject<HTMLTextAreaElement>).current;
    if (currentRef) {
      currentRef.style.height = "auto";
      const scrollHeight = currentRef.scrollHeight;
      currentRef.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [maxHeight, ref]);

  useEffect(() => {
    autoResize();
    const handleResize = () => autoResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [autoResize, props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResize();
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <Textarea
      {...props}
      ref={textareaRef}
      onChange={handleChange}
      onKeyDown={handleSpaceValidation}
      className={`field-sizing-fixed min-w-0 w-full resize-none overflow-x-hidden overflow-y-auto break-words [overflow-wrap:anywhere] ${props.className || ""}`}
      style={{
        ...props.style,
        maxHeight: `${maxHeight}px`,
        minHeight: props.rows ? `${props.rows * 1.5}em` : undefined,
      }}
    />
  );
});

AutoGrowingTextarea.displayName = "AutoGrowingTextarea";

export default AutoGrowingTextarea;
