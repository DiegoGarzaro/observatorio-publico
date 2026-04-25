import { type InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full h-9 bg-bg-raised border border-border-default rounded-md",
              "text-sm text-text-primary placeholder:text-text-muted",
              "transition-colors duration-150",
              "hover:border-border-focus",
              "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              leftIcon ? "pl-9 pr-3" : "px-3",
              error && "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(254,87,87,0.12)]",
              className,
            ].join(" ")}
            {...props}
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
export type { InputProps }
