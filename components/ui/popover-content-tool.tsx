import React from "react";
import { cn } from "@/lib/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";

const PopoverContentTool = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  (
    { className, align = "center", side = "top", sideOffset = 4, ...props },
    ref
  ) => (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      side={side}
      avoidCollisions={false}
      collisionPadding={0}
      className={cn(
        "z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    />
  )
);
PopoverContentTool.displayName = PopoverPrimitive.Content.displayName;
export { PopoverContentTool };
