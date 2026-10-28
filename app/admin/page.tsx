"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

// The admin panel now lives inside the dashboard as the "Admin" tab.
// Kept as a route so existing links and docs keep working.
export default function AdminPage() {
  const router = useRouter()

  React.useEffect(() => {
    router.replace("/dashboard?tab=admin")
  }, [router])

  return null
}
