"use client"

import AlgorandIDE from "@/components/algorand-ide"
import { puyaTsfiles } from "@/components/puyaTsfiles"

export default function PuyaTsPage() {
  return <AlgorandIDE initialFiles={puyaTsfiles} selectedTemplate="PuyaTs" selectedTemplateName="PuyaTs" />
}