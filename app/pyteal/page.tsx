import AlgorandIDE from "@/components/algorand-ide";
import { files } from "@/components/files";


export default function PyTealIDE() {
  return <AlgorandIDE initialFiles={files} selectedTemplate="PyTeal" selectedTemplateName="PyTeal"/>;
}