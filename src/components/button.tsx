import type { ComponentProps } from "react";

export function Button({
  type,
  className,
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      {...props}
      type={type ?? "button"}
      className={`cursor-pointer rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-medium backdrop-invert-50 transition-opacity hover:opacity-80 active:opacity-70 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
