import { type HTMLAttributes, forwardRef } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "bg-bg-surface border border-border-default rounded-md p-5",
        "transition-all duration-150",
        hover && "hover:border-border-focus hover:shadow-[0_0_0_1px_var(--color-accent-glow)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = "Card"

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={["flex items-center justify-between mb-4", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = "CardHeader"

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", children, ...props }, ref) => (
    <h3
      ref={ref}
      className={["text-sm font-semibold text-text-primary", className].join(" ")}
      {...props}
    >
      {children}
    </h3>
  )
)

CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = "", children, ...props }, ref) => (
    <p
      ref={ref}
      className={["text-sm text-text-muted leading-snug", className].join(" ")}
      {...props}
    >
      {children}
    </p>
  )
)

CardDescription.displayName = "CardDescription"

export { Card, CardHeader, CardTitle, CardDescription }
export type { CardProps }
