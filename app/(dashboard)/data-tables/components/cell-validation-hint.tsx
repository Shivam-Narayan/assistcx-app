"use client";

import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface CellValidationHintProps {
  message: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function CellValidationHint({
  message,
  children,
  fullWidth = false,
}: CellValidationHintProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visible = hovered || focused;
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (visible) updatePosition();
  }, [visible, updatePosition]);

  useEffect(() => {
    if (!visible) return;

    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [visible, updatePosition]);

  return (
    <>
      <div
        ref={anchorRef}
        className={cn("min-w-0", fullWidth && "w-full max-w-full")}
        onMouseEnter={() => {
          updatePosition();
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => {
          updatePosition();
          setFocused(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFocused(false);
          }
        }}
      >
        <div className="rounded-sm ring-1 ring-inset ring-destructive/70">
          {children}
        </div>
      </div>

      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="alert"
            className="pointer-events-none fixed z-[300] max-w-[min(16rem,calc(100vw-1rem))] -translate-y-full rounded-md border border-destructive/40 bg-white px-2.5 py-1.5 text-xs font-medium leading-snug text-red-600 shadow-md dark:border-destructive/50 dark:bg-background dark:text-red-400"
            style={{
              top: position.top - 6,
              left: position.left,
              minWidth: Math.min(position.width, 200),
            }}
          >
            {message}
          </div>,
          document.body,
        )}
    </>
  );
}
