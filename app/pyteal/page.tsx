import { ProjectCreator } from "@/components/project-creator";
import { files } from "@/components/files";

export default function PyTealIDE() {
  return (
    <ProjectCreator 
      initialFiles={files} 
      selectedTemplate="PyTeal" 
      selectedTemplateName="PyTeal"
    />
  );
}