import { type ReactNode } from "react"
import { Badge, type BadgeVariant } from "./badge"

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  badge?: { label: string; variant: BadgeVariant }
  icon?: ReactNode
  className?: string
}

function StatCard({ label, value, description, badge, icon, className = "" }: StatCardProps) {
  return (
    <div
      className={[
        "bg-bg-surface border border-border-default rounded-md p-5",
        "transition-all duration-150",
        "hover:border-border-focus",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono text-text-primary leading-none">
          {value}
        </span>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-text-muted">{description}</p>
      )}
    </div>
  )
}

export { StatCard }
export type { StatCardProps }
