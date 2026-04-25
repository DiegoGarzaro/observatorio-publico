import { type HTMLAttributes } from "react"

type BadgeVariant = "default" | "positive" | "warning" | "danger" | "accent"

const variantClasses: Record<BadgeVariant, string> = {
  default:  "bg-bg-overlay text-text-secondary border-border-default",
  positive: "bg-positive/10 text-positive border-positive/30",
  warning:  "bg-warning/10 text-warning border-warning/30",
  danger:   "bg-danger/10 text-danger border-danger/30",
  accent:   "bg-accent-glow text-accent border-accent/30",
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "rounded border px-2 py-0.5",
        "text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant }
