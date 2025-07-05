import AlgorandIDE from "@/components/algorand-ide";
import { tealScriptFiles } from "@/components/tealScriptFiles";

export default function TealScriptIDE() {
  return <AlgorandIDE initialFiles={tealScriptFiles} selectedTemplate="TealScript" templateName="TealScript"/>;
}
