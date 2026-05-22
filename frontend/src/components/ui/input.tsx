import * as React from "react"
import { cn } from "@/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border border-gray-300 bg-transparent px-4 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:placeholder:text-gray-500",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium ml-1">{error}</span>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
