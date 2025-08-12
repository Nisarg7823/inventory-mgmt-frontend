"use client";

import { ButtonHTMLAttributes, ReactElement, cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-[var(--radius)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
    const variants: Record<Variant, string> = {
      primary: "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90",
      secondary: "border border-[color:var(--border)] hover:bg-[color:var(--muted)]/60",
      ghost: "hover:bg-black/5 dark:hover:bg-white/5",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/40",
    };
    const sizes: Record<Size, string> = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    const classes = cn(base, variants[variant], sizes[size], className);

    if (asChild && isValidElement(children)) {
      // Only merge className to avoid type mismatches with arbitrary child elements
      return cloneElement(children as ReactElement<any>, {
        className: cn((children as any).props?.className, classes),
      } as any);
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";


