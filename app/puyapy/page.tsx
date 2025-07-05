"use client"

import AlgorandIDE from "@/components/algorand-ide"
import { puyaPyfiles } from "@/components/puyaPyfiles"

export default function PytealPage() {
  return <AlgorandIDE initialFiles={puyaPyfiles} selectedTemplate="PuyaPy" />
}