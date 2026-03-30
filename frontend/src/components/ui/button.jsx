import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[10px] border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(62,207,142,0.3)] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "border-[rgba(62,207,142,0.45)] bg-[rgba(62,207,142,0.18)] text-[#d3f5e4] hover:bg-[rgba(62,207,142,0.24)]",
        secondary: "border-[var(--border)] bg-[#1a2232] text-[var(--text)] hover:border-[#334055] hover:bg-[#20293b]",
        destructive: "border-[rgba(248,113,113,0.46)] bg-[rgba(248,113,113,0.16)] text-[#fecaca] hover:bg-[rgba(248,113,113,0.22)]",
        ghost: "border-transparent bg-transparent text-[var(--muted)] hover:bg-[#1b2434] hover:text-[var(--text)]",
      },
      size: {
        default: "min-h-10 px-4 py-2",
        sm: "min-h-9 px-3 py-2 text-[0.82rem]",
        lg: "min-h-11 px-5 py-3",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({ className, size, variant, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export default Button
