import { type ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

function EmptyState({ title, description, icon, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        "py-16 px-8",
        className,
      ].join(" ")}
    >
      {icon && (
        <span className="mb-4 text-text-muted opacity-50">{icon}</span>
      )}

      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
