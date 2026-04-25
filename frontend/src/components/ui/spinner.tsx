type SpinnerSize = "sm" | "md" | "lg"

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <svg
      className={["animate-spin text-accent", sizeClasses[size], className].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Carregando"
      role="status"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export { Spinner }
export type { SpinnerProps, SpinnerSize }
