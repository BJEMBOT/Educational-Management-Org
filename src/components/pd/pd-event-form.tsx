'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPdEvent } from '@/app/actions/pd'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PdEventFormat } from '@/lib/database.types'

export function PdEventForm({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<PdEventFormat>('in_person')

  const showVirtualFields = format === 'virtual' || format === 'hybrid'
  const showLocation = format === 'in_person' || format === 'hybrid'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createPdEvent({
      title: form.get('title') as string,
      description: (form.get('description') as string) || undefined,
      credit_hours: Number(form.get('credit_hours')),
      start_date: new Date(form.get('start_date') as string).toISOString(),
      end_date: form.get('end_date')
        ? new Date(form.get('end_date') as string).toISOString()
        : undefined,
      format,
      location: (form.get('location') as string) || undefined,
      facilitator: (form.get('facilitator') as string) || undefined,
      meeting_url: (form.get('meeting_url') as string) || undefined,
      meeting_id: (form.get('meeting_id') as string) || undefined,
      meeting_passcode: (form.get('meeting_passcode') as string) || undefined,
      materials_url: (form.get('materials_url') as string) || undefined,
      join_instructions: (form.get('join_instructions') as string) || undefined,
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('PD event created')
    setOpen(false)
    setFormat('in_person')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size="sm">{trigger}</DialogTriggerButton>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add PD Event</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session Info</p>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} placeholder="What will participants learn?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facilitator">Facilitator</Label>
              <Input id="facilitator" name="facilitator" placeholder="e.g. Dr. Sarah Chen" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="credit_hours">Credit Hours</Label>
                <Input id="credit_hours" name="credit_hours" type="number" step="0.5" defaultValue={1} required />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(v) => v && setFormat(v as PdEventFormat)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start</Label>
                <Input id="start_date" name="start_date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End</Label>
                <Input id="end_date" name="end_date" type="datetime-local" />
              </div>
            </div>
          </div>

          {showLocation && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Room, building, or address" />
            </div>
          )}

          {showVirtualFields && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Virtual Meeting</p>
              <div className="space-y-2">
                <Label htmlFor="meeting_url">Meeting Link</Label>
                <Input
                  id="meeting_url"
                  name="meeting_url"
                  type="url"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="meeting_id">Meeting ID</Label>
                  <Input id="meeting_id" name="meeting_id" placeholder="123 456 7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting_passcode">Passcode</Label>
                  <Input id="meeting_passcode" name="meeting_passcode" placeholder="Optional" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="join_instructions">Join Instructions</Label>
                <Textarea
                  id="join_instructions"
                  name="join_instructions"
                  rows={2}
                  placeholder="Dial-in number, one-tap mobile link, etc."
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="materials_url">Materials Link</Label>
            <Input
              id="materials_url"
              name="materials_url"
              type="url"
              placeholder="Slides, handouts, or shared folder URL"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
