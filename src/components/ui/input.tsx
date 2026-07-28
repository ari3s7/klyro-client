import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-sm border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono-body text-sm text-white transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-300 placeholder:text-zinc-600 focus-visible:border-cyan-500/40 focus-visible:shadow-[0_0_15px_rgba(0,229,255,0.08)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500/40 aria-invalid:shadow-[0_0_10px_rgba(239,68,68,0.1)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
