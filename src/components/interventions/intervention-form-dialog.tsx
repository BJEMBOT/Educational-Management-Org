'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createIntervention, updateIntervention } from '@/app/actions/interventions'
import { getInterventionAssignee } from '@/app/actions/intervention-assignment'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { schoolSelectOptions } from '@/lib/select-options'
import type {
  Intervention,
  InterventionStatus,
  School,
} from '@/lib/database.types'

interface InterventionFormDialogProps {
  intervention?: Intervention
  schools: School[]
  defaultSchoolId?: string
  trigger?: React.ReactNode
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  triggerSize?: 'default' | 'sm' | 'lg'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function InterventionFormDialog({
  intervention,
  schools,
  defaultSchoolId,
  trigger,
  triggerVariant = 'default',
  triggerSize = 'default',
  open: controlledOpen,
  onOpenChange,
}: InterventionFormDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schoolId, setSchoolId] = useState(
    intervention?.school_id ?? defaultSchoolId ?? ''
  )
  const [status, setStatus] = useState<InterventionStatus>(
    intervention?.status ?? 'open'
  )
  const [assignee, setAssignee] = useState<{
    id: string
    name: string
    role: string
  } | null>(null)
  const [loadingAssignee, setLoadingAssignee] = useState(false)
  const schoolOptions = useMemo(() => schoolSelectOptions(schools), [schools])

  const open = controlledOpen ?? internalOpen

  useEffect(() => {
    if (intervention || !schoolId) {
      setAssignee(null)
      return
    }
    setLoadingAssignee(true)
    getInterventionAssignee(schoolId).then(({ assignee: a }) => {
      setAssignee(a)
      setLoadingAssignee(false)
    })
  }, [schoolId, intervention])
  const setOpen = onOpenChange ?? setInternalOpen

  const defaultDate = intervention?.date
    ? format(new Date(intervention.date), "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = intervention
      ? {
          school_id: schoolId,
          date: new Date(form.get('date') as string).toISOString(),
          issue: form.get('issue') as string,
          action_taken: form.get('action_taken') as string,
          owner: intervention.owner,
          status,
        }
      : {
          school_id: schoolId,
          date: new Date(form.get('date') as string).toISOString(),
          issue: form.get('issue') as string,
          action_taken: form.get('action_taken') as string,
          owner_id: assignee?.id,
          owner: assignee?.name,
          status,
        }

    const result = intervention
      ? await updateIntervention(intervention.id, intervention.school_id, data)
      : await createIntervention(data)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(
      intervention
        ? 'Intervention updated'
        : `Intervention created and assigned to ${'owner' in result && result.owner ? result.owner : assignee?.name ?? 'administrator'}`
    )
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {intervention ? 'Edit Intervention' : 'New Intervention'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!intervention && (
            <div className="space-y-2">
              <Label>School</Label>
              <Select
                value={schoolId}
                onValueChange={(v) => v && setSchoolId(v)}
                items={schoolOptions}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schoolOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              defaultValue={defaultDate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue">Issue</Label>
            <Textarea
              id="issue"
              name="issue"
              defaultValue={intervention?.issue}
              required
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="action_taken">Action Taken</Label>
            <Textarea
              id="action_taken"
              name="action_taken"
              defaultValue={intervention?.action_taken}
              required
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Assigned Administrator</Label>
            {intervention ? (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {intervention.owner}
              </p>
            ) : schoolId ? (
              <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
                <UserCheck className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  {loadingAssignee ? (
                    <span className="text-muted-foreground">Finding administrator...</span>
                  ) : assignee ? (
                    <>
                      <span className="font-medium">{assignee.name}</span>
                      <span className="ml-1.5 text-xs capitalize text-muted-foreground">
                        ({assignee.role.replace('_', ' ')})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      No administrator assigned to this school
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a school to auto-assign an administrator
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            {intervention?.status === 'resolved' ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                Resolved — use the table to reopen if needed
              </p>
            ) : (
              <>
                <Select
                  value={status}
                  onValueChange={(v) => v && setStatus(v as InterventionStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Resolving requires written or picture evidence from the interventions table.
                </p>
              </>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !schoolId || (!intervention && !assignee)}
          >
            {loading
              ? 'Saving...'
              : intervention
                ? 'Update Intervention'
                : 'Create Intervention'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
