
import AlgorandIDE from '@/components/algorand-ide';

async function getTemplateFiles(slug: string) {
  const res = await fetch(`https://raw.githubusercontent.com/nickthelegend/algorand-ide-templates/refs/heads/main/playground/${slug}/files.ts`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error('Failed to fetch template files');
  }
  const text = await res.text();

  // This is a simplified parser. It might not work for all cases.
  // It finds the first `{` and the last `}` and assumes everything in between is the object.
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find a JSON-like object in the response');
  }
  const jsonString = text.substring(startIndex, endIndex + 1);

  try {
    // The file content is a JS object, not a strict JSON. We can use eval in a safe way.
    const files = (new Function(`return ${jsonString}`))();
    return files;
  } catch (e) {
    console.error("Failed to parse template files", e);
    throw new Error('Failed to parse template files');
  }
}

async function getTemplateLang(slug: string) {
  const res = await fetch('https://raw.githubusercontent.com/nickthelegend/algorand-ide-templates/refs/heads/main/TEMPLATES.json', { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error('Failed to fetch templates');
  }
  const templates = await res.json();
  return templates[slug]?.lang || 'Pyteal';
}

export default async function PlayPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const files = await getTemplateFiles(slug);
  const lang = await getTemplateLang(slug);

  return <AlgorandIDE initialFiles={files} selectedTemplate={lang} />;
}
