import AlgorandIDE from "@/components/algorand-ide";
import { puyaTsfiles } from "@/components/puyaTsfiles";

export default function PuyaTsIDE() {
  return <AlgorandIDE initialFiles={puyaTsfiles} selectedTemplate="PuyaTs" />;
}
