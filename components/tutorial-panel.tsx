"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const tutorials = [
  {
    id: 1,
    title: "Hello Algorand",
    description: "Hello world program with PyTeal/Python.",
    level: "BEGINNER",
    framework: "PyTeal",
    language: "Python",
    color: "from-green-400 to-blue-500",
  },
  {
    id: 2,
    title: "Hello Smart Contract",
    description: "Hello world program with Algorand Smart Contracts.",
    level: "BEGINNER",
    framework: "Native",
    language: "Python",
    color: "from-blue-400 to-purple-500",
  },
  {
    id: 3,
    title: "Asset Creation",
    description: "Learn to create and manage Algorand Standard Assets.",
    level: "INTERMEDIATE",
    framework: "PyTeal",
    language: "Python",
    color: "from-pink-400 to-red-500",
  },
  {
    id: 4,
    title: "Todo App",
    description: "Build a todo app to keep track of tasks.",
    level: "BEGINNER",
    framework: "PyTeal",
    language: "Python",
    color: "from-yellow-400 to-orange-500",
  },
]

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
const frameworks = ["PyTeal", "Native", "Beaker"]
const languages = ["Python", "JavaScript", "Go"]

export function TutorialPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = !selectedLevel || tutorial.level === selectedLevel
    const matchesFramework = !selectedFramework || tutorial.framework === selectedFramework
    const matchesLanguage = !selectedLanguage || tutorial.language === selectedLanguage

    return matchesSearch && matchesLevel && matchesFramework && matchesLanguage
  })

  return (
    <div className="h-full bg-[#1e1e1e] flex">
      {/* Filters Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-[#3e3e42] p-4">
        <h2 className="text-lg font-semibold mb-4">Learn</h2>

        {/* Level Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2 text-[#cccccc]">LEVEL</h3>
          <div className="space-y-2">
            {levels.map((level) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    level === "BEGINNER" ? "bg-green-500" : level === "INTERMEDIATE" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                ></div>
                <button
                  onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                  className={`text-sm ${selectedLevel === level ? "text-white" : "text-[#cccccc]"} hover:text-white`}
                >
                  {level}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Framework Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2 text-[#cccccc]">FRAMEWORK</h3>
          <div className="space-y-2">
            {frameworks.map((framework) => (
              <div key={framework} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    framework === "PyTeal" ? "bg-blue-500" : framework === "Native" ? "bg-purple-500" : "bg-orange-500"
                  }`}
                ></div>
                <button
                  onClick={() => setSelectedFramework(selectedFramework === framework ? null : framework)}
                  className={`text-sm ${selectedFramework === framework ? "text-white" : "text-[#cccccc]"} hover:text-white`}
                >
                  {framework}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2 text-[#cccccc]">LANGUAGES</h3>
          <div className="space-y-2">
            {languages.map((language) => (
              <div key={language} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    language === "Python"
                      ? "bg-yellow-500"
                      : language === "JavaScript"
                        ? "bg-yellow-400"
                        : "bg-cyan-500"
                  }`}
                ></div>
                <button
                  onClick={() => setSelectedLanguage(selectedLanguage === language ? null : language)}
                  className={`text-sm ${selectedLanguage === language ? "text-white" : "text-[#cccccc]"} hover:text-white`}
                >
                  {language}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#969696]" />
          <Input
            placeholder="Search tutorials"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#3c3c3c] border-[#3e3e42] text-white"
          />
        </div>

        {/* Tutorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="bg-[#252526] rounded-lg overflow-hidden hover:bg-[#2a2d2e] transition-colors cursor-pointer"
            >
              <div className={`h-32 bg-gradient-to-br ${tutorial.color} flex items-center justify-center`}>
                <h3 className="text-2xl font-bold text-white text-center px-4">
                  {tutorial.title.split(" ").map((word) => (
                    <div key={word}>{word}</div>
                  ))}
                </h3>
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2">{tutorial.title}</h4>
                <p className="text-sm text-[#cccccc] mb-3">{tutorial.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      tutorial.level === "BEGINNER"
                        ? "bg-green-500/20 text-green-400"
                        : tutorial.level === "INTERMEDIATE"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {tutorial.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tutorial.framework}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
