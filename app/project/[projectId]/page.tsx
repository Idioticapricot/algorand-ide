"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AlgorandIDE from '@/components/algorand-ide'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const { data: project, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_files(
              file_structure
            )
          `)
          .eq('project_id', projectId)
          .single()

        if (error) {
          setError('Project not found')
          return
        }

        // Check if user has access (owner or public project)
        if (project.shareable === 'private' && (!session?.user || session.user.id !== project.user_id)) {
          setError('Access denied')
          return
        }

        setProject(project)
      } catch (err) {
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-600">The requested project could not be found.</p>
        </div>
      </div>
    )
  }

  const fileStructure = project.project_files?.[0]?.file_structure || {};

  return (
    <AlgorandIDE
      initialFiles={fileStructure}
      selectedTemplate={project.template}
      selectedTemplateName={project.name}
      projectId={projectId}
    />
  )
}