'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createGoal, updateGoal } from '@/app/actions/goals'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoryLabels } from '@/lib/school-health'
import type { Goal, GoalCategory, GoalStatus, School } from '@/lib/database.types'

interface GoalFormDialogProps {
  goal?: Goal
  schools: School[]
  defaultSchoolId?: string
  trigger?: React.ReactNode
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  triggerSize?: 'default' | 'sm' | 'lg'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function GoalFormDialog({
  goal,
  schools,
  defaultSchoolId,
  trigger,
  triggerVariant = 'default',
  triggerSize = 'default',
  open: controlledOpen,
  onOpenChange,
}: GoalFormDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<GoalCategory>(goal?.category ?? 'academic')
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? 'on_track')
  const [schoolId, setSchoolId] = useState(goal?.school_id ?? defaultSchoolId ?? '')

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = {
      school_id: schoolId,
      category,
      metric_name: form.get('metric_name') as string,
      target_value: Number(form.get('target_value')),
      current_value: Number(form.get('current_value')),
      status,
      time_period: form.get('time_period') as string,
    }

    const result = goal
      ? await updateGoal(goal.id, goal.school_id, data)
      : await createGoal(data)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(goal ? 'Goal updated' : 'Goal created')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTriggerButton variant={triggerVariant} size={triggerSize}>
          {trigger}
        </DialogTriggerButton>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!goal && (
            <div className="space-y-2">
              <Label>School</Label>
              <Select value={schoolId} onValueChange={(v) => v && setSchoolId(v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v as GoalCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(categoryLabels) as GoalCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metric_name">Metric Name</Label>
            <Input
              id="metric_name"
              name="metric_name"
              defaultValue={goal?.metric_name}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                name="target_value"
                type="number"
                step="any"
                defaultValue={goal?.target_value}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_value">Current Value</Label>
              <Input
                id="current_value"
                name="current_value"
                type="number"
                step="any"
                defaultValue={goal?.current_value ?? 0}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as GoalStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="off_track">Off Track</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time_period">Time Period</Label>
            <Input
              id="time_period"
              name="time_period"
              defaultValue={goal?.time_period ?? '2025-26'}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !schoolId}>
            {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
