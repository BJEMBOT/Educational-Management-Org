'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createGrowthPlan } from '@/app/actions/growth-plans'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { School } from '@/lib/database.types'

export function GrowthPlanFormDialog({
  schools,
  userId,
  trigger,
  triggerSize = 'sm',
}: {
  schools: School[]
  userId: string
  trigger: React.ReactNode
  triggerSize?: 'default' | 'sm' | 'lg'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schoolId, setSchoolId] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createGrowthPlan({
      user_id: userId,
      school_id: schoolId,
      school_year: form.get('school_year') as string,
      status: 'active',
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Growth plan created')
    setOpen(false)
    if (result.id) router.push(`/growth-plans/${result.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size={triggerSize}>{trigger}</DialogTriggerButton>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Growth Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>School</Label>
            <Select value={schoolId} onValueChange={(v) => v && setSchoolId(v)}>
              <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="school_year">School Year</Label>
            <Input id="school_year" name="school_year" defaultValue="2025-26" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !schoolId}>
            {loading ? 'Creating...' : 'Create Plan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
