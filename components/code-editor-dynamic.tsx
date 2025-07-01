
"use client"

import dynamic from 'next/dynamic'

export const CodeEditorDynamic = dynamic(
  () => import('@/components/code-editor').then((mod) => mod.CodeEditor),
  { ssr: false }
)
