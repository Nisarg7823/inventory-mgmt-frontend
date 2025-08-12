import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "px-3 py-2 rounded-[var(--radius)] border border-[color:var(--border)] bg-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";


