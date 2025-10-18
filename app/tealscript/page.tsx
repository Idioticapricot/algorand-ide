'use client'
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AlgorandIDE from "@/components/algorand-ide";
import { tealScriptFiles } from "@/components/tealScriptFiles";
import { fetchTemplate } from "@/lib/playground-api";

function TealScriptIDEContent() {
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get('template');
  const [initialFiles, setInitialFiles] = useState(tealScriptFiles);
  const [loading, setLoading] = useState(!!templateSlug);

  useEffect(() => {
    if (templateSlug) {
      fetchTemplate(templateSlug).then((template) => {
        if (template && template.code) {
          console.log('Loaded template code:', template.code);
          console.log('Files in template:', Object.keys(template.code));
          setInitialFiles(template.code);
        }
        setLoading(false);
      });
    }
  }, [templateSlug]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-white">Loading template...</div>
      </div>
    );
  }

  return <AlgorandIDE initialFiles={initialFiles} selectedTemplate="TealScript" selectedTemplateName="TealScript" isReadOnly={!!templateSlug}/>;
}

export default function TealScriptIDE() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <TealScriptIDEContent />
    </Suspense>
  );
}
