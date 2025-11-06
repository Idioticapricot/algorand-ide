import { ProjectCreator } from "@/components/project-creator";
import { tealScriptFiles } from "@/components/tealScriptFiles";

export default function TealScriptIDE() {
  return (
    <ProjectCreator 
      initialFiles={tealScriptFiles} 
      selectedTemplate="TealScript" 
      selectedTemplateName="TealScript"
    />
  );
}
