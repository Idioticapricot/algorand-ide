
"use client"

import dynamic from 'next/dynamic'

export const WebContainerTerminalDynamic = dynamic(
  () =>
    import('@/components/webcontainer-terminal').then(
      (mod) => mod.WebContainerTerminal
    ),
  { ssr: false }
)
