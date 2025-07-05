import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => (
          <Card key={template.name} className="flex flex-col justify-between" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={template.link} passHref>
                <Button className="w-full" style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)" }}>
                  Start Building
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
