'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createEvaluationCycle } from '@/app/actions/evaluations'
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
import { cycleTypeLabels } from '@/lib/evaluation-rubric'
import {
  frameworkSelectOptions,
  labelsToSelectOptions,
  profileSelectOptions,
  schoolSelectOptions,
} from '@/lib/select-options'
import type {
  EvaluationCycleType,
  EvaluationFramework,
  Profile,
  School,
} from '@/lib/database.types'

export function EvaluationCycleForm({
  schools,
  teachers,
  evaluators,
  frameworks,
  defaultEvaluatorId,
  trigger,
}: {
  schools: School[]
  teachers: Profile[]
  evaluators: Profile[]
  frameworks: EvaluationFramework[]
  defaultEvaluatorId: string
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schoolId, setSchoolId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [evaluatorId, setEvaluatorId] = useState(defaultEvaluatorId)
  const [frameworkId, setFrameworkId] = useState(frameworks[0]?.id ?? '')
  const [cycleType, setCycleType] = useState<EvaluationCycleType>('annual')

  const currentYear = new Date().getFullYear()
  const defaultSchoolYear = `${currentYear}-${currentYear + 1}`

  const schoolOptions = useMemo(() => schoolSelectOptions(schools), [schools])
  const teacherOptions = useMemo(
    () => profileSelectOptions(teachers, 'Unnamed'),
    [teachers]
  )
  const evaluatorOptions = useMemo(
    () => profileSelectOptions(evaluators, 'Unnamed'),
    [evaluators]
  )
  const frameworkOptions = useMemo(
    () => frameworkSelectOptions(frameworks),
    [frameworks]
  )
  const cycleTypeOptions = useMemo(
    () => labelsToSelectOptions(cycleTypeLabels),
    []
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createEvaluationCycle({
      teacher_id: teacherId,
      school_id: schoolId,
      evaluator_id: evaluatorId,
      framework_id: frameworkId,
      cycle_type: cycleType,
      school_year: form.get('school_year') as string,
      start_date: form.get('start_date') as string,
      end_date: (form.get('end_date') as string) || undefined,
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Evaluation cycle created')
    setOpen(false)
    router.refresh()
    if (result.id) router.push(`/evaluations/${result.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton>{trigger}</DialogTriggerButton>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Evaluation Cycle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <Label>Teacher</Label>
            <Select
              value={teacherId}
              onValueChange={(v) => v && setTeacherId(v)}
              items={teacherOptions}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teacherOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Evaluator</Label>
            <Select
              value={evaluatorId}
              onValueChange={(v) => v && setEvaluatorId(v)}
              items={evaluatorOptions}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select evaluator" />
              </SelectTrigger>
              <SelectContent>
                {evaluatorOptions.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select
              value={frameworkId}
              onValueChange={(v) => v && setFrameworkId(v)}
              items={frameworkOptions}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworkOptions.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cycle type</Label>
            <Select
              value={cycleType}
              onValueChange={(v) => v && setCycleType(v as EvaluationCycleType)}
              items={cycleTypeOptions}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cycleTypeOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="school_year">School year</Label>
            <Input
              id="school_year"
              name="school_year"
              defaultValue={defaultSchoolYear}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" name="end_date" type="date" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create evaluation cycle'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
