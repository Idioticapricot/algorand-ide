"use client"

import { ProjectCreator } from "@/components/project-creator"
import { puyaPyfiles } from "@/components/puyaPyfiles"

export default function PytealPage() {
  return (
    <ProjectCreator 
      initialFiles={puyaPyfiles} 
      selectedTemplate="PuyaPy" 
      selectedTemplateName="PuyaPy"
    />
  )
}