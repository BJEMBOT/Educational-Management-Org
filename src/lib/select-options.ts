import { evaluationLabels } from '@/lib/coaching-schedule'
import type { EvaluationFramework, Profile, School } from '@/lib/database.types'

export type SelectOption = { value: string; label: string }

export function schoolSelectOptions(schools: School[]): SelectOption[] {
  return schools.map((s) => ({ value: s.id, label: s.name }))
}

export function profileSelectOptions(
  profiles: Profile[],
  fallback = 'Unnamed'
): SelectOption[] {
  return profiles.map((p) => ({ value: p.id, label: p.name ?? fallback }))
}

export function teacherSelectOptions(teachers: Profile[]): SelectOption[] {
  return teachers.map((t) => {
    const name = t.name ?? 'Unnamed teacher'
    const evalSuffix = t.teaching_evaluation
      ? ` — ${evaluationLabels[t.teaching_evaluation]}`
      : ''
    return { value: t.id, label: `${name}${evalSuffix}` }
  })
}

export function frameworkSelectOptions(frameworks: EvaluationFramework[]): SelectOption[] {
  return frameworks.map((f) => ({ value: f.id, label: f.name }))
}

export function labelsToSelectOptions<T extends string>(
  labels: Record<T, string>
): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((key) => ({
    value: key,
    label: labels[key],
  }))
}
