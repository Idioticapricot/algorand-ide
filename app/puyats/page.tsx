"use client"

import { Suspense } from "react"
import { ProjectCreator } from "@/components/project-creator"
import { puyaTsfiles } from "@/components/puyaTsfiles"

export default function PuyaTsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ProjectCreator 
        initialFiles={puyaTsfiles} 
        selectedTemplate="PuyaTs" 
        selectedTemplateName="PuyaTs"
      />
    </Suspense>
  )
}