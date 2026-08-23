import type { ComponentProps } from "react";
import { cn } from "../lib/tailwind";

export const Button = ({
  type,
  className,
  children,
  ...props
}: ComponentProps<"button">) => (
  <button
    {...props}
    type={type ?? "button"}
    className={cn(
      "cursor-pointer rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-medium backdrop-blur-2xl backdrop-contrast-50 transition-opacity hover:opacity-80 active:opacity-70",
      className,
    )}
  >
    {children}
  </button>
);
