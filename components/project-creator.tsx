"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AlgorandIDE from '@/components/algorand-ide'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ProjectCreatorProps {
  initialFiles: any
  selectedTemplate: string
  selectedTemplateName: string
}

export function ProjectCreator({ initialFiles, selectedTemplate, selectedTemplateName }: ProjectCreatorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectParam = searchParams.get('project')
  
  const [showDialog, setShowDialog] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [shareable, setShareable] = useState('private')

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)
      
      // If user is logged in and no project param, show create dialog
      if (session?.user && !projectParam) {
        setShowDialog(true)
      }
    }
    getUser()
  }, [projectParam])

  const createProject = async () => {
    if (!user || !projectName.trim()) return
    
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/projects/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim(),
          template: selectedTemplate,
          file_structure: initialFiles,
          shareable
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/project/${data.project.project_id}`)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setLoading(false)
    }
  }

  const skipProjectCreation = () => {
    setShowDialog(false)
  }

  // If user is not logged in or skipped project creation, show IDE directly
  if (!user || (!showDialog && !projectParam)) {
    return (
      <AlgorandIDE
        initialFiles={initialFiles}
        selectedTemplate={selectedTemplate}
        selectedTemplateName={selectedTemplateName}
      />
    )
  }

  return (
    <>
      <AlgorandIDE
        initialFiles={initialFiles}
        selectedTemplate={selectedTemplate}
        selectedTemplateName={selectedTemplateName}
      />
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Algorand Project"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your project..."
              />
            </div>
            <div>
              <Label htmlFor="shareable">Visibility</Label>
              <Select value={shareable} onValueChange={setShareable}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={skipProjectCreation} variant="outline" className="flex-1">
                Skip
              </Button>
              <Button 
                onClick={createProject} 
                disabled={!projectName.trim() || loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}