'use client'
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AlgorandIDE from "@/components/algorand-ide";
import { files } from "@/components/files";
import { fetchTemplate } from "@/lib/playground-api";

function PyTealIDEContent() {
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get('template');
  const [initialFiles, setInitialFiles] = useState(files);
  const [loading, setLoading] = useState(!!templateSlug);

  useEffect(() => {
    if (templateSlug) {
      fetchTemplate(templateSlug).then((template) => {
        if (template && template.code) {
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

  return <AlgorandIDE initialFiles={initialFiles} selectedTemplate="Pyteal" selectedTemplateName="PyTeal" isReadOnly={!!templateSlug}/>;
}

export default function PyTealIDE() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PyTealIDEContent />
    </Suspense>
  );
}
