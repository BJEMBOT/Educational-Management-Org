'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createRevenueEntry } from '@/app/actions/revenue'
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
import type { RevenueSource, School } from '@/lib/database.types'

const sourceLabels: Record<RevenueSource, string> = {
  contract: 'Contract',
  pd: 'Professional Development',
  consulting: 'Consulting',
  grant: 'Grant',
  other: 'Other',
}

export function RevenueFormDialog({
  schools,
  trigger,
}: {
  schools: School[]
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<RevenueSource>('contract')
  const [schoolId, setSchoolId] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createRevenueEntry({
      description: form.get('description') as string,
      amount: Number(form.get('amount')),
      source,
      school_id: schoolId || undefined,
      revenue_date: form.get('revenue_date') as string,
      notes: (form.get('notes') as string) || undefined,
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Revenue entry added')
    setOpen(false)
    setSchoolId('')
    router.refresh()
  }

  const selectedSchool = schools.find((s) => s.id === schoolId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size="sm">{trigger}</DialogTriggerButton>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Revenue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required placeholder="e.g. Annual management contract" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue_date">Date</Label>
              <Input id="revenue_date" name="revenue_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={source} onValueChange={(v) => v && setSource(v as RevenueSource)}>
              <SelectTrigger className="w-full">
                <span>{sourceLabels[source]}</span>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(sourceLabels) as RevenueSource[]).map((s) => (
                  <SelectItem key={s} value={s}>{sourceLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>School (optional)</Label>
            <Select value={schoolId} onValueChange={(v) => setSchoolId(v ?? '')}>
              <SelectTrigger className="w-full">
                <span className={!selectedSchool ? 'text-muted-foreground' : undefined}>
                  {selectedSchool?.name ?? 'Network-wide / unassigned'}
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Add Entry'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
