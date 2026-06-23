"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MagicWandIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

const CustomCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
        ref={ref}
      className={cn(
        `peer h-5 w-5 shrink-0 rounded-sm border ${ checked ? 'border-primary' : 'border-primary'} shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground`,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      > 
        <MagicWandIcon className="h-5 w-5 bg-primary text-primary" color="rgb(255 255 255)"  />
        {/* {(checked === 'indeterminate' || checked === false) && <MagicWandIcon className="h-5 w-5" color=""  /> }
        {checked === true && <MagicWandIcon className="h-5 w-5" color="rgb(255 255 255)"  />} */}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
CustomCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { CustomCheckbox };
