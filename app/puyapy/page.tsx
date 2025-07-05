import AlgorandIDE from "@/components/algorand-ide";
import { puyaPyfiles } from "@/components/puyaPyfiles";

export default function PuyaPyIDE() {
  return <AlgorandIDE initialFiles={puyaPyfiles} selectedTemplate="PuyaPy" />;
}
