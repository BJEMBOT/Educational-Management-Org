'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createCalendarEvent } from '@/app/actions/calendar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import type { CalendarEventType, School } from '@/lib/database.types'

const typeLabels: Record<CalendarEventType, string> = {
  pd: 'Professional Development',
  coaching: 'Coaching',
  intervention: 'Intervention',
  meeting: 'Meeting',
  deadline: 'Deadline',
  other: 'Other',
}

export function CalendarEventForm({ schools }: { schools: School[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eventType, setEventType] = useState<CalendarEventType>('meeting')
  const [schoolId, setSchoolId] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const startDate = form.get('start_date') as string
    const startTime = (form.get('start_time') as string) || '09:00'
    const endDate = form.get('end_date') as string
    const endTime = (form.get('end_time') as string) || '10:00'

    const result = await createCalendarEvent({
      title: form.get('title') as string,
      description: (form.get('description') as string) || undefined,
      event_type: eventType,
      start_at: `${startDate}T${startTime}:00`,
      end_at: endDate ? `${endDate}T${endTime}:00` : undefined,
      location: (form.get('location') as string) || undefined,
      school_id: schoolId || undefined,
    })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Event added to calendar')
    setOpen(false)
    setSchoolId('')
    router.refresh()
  }

  const selectedSchool = schools.find((s) => s.id === schoolId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Event
      </DialogTriggerButton>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={eventType} onValueChange={(v) => v && setEventType(v as CalendarEventType)}>
              <SelectTrigger className="w-full">
                <span>{typeLabels[eventType]}</span>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(typeLabels) as CalendarEventType[]).map((t) => (
                  <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" name="start_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start time</Label>
              <Input id="start_time" name="start_time" type="time" defaultValue="09:00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" name="end_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End time</Label>
              <Input id="end_time" name="end_time" type="time" defaultValue="10:00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" />
          </div>
          <div className="space-y-2">
            <Label>School (optional)</Label>
            <Select value={schoolId} onValueChange={(v) => setSchoolId(v ?? '')}>
              <SelectTrigger className="w-full">
                <span className={!selectedSchool ? 'text-muted-foreground' : undefined}>
                  {selectedSchool?.name ?? 'Network-wide'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Add Event'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
