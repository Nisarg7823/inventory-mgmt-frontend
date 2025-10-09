import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger";

export function Badge({ className, tone = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    default: "bg-black/10 dark:bg-white/10 text-foreground",
    success: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-600/15 text-amber-700 dark:text-amber-300",
    danger: "bg-red-600/15 text-red-700 dark:text-red-300",
  };
  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}






