import { Suspense } from "react";
import { ProjectCreator } from "@/components/project-creator";
import { files } from "@/components/files";

export default function PyTealIDE() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ProjectCreator 
        initialFiles={files} 
        selectedTemplate="PyTeal" 
        selectedTemplateName="PyTeal"
      />
    </Suspense>
  );
}