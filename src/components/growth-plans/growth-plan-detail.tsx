'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  addEvidence,
  addGrowthPlanGoal,
  addReflection,
  updateGrowthPlan,
  updateGrowthPlanGoal,
} from '@/app/actions/growth-plans'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type {
  GrowthPlanEvidence,
  GrowthPlanGoal,
  GrowthPlanReflection,
  GoalItemStatus,
  GrowthPlanStatus,
} from '@/lib/database.types'

interface Props {
  plan: {
    id: string
    school_year: string
    status: GrowthPlanStatus
    school_name: string
    user_name: string
  }
  goals: GrowthPlanGoal[]
  reflections: GrowthPlanReflection[]
  evidence: GrowthPlanEvidence[]
}

export function GrowthPlanDetail({ plan, goals, reflections, evidence }: Props) {
  const router = useRouter()
  const [goalText, setGoalText] = useState('')
  const [reflection, setReflection] = useState('')

  async function handleAddGoal() {
    if (!goalText.trim()) return
    const result = await addGrowthPlanGoal({ plan_id: plan.id, goal_text: goalText })
    if (result.error) { toast.error(result.error); return }
    setGoalText('')
    toast.success('Goal added')
    router.refresh()
  }

  async function handleAddReflection() {
    if (!reflection.trim()) return
    const result = await addReflection(plan.id, reflection)
    if (result.error) { toast.error(result.error); return }
    setReflection('')
    toast.success('Reflection added')
    router.refresh()
  }

  async function handleStatusChange(status: GrowthPlanStatus) {
    const result = await updateGrowthPlan(plan.id, { status })
    if (result.error) { toast.error(result.error); return }
    toast.success('Status updated')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Growth Plan — ${plan.school_year}`}
        subtitle={`${plan.user_name} · ${plan.school_name}`}
        actions={
          <Select value={plan.status} onValueChange={(v) => v && handleStatusChange(v as GrowthPlanStatus)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold">Goals</h3>
          <ul className="mt-3 space-y-2">
            {goals.map((g) => (
              <li key={g.id} className="rounded-md border px-3 py-2">
                <p className="text-sm font-medium">{g.goal_text}</p>
                {g.action_steps && <p className="mt-1 text-xs text-muted-foreground">{g.action_steps}</p>}
                <Select
                  defaultValue={g.status}
                  onValueChange={async (v) => {
                    if (!v) return
                    await updateGrowthPlanGoal(g.id, plan.id, { status: v as GoalItemStatus })
                    router.refresh()
                  }}
                >
                  <SelectTrigger className="mt-2 h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input placeholder="New goal..." value={goalText} onChange={(e) => setGoalText(e.target.value)} className="text-sm" />
            <Button size="sm" onClick={handleAddGoal}>Add</Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold">Reflection Journal</h3>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {reflections.map((r) => (
              <li key={r.id} className="rounded-md bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">{format(new Date(r.reflection_date), 'MMM d, yyyy')}</p>
                <p className="mt-1 text-sm">{r.content}</p>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-2">
            <Textarea placeholder="Write a reflection..." value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} />
            <Button size="sm" onClick={handleAddReflection}>Add Reflection</Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="font-heading font-semibold">Evidence</h3>
          {evidence.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No evidence collected yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {evidence.map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    {e.url && <a href={e.url} className="text-xs text-primary hover:underline" target="_blank" rel="noreferrer">{e.url}</a>}
                  </div>
                  <Badge variant="outline" className="text-xs">Evidence</Badge>
                </li>
              ))}
            </ul>
          )}
          <EvidenceForm planId={plan.id} onAdded={() => router.refresh()} />
        </div>
      </div>
    </div>
  )
}

function EvidenceForm({ planId, onAdded }: { planId: string; onAdded: () => void }) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const result = await addEvidence({
      plan_id: planId,
      title: form.get('title') as string,
      url: (form.get('url') as string) || undefined,
    })
    if (result.error) { toast.error(result.error); return }
    toast.success('Evidence added')
    e.currentTarget.reset()
    onAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
      <Input name="title" placeholder="Evidence title" className="max-w-xs text-sm" required />
      <Input name="url" placeholder="URL (optional)" className="max-w-xs text-sm" />
      <Button size="sm" type="submit">Add Evidence</Button>
    </form>
  )
}
