import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="h-screen w-screen overflow-hidden bg-black">
        {children}
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
