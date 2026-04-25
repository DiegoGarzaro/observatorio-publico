import { type SelectHTMLAttributes, forwardRef } from "react"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, className = "", id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              "w-full h-9 bg-bg-raised border border-border-default rounded-md",
              "text-sm text-text-primary",
              "pl-3 pr-8 appearance-none cursor-pointer",
              "transition-colors duration-150",
              "hover:border-border-focus",
              "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-danger",
              className,
            ].join(" ")}
            {...props}
          >
            {placeholder && (
              <option value="" className="bg-bg-overlay text-text-muted">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-overlay text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
export type { SelectProps, SelectOption }
