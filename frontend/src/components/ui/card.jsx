import { cn } from "../../lib/utils"

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[0_18px_40px_rgba(0,0,0,0.24)]",
        className
      )}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />
}
