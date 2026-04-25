type AvatarSize = "sm" | "md" | "lg" | "xl"

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
}

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const classes = [
    "inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden",
    "bg-bg-raised border border-border-default",
    "font-medium text-text-secondary",
    sizeClasses[size],
    className,
  ].join(" ")

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={classes}
        onError={(e) => {
          e.currentTarget.style.display = "none"
          e.currentTarget.nextElementSibling?.removeAttribute("style")
        }}
      />
    )
  }

  return (
    <span className={classes} aria-label={name}>
      {getInitials(name)}
    </span>
  )
}

export { Avatar }
export type { AvatarProps, AvatarSize }
