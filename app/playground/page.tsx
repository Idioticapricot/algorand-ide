import Link from 'next/link';

async function getTemplates() {
  const res = await fetch('https://raw.githubusercontent.com/nickthelegend/algorand-ide-templates/refs/heads/main/TEMPLATES.json', { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error('Failed to fetch templates');
  }
  return res.json();
}

interface Template {
  name: string;
  desc: string;
  level: string;
  lang: string;
}

export default async function PlaygroundPage() {
  const templates: Record<string, Template> = await getTemplates();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Playground Templates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(templates).map(([slug, template]) => (
          <Link href={`/play/${slug}`} key={slug} className="block hover:scale-105 transition-transform">
            <div className="bg-card p-6 rounded-lg shadow-md h-full flex flex-col">
              <h2 className="text-2xl font-semibold mb-2">{template.name}</h2>
              <p className="text-muted-foreground mb-4 flex-grow">{template.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary">{template.lang}</span>
                <span className="text-sm text-muted-foreground">{template.level}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
