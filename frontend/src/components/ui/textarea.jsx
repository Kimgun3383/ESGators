import { cn } from "../../lib/utils"

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-[10px] border border-[#2b3549] bg-[#0e131d] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[rgba(62,207,142,0.45)]",
        className
      )}
      {...props}
    />
  )
}

export default Textarea
