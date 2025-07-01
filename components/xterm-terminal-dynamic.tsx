
"use client"

import dynamic from 'next/dynamic'

export const XTermTerminalDynamic = dynamic(
  () => import('@/components/xterm-terminal').then((mod) => mod.XTermTerminal),
  { ssr: false }
)
