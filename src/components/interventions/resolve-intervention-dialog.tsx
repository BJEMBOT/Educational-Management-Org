'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { resolveIntervention } from '@/app/actions/interventions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { InterventionWithSchool } from '@/lib/database.types'

export function ResolveInterventionDialog({
  intervention,
  open,
  onOpenChange,
}: {
  intervention: InterventionWithSchool | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')

  function resetForm() {
    setFileName('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!intervention) return

    const form = e.currentTarget
    const notes = (new FormData(form).get('resolution_notes') as string)?.trim()
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]')
    const file = fileInput?.files?.[0]

    if (!notes && !file) {
      toast.error('Add written evidence or upload a picture before resolving.')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.set('resolution_notes', notes ?? '')
    if (file) formData.set('evidence_file', file)

    const result = await resolveIntervention(
      intervention.id,
      intervention.school_id,
      formData
    )
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Intervention resolved')
    resetForm()
    onOpenChange(false)
    router.refresh()
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    onOpenChange(next)
  }

  if (!intervention) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve Intervention</DialogTitle>
          <DialogDescription>
            Document how this issue was addressed. Provide written notes, a picture,
            or both before marking as resolved.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <p className="font-medium">{intervention.school_name}</p>
          <p className="mt-1 text-muted-foreground">{intervention.issue}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resolution_notes">Written evidence</Label>
            <Textarea
              id="resolution_notes"
              name="resolution_notes"
              rows={4}
              placeholder="Describe the outcome, actions completed, and supporting details..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence_file">Picture evidence</Label>
            <div className="flex items-center gap-2">
              <Input
                id="evidence_file"
                name="evidence_file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="text-sm"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              />
            </div>
            {fileName ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ImagePlus className="h-3.5 w-3.5" />
                {fileName}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Screenshots, photos, or charts (max 5 MB)
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Mark Resolved'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
