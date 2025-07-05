import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from 'lucide-react';

export default function HomePage() {
  const templates = [
    { name: "PyTeal", description: "Python for Algorand Smart Contracts", link: "/pyteal" },
    { name: "TealScript", description: "TypeScript for Algorand Smart Contracts", link: "/tealscript" },
    { name: "PuyaPy", description: "Pythonic Smart Contracts for Algorand", link: "/puyapy" },
    { name: "PuyaTs", description: "TypeScript Smart Contracts for Algorand", link: "/puyats" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Algorand IDE
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Choose a template to start building your Algorand Smart Contract.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-8">
        {templates.map((template) => (
          <Card key={template.name} className="flex flex-col justify-between" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={template.link} passHref>
                <Button className="w-full" style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)"}}>
                  Start Building
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        <Card className="flex flex-col justify-between col-span-full sm:col-span-2 lg:col-span-1 self-end hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg shadow-blue-500/50" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Playground
            </CardTitle>
            <CardDescription>Play with the smart contract examples, created by our community devs</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/playground" passHref>
              <Button className="w-full" style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)"}}>
                Explore Playground
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
