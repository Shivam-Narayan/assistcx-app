import * as React from 'react';

import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

// export type SearchProps = React.InputHTMLAttributes<HTMLInputElement>;

const Search = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex h-9 items-center rounded-md border border-input bg-white pl-2.5 text-sm shadow-xs transition-colors ring-offset-background focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-0',
          className
        )}
      >
        <MagnifyingGlassIcon className='h-[20px] w-[20px]' />
        <input
          {...props}
          type={type}
          ref={ref}
          className='w-full px-2 py-1 rounded-md placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    );
  }
);

Search.displayName = 'Search';

export { Search };
