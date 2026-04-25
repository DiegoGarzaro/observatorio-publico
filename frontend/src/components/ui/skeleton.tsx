import { type HTMLAttributes } from "react"

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={[
        "rounded-md bg-bg-raised animate-pulse",
        className,
      ].join(" ")}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="bg-bg-surface border border-border-default rounded-md p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable }
export type { SkeletonProps }
