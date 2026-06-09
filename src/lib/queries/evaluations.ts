import { createClient } from '@/lib/supabase/server'
import { aggregateScores } from '@/lib/evaluation-rubric'
import type {
  AggregatedRubricScores,
  RubricDomain as RubricDomainTree,
} from '@/lib/evaluation-rubric'
import type {
  EvaluationArtifactWithUploader,
  EvaluationCycle,
  EvaluationCycleStatus,
  EvaluationCycleWithDetails,
  EvaluationFramework,
  Observation,
  ObservationRubricScore,
  ObservationWithDetails,
  RubricDomain,
  RubricIndicator,
  RubricRating,
  TeachingEvaluation,
} from '@/lib/database.types'

export async function getEvaluationFrameworks(): Promise<EvaluationFramework[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('evaluation_frameworks')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getRubricTree(frameworkId: string): Promise<RubricDomainTree[]> {
  const supabase = await createClient()
  const { data: domains, error: domainError } = await supabase
    .from('rubric_domains')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('sort_order')
  if (domainError) throw domainError
  if (!domains?.length) return []

  const domainIds = domains.map((d) => d.id)
  const { data: indicators, error: indicatorError } = await supabase
    .from('rubric_indicators')
    .select('*')
    .in('domain_id', domainIds)
    .order('sort_order')
  if (indicatorError) throw indicatorError

  const indicatorMap = new Map<string, RubricIndicator[]>()
  for (const ind of indicators ?? []) {
    const list = indicatorMap.get(ind.domain_id) ?? []
    list.push(ind as RubricIndicator)
    indicatorMap.set(ind.domain_id, list)
  }

  return (domains as RubricDomain[]).map((d) => ({
    id: d.id,
    framework_id: d.framework_id,
    name: d.name,
    sort_order: d.sort_order,
    indicators: indicatorMap.get(d.id) ?? [],
  }))
}

export async function getEvaluationCycles(filters?: {
  teacherId?: string
  evaluatorId?: string
  schoolId?: string
  status?: EvaluationCycleStatus
}): Promise<EvaluationCycleWithDetails[]> {
  const supabase = await createClient()
  let query = supabase
    .from('evaluation_cycles')
    .select('*, schools(name), evaluation_frameworks(name)')
    .order('created_at', { ascending: false })

  if (filters?.teacherId) query = query.eq('teacher_id', filters.teacherId)
  if (filters?.evaluatorId) query = query.eq('evaluator_id', filters.evaluatorId)
  if (filters?.schoolId) query = query.eq('school_id', filters.schoolId)
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  if (!data?.length) return []

  const profileIds = [
    ...new Set(data.flatMap((c) => [c.teacher_id, c.evaluator_id])),
  ]
  const cycleIds = data.map((c) => c.id)

  const [profilesRes, obsRes] = await Promise.all([
    supabase.from('profiles').select('id, name').in('id', profileIds),
    supabase
      .from('observations')
      .select('evaluation_cycle_id')
      .in('evaluation_cycle_id', cycleIds),
  ])

  const nameMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p.name ?? 'Unknown'])
  )
  const obsCountMap = new Map<string, number>()
  for (const o of obsRes.data ?? []) {
    if (!o.evaluation_cycle_id) continue
    obsCountMap.set(
      o.evaluation_cycle_id,
      (obsCountMap.get(o.evaluation_cycle_id) ?? 0) + 1
    )
  }

  return data.map((c) => {
    const school = Array.isArray(c.schools) ? c.schools[0] : c.schools
    const framework = Array.isArray(c.evaluation_frameworks)
      ? c.evaluation_frameworks[0]
      : c.evaluation_frameworks
    return {
      ...(c as EvaluationCycle),
      teacher_name: nameMap.get(c.teacher_id) ?? 'Unknown',
      evaluator_name: nameMap.get(c.evaluator_id) ?? 'Unknown',
      school_name: school?.name ?? 'Unknown',
      framework_name: framework?.name ?? 'Unknown',
      observation_count: obsCountMap.get(c.id) ?? 0,
    }
  })
}

export async function getEvaluationCycleById(id: string) {
  const supabase = await createClient()

  const [cycleRes, obsRes, artifactsRes, coachingRes] = await Promise.all([
    supabase
      .from('evaluation_cycles')
      .select('*, schools(name), evaluation_frameworks(name, slug)')
      .eq('id', id)
      .single(),
    supabase
      .from('observations')
      .select('*')
      .eq('evaluation_cycle_id', id)
      .order('observation_date', { ascending: false }),
    supabase
      .from('evaluation_artifacts')
      .select('*')
      .eq('evaluation_cycle_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('coaching_cycles')
      .select('id, focus_area, status, coach_id')
      .eq('evaluation_cycle_id', id)
      .maybeSingle(),
  ])

  if (cycleRes.error || !cycleRes.data) return null

  const cycle = cycleRes.data
  const profileIds = [
    cycle.teacher_id,
    cycle.evaluator_id,
    ...(obsRes.data ?? []).map((o) => o.observer_id).filter(Boolean),
    ...(artifactsRes.data ?? []).map((a) => a.uploaded_by),
    coachingRes.data?.coach_id,
  ].filter(Boolean) as string[]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, teaching_evaluation')
    .in('id', [...new Set(profileIds)])

  const nameMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.name ?? 'Unknown'])
  )

  const obsIds = (obsRes.data ?? []).map((o) => o.id)
  let rubricScores: { observation_id: string; indicator_id: string; rating: RubricRating }[] =
    []
  if (obsIds.length > 0) {
    const { data: scores } = await supabase
      .from('observation_rubric_scores')
      .select('*')
      .in('observation_id', obsIds)
    rubricScores = (scores ?? []) as typeof rubricScores
  }

  const scoresByObs = new Map<string, typeof rubricScores>()
  for (const s of rubricScores) {
    const list = scoresByObs.get(s.observation_id) ?? []
    list.push(s)
    scoresByObs.set(s.observation_id, list)
  }

  const observations: ObservationWithDetails[] = (obsRes.data ?? []).map((o) => ({
    ...(o as Observation),
    walkthrough_data: (o.walkthrough_data as Observation['walkthrough_data']) ?? {},
    observer_name: o.observer_id ? nameMap.get(o.observer_id) ?? null : null,
    rubric_scores: (scoresByObs.get(o.id) ?? []) as ObservationRubricScore[],
  }))

  const artifacts: EvaluationArtifactWithUploader[] = (artifactsRes.data ?? []).map(
    (a) => ({
      ...a,
      uploader_name: nameMap.get(a.uploaded_by) ?? 'Unknown',
    })
  )

  const school = Array.isArray(cycle.schools) ? cycle.schools[0] : cycle.schools
  const framework = Array.isArray(cycle.evaluation_frameworks)
    ? cycle.evaluation_frameworks[0]
    : cycle.evaluation_frameworks

  const rubricTree = await getRubricTree(cycle.framework_id)
  const aggregatedScores = await aggregateRubricScoresForCycle(id, rubricTree)

  return {
    cycle: {
      ...(cycle as EvaluationCycle),
      teacher_name: nameMap.get(cycle.teacher_id) ?? 'Unknown',
      evaluator_name: nameMap.get(cycle.evaluator_id) ?? 'Unknown',
      school_name: school?.name ?? 'Unknown',
      framework_name: framework?.name ?? 'Unknown',
      framework_slug: framework?.slug ?? '',
      observation_count: observations.length,
    },
    observations,
    artifacts,
    linkedCoachingCycle: coachingRes.data
      ? {
          ...coachingRes.data,
          coach_name: nameMap.get(coachingRes.data.coach_id) ?? 'Unknown',
        }
      : null,
    rubricTree,
    aggregatedScores,
    teacherEvaluation:
      profiles?.find((p) => p.id === cycle.teacher_id)?.teaching_evaluation ?? null,
  }
}

export async function aggregateRubricScoresForCycle(
  evaluationCycleId: string,
  rubricTree?: RubricDomainTree[]
): Promise<AggregatedRubricScores> {
  const supabase = await createClient()
  const tree = rubricTree ?? (await getRubricTree(
    (
      await supabase
        .from('evaluation_cycles')
        .select('framework_id')
        .eq('id', evaluationCycleId)
        .single()
    ).data?.framework_id ?? ''
  ))

  const indicatorMeta = new Map<
    string,
    { domain_id: string; domain_name: string }
  >()
  for (const domain of tree) {
    for (const ind of domain.indicators) {
      indicatorMeta.set(ind.id, { domain_id: domain.id, domain_name: domain.name })
    }
  }

  const { data: observations } = await supabase
    .from('observations')
    .select('id')
    .eq('evaluation_cycle_id', evaluationCycleId)

  if (!observations?.length) {
    return { domains: [], overall_average: 0, overall_rating: 'developing' }
  }

  const { data: scores } = await supabase
    .from('observation_rubric_scores')
    .select('indicator_id, rating')
    .in(
      'observation_id',
      observations.map((o) => o.id)
    )

  const flatScores = (scores ?? [])
    .map((s) => {
      const meta = indicatorMeta.get(s.indicator_id)
      if (!meta) return null
      return {
        indicator_id: s.indicator_id,
        domain_id: meta.domain_id,
        domain_name: meta.domain_name,
        rating: s.rating as RubricRating,
      }
    })
    .filter(Boolean) as {
    indicator_id: string
    domain_id: string
    domain_name: string
    rating: RubricRating
  }[]

  return aggregateScores(flatScores)
}

export async function summarizeEvaluations() {
  const cycles = await getEvaluationCycles()
  const active = cycles.filter((c) => c.status === 'active').length
  const draft = cycles.filter((c) => c.status === 'draft').length
  const completed = cycles.filter((c) => c.status === 'completed').length
  const overdue = cycles.filter(
    (c) =>
      c.status === 'active' &&
      c.end_date &&
      new Date(c.end_date) < new Date()
  ).length

  const ratingCounts: Record<TeachingEvaluation, number> = {
    exemplary: 0,
    effective: 0,
    developing: 0,
    needs_improvement: 0,
  }
  for (const c of cycles) {
    if (c.overall_rating) ratingCounts[c.overall_rating]++
  }

  return { total: cycles.length, active, draft, completed, overdue, ratingCounts }
}

export async function getEvaluatorProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'developer', 'regional_manager', 'coach', 'consultant'])
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getActiveEvaluationForTeacher(teacherId: string) {
  const cycles = await getEvaluationCycles({
    teacherId,
    status: 'active',
  })
  return cycles[0] ?? null
}
