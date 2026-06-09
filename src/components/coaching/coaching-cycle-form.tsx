'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createCoachingCycle } from '@/app/actions/coaching'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Profile, School } from '@/lib/database.types'

export function CoachingCycleForm({
  schools,
  teachers,
  coachId,
  trigger,
  triggerSize = 'sm',
}: {
  schools: School[]
  teachers: Profile[]
  coachId: string
  trigger: React.ReactNode
  triggerSize?: 'default' | 'sm' | 'lg'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schoolId, setSchoolId] = useState('')
  const [teacherId, setTeacherId] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createCoachingCycle({
      coach_id: coachId,
      teacher_id: teacherId,
      school_id: schoolId,
      focus_area: form.get('focus_area') as string,
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Coaching cycle created')
    setOpen(false)
    if (result.id) router.push(`/coaching/${result.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size={triggerSize}>{trigger}</DialogTriggerButton>
      <DialogContent>
        <DialogHeader><DialogTitle>New Coaching Cycle</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>School</Label>
            <Select value={schoolId} onValueChange={(v) => v && setSchoolId(v)}>
              <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
              <SelectContent>
                {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Teacher</Label>
            <Select value={teacherId} onValueChange={(v) => v && setTeacherId(v)}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name ?? t.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="focus_area">Focus Area</Label>
            <Input id="focus_area" name="focus_area" placeholder="e.g. Differentiated instruction" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !schoolId || !teacherId}>
            {loading ? 'Creating...' : 'Start Cycle'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
