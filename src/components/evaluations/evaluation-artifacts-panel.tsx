'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { uploadEvaluationArtifact } from '@/app/actions/evaluations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { artifactTypeLabels } from '@/lib/evaluation-rubric'
import type { ArtifactType, EvaluationArtifactWithUploader } from '@/lib/database.types'

export function EvaluationArtifactsPanel({
  evaluationCycleId,
  artifacts,
  uploadedBy,
  canUpload,
}: {
  evaluationCycleId: string
  artifacts: EvaluationArtifactWithUploader[]
  uploadedBy: string
  canUpload: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [artifactType, setArtifactType] = useState<ArtifactType>('lesson_plan')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required.')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.set('evaluation_cycle_id', evaluationCycleId)
    formData.set('title', title)
    formData.set('artifact_type', artifactType)
    formData.set('uploaded_by', uploadedBy)
    if (notes) formData.set('notes', notes)
    if (file) formData.set('file', file)

    const result = await uploadEvaluationArtifact(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Artifact uploaded')
    setTitle('')
    setNotes('')
    setFile(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {canUpload && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
          <h4 className="text-sm font-medium">Upload artifact</h4>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={artifactType}
              onValueChange={(v) => setArtifactType(v as ArtifactType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(artifactTypeLabels) as ArtifactType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {artifactTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>File (optional)</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" disabled={loading}>
            <Upload className="mr-2 h-4 w-4" />
            {loading ? 'Uploading…' : 'Upload'}
          </Button>
        </form>
      )}

      {artifacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No artifacts uploaded yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {artifacts.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {artifactTypeLabels[a.artifact_type]} · {a.uploader_name} ·{' '}
                  {format(new Date(a.created_at), 'MMM d, yyyy')}
                </p>
                {a.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">{a.notes}</p>
                )}
              </div>
              {a.file_url && (
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm text-primary hover:underline"
                >
                  View
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
