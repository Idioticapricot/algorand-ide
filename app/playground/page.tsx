import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Playground Templates
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Explore community-created smart contract templates.
        </p>
      </div>

      <ScrollArea className="h-[60vh] w-full mt-10">
        <div className="flex flex-wrap justify-center gap-8 p-4">
          {Object.entries(templates).map(([slug, template]) => (
            <Card key={slug} className="flex flex-col justify-between hover:scale-105 transition-transform duration-300 ease-in-out w-full sm:w-auto sm:max-w-xs" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-primary">{template.lang}</span>
                  <span className="text-sm text-muted-foreground">{template.level}</span>
                </div>
                <Link href={`/play/${slug}`} passHref>
                  <Button className="w-full" style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)"}}>
                    Launch
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
