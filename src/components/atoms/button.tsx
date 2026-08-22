import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva("button", {
  variants: {
    intent: {
      primary: "button--primary",
      secondary: "button--secondary",
      ghost: "button--ghost",
    },
    size: {
      small: "button--small",
      medium: null,
      large: "button--large",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  asChild = false,
  className,
  intent,
  size,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";

  return (
    <Component
      className={cn(buttonVariants({ intent, size }), className)}
      {...props}
    />
  );
}
