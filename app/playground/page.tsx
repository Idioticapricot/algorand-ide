"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, User, Globe } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PlaygroundPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicProjects = async () => {
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_files(
              file_structure,
              updated_at
            )
          `)
          .eq('shareable', 'public')
          .order('updated_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Failed to fetch public projects:', error)
        } else {
          setProjects(projects || [])
        }
      } catch (error) {
        console.error('Failed to fetch public projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPublicProjects()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Community Playground</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Explore public Algorand smart contract projects created by the community
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No public projects yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share your Algorand project with the community!</p>
              <Button asChild>
                <Link href="/">
                  Create Project
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.project_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {project.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{project.template}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(project.updated_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Public
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/project/${project.project_id}`}>
                        View Project
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}