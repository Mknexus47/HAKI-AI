"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-11")}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
