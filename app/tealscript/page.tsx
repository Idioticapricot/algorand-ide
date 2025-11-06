import { Suspense } from "react";
import { ProjectCreator } from "@/components/project-creator";
import { tealScriptFiles } from "@/components/tealScriptFiles";

export default function TealScriptIDE() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ProjectCreator 
        initialFiles={tealScriptFiles} 
        selectedTemplate="TealScript" 
        selectedTemplateName="TealScript"
      />
    </Suspense>
  );
}
