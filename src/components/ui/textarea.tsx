import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono-body text-sm text-white transition-all outline-none placeholder:text-zinc-600 focus-visible:border-cyan-500/40 focus-visible:shadow-[0_0_15px_rgba(0,229,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
