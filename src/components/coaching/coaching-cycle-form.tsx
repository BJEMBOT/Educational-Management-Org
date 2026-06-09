'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { createCoachingCycle } from '@/app/actions/coaching'
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
import {
  evaluationLabels,
  frequencyFromEvaluation,
  frequencyFromSupportLevel,
  frequencyLabels,
  supportLevelLabels,
} from '@/lib/coaching-schedule'
import {
  labelsToSelectOptions,
  profileSelectOptions,
  schoolSelectOptions,
  teacherSelectOptions,
} from '@/lib/select-options'
import type {
  CheckInFrequency,
  CoachingSupportLevel,
  FrequencySource,
  Profile,
  School,
  TeachingEvaluation,
} from '@/lib/database.types'

export function CoachingCycleForm({
  schools,
  teachers,
  coaches,
  defaultCoachId,
  showCoachPicker,
  trigger,
  triggerSize = 'sm',
  evaluationCycleId,
  defaultTeacherId,
  defaultSchoolId,
  defaultFocusArea,
  defaultFrequency,
}: {
  schools: School[]
  teachers: Profile[]
  coaches: Profile[]
  defaultCoachId: string
  showCoachPicker: boolean
  trigger: React.ReactNode
  triggerSize?: 'default' | 'sm' | 'lg'
  evaluationCycleId?: string
  defaultTeacherId?: string
  defaultSchoolId?: string
  defaultFocusArea?: string
  defaultFrequency?: CheckInFrequency
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schoolId, setSchoolId] = useState(defaultSchoolId ?? '')
  const [teacherId, setTeacherId] = useState(defaultTeacherId ?? '')
  const [coachId, setCoachId] = useState(defaultCoachId)
  const [supportLevel, setSupportLevel] = useState<CoachingSupportLevel>('standard')
  const [frequency, setFrequency] = useState<CheckInFrequency>(defaultFrequency ?? 'biweekly')
  const [frequencySource, setFrequencySource] = useState<FrequencySource>(
    defaultFrequency ? 'coach_override' : 'evaluation_default'
  )
  const [evaluationDefault, setEvaluationDefault] = useState<CheckInFrequency>(
    defaultFrequency ?? 'biweekly'
  )

  const coachOptions = useMemo(
    () => profileSelectOptions(coaches, 'Unnamed coach'),
    [coaches]
  )
  const schoolOptions = useMemo(() => schoolSelectOptions(schools), [schools])
  const teacherOptions = useMemo(() => teacherSelectOptions(teachers), [teachers])
  const supportLevelOptions = useMemo(
    () => labelsToSelectOptions(supportLevelLabels),
    []
  )
  const frequencyOptions = useMemo(() => labelsToSelectOptions(frequencyLabels), [])

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.id === teacherId),
    [teachers, teacherId]
  )

  useEffect(() => {
    if (!selectedTeacher) return
    const evalFreq = frequencyFromEvaluation(
      selectedTeacher.teaching_evaluation as TeachingEvaluation | null
    )
    setEvaluationDefault(evalFreq)
    if (frequencySource === 'evaluation_default') {
      setFrequency(evalFreq)
    }
  }, [selectedTeacher, frequencySource])

  useEffect(() => {
    if (frequencySource === 'evaluation_default') return
    setFrequency(frequencyFromSupportLevel(supportLevel))
  }, [supportLevel, frequencySource])

  function handleFrequencyChange(value: CheckInFrequency) {
    setFrequency(value)
    setFrequencySource(value === evaluationDefault ? 'evaluation_default' : 'coach_override')
  }

  function handleSupportLevelChange(value: CoachingSupportLevel) {
    setSupportLevel(value)
    if (frequencySource !== 'coach_override') {
      setFrequency(frequencyFromSupportLevel(value))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createCoachingCycle({
      coach_id: coachId,
      teacher_id: teacherId,
      school_id: schoolId,
      focus_area: form.get('focus_area') as string,
      start_date: form.get('start_date') as string,
      check_in_frequency: frequency,
      frequency_source: frequencySource,
      support_level: supportLevel,
      evaluation_cycle_id: evaluationCycleId,
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Coaching cycle created with scheduled check-ins')
    setOpen(false)
    if (result.id) router.push(`/coaching/${result.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size={triggerSize}>{trigger}</DialogTriggerButton>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Coaching Cycle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showCoachPicker && (
            <div className="space-y-2">
              <Label>Coach</Label>
              <Select
                value={coachId}
                onValueChange={(v) => v && setCoachId(v)}
                items={coachOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  {coachOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>School</Label>
            <Select
              value={schoolId}
              onValueChange={(v) => v && setSchoolId(v)}
              items={schoolOptions}
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
            {selectedTeacher?.teaching_evaluation && (
              <p className="text-xs text-muted-foreground">
                Evaluation: {evaluationLabels[selectedTeacher.teaching_evaluation]} · default{' '}
                {frequencyLabels[evaluationDefault].toLowerCase()} check-ins
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus_area">Focus Area</Label>
            <Input
              id="focus_area"
              name="focus_area"
              placeholder="e.g. Differentiated instruction"
              defaultValue={defaultFocusArea}
              required
            />
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Schedule</p>
            </div>

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
              <Label>Support level</Label>
              <Select
                value={supportLevel}
                onValueChange={(v) => v && handleSupportLevelChange(v as CoachingSupportLevel)}
                items={supportLevelOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportLevelOptions.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                High = more frequent check-ins; Light = fewer check-ins for strong performers.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Check-in frequency</Label>
              <Select
                value={frequency}
                onValueChange={(v) => v && handleFrequencyChange(v as CheckInFrequency)}
                items={frequencyOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {frequencySource === 'evaluation_default'
                  ? 'Using evaluation default — change frequency to customize.'
                  : 'Custom frequency (coach override).'}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !schoolId || !teacherId || !coachId}
          >
            {loading ? 'Creating...' : 'Start Cycle & Schedule Check-ins'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
