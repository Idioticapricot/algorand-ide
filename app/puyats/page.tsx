"use client"

import { ProjectCreator } from "@/components/project-creator"
import { puyaTsfiles } from "@/components/puyaTsfiles"

export default function PuyaTsPage() {
  return (
    <ProjectCreator 
      initialFiles={puyaTsfiles} 
      selectedTemplate="PuyaTs" 
      selectedTemplateName="PuyaTs"
    />
  )
}