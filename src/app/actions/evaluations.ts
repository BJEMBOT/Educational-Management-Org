'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { requireSystemManager } from '@/lib/action-auth'
import { canDeleteScheduledRecords } from '@/lib/permissions'
import { buildRatingsSnapshot } from '@/lib/evaluation-rubric'
import { aggregateRubricScoresForCycle } from '@/lib/queries/evaluations'
import type {
  ArtifactType,
  EvaluationCycleStatus,
  EvaluationCycleType,
  ObservationType,
  RubricRating,
  WalkthroughData,
} from '@/lib/database.types'

const ARTIFACT_BUCKET = 'evaluation-artifacts'
const MAX_ARTIFACT_BYTES = 10 * 1024 * 1024

export async function createEvaluationCycle(data: {
  teacher_id: string
  school_id: string
  evaluator_id: string
  framework_id: string
  cycle_type: EvaluationCycleType
  school_year: string
  start_date?: string
  end_date?: string
}) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { data: cycle, error } = await supabase
    .from('evaluation_cycles')
    .insert([
      {
        ...data,
        status: 'active',
        start_date: data.start_date ?? new Date().toISOString().slice(0, 10),
      },
    ])
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/evaluations')
  revalidatePath('/workspace')
  return { success: true, id: cycle.id }
}

export async function updateEvaluationCycle(
  id: string,
  data: Partial<{
    status: EvaluationCycleStatus
    end_date: string
    overall_rating: string
    evaluator_id: string
  }>
) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('evaluation_cycles').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/evaluations')
  revalidatePath(`/evaluations/${id}`)
  revalidatePath('/workspace')
  return { success: true }
}

export async function completeEvaluationCycle(id: string) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()

  const aggregated = await aggregateRubricScoresForCycle(id)
  const overallRating =
    aggregated.overall_average > 0 ? aggregated.overall_rating : null

  const { data: cycle, error } = await supabase
    .from('evaluation_cycles')
    .update({
      status: 'completed',
      overall_rating: overallRating,
    })
    .eq('id', id)
    .select('teacher_id, overall_rating')
    .single()

  if (error) return { error: error.message }

  if (cycle?.overall_rating) {
    await supabase
      .from('profiles')
      .update({ teaching_evaluation: cycle.overall_rating })
      .eq('id', cycle.teacher_id)
  }

  revalidatePath('/evaluations')
  revalidatePath(`/evaluations/${id}`)
  revalidatePath('/coaching')
  revalidatePath('/workspace')
  return { success: true, overall_rating: cycle?.overall_rating }
}

export async function createEvaluationObservation(data: {
  evaluation_cycle_id: string
  observer_id: string
  observation_type: ObservationType
  notes: string
  feedback: string
  observation_date?: string
  cycle_id?: string
  walkthrough_data?: WalkthroughData
  rubric_scores?: { indicator_id: string; code: string; rating: RubricRating }[]
}) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()

  const ratings =
    data.rubric_scores?.length
      ? buildRatingsSnapshot(data.rubric_scores)
      : {}

  const { data: observation, error } = await supabase
    .from('observations')
    .insert([
      {
        evaluation_cycle_id: data.evaluation_cycle_id,
        cycle_id: data.cycle_id ?? null,
        observer_id: data.observer_id,
        observation_type: data.observation_type,
        notes: data.notes,
        feedback: data.feedback,
        observation_date: data.observation_date ?? new Date().toISOString(),
        walkthrough_data: data.walkthrough_data ?? {},
        ratings,
      },
    ])
    .select()
    .single()

  if (error) return { error: error.message }

  if (data.rubric_scores?.length) {
    const scoreRows = data.rubric_scores.map((s) => ({
      observation_id: observation.id,
      indicator_id: s.indicator_id,
      rating: s.rating,
    }))
    const { error: scoreError } = await supabase
      .from('observation_rubric_scores')
      .insert(scoreRows)
    if (scoreError) return { error: scoreError.message }
  }

  revalidatePath(`/evaluations/${data.evaluation_cycle_id}`)
  if (data.cycle_id) revalidatePath(`/coaching/${data.cycle_id}`)
  revalidatePath('/calendar')
  return { success: true, id: observation.id }
}

export async function uploadEvaluationArtifact(formData: FormData) {
  const evaluationCycleId = formData.get('evaluation_cycle_id') as string
  const title = formData.get('title') as string
  const artifactType = formData.get('artifact_type') as ArtifactType
  const notes = (formData.get('notes') as string) || null
  const uploadedBy = formData.get('uploaded_by') as string
  const file = formData.get('file') as File | null

  if (!evaluationCycleId || !title || !uploadedBy) {
    return { error: 'Missing required fields.' }
  }

  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  let fileUrl: string | null = null

  if (file && file.size > 0) {
    if (file.size > MAX_ARTIFACT_BYTES) {
      return { error: 'File must be 10 MB or smaller.' }
    }
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${evaluationCycleId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(ARTIFACT_BUCKET)
      .upload(path, file)
    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = await supabase.storage
      .from(ARTIFACT_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365)
    fileUrl = urlData?.signedUrl ?? null
  }

  const { error } = await supabase.from('evaluation_artifacts').insert([
    {
      evaluation_cycle_id: evaluationCycleId,
      artifact_type: artifactType,
      title,
      file_url: fileUrl,
      notes,
      uploaded_by: uploadedBy,
    },
  ])

  if (error) return { error: error.message }

  revalidatePath(`/evaluations/${evaluationCycleId}`)
  revalidatePath('/workspace')
  return { success: true }
}

export async function linkCoachingToEvaluation(
  evaluationCycleId: string,
  coachingCycleId: string
) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('coaching_cycles')
    .update({ evaluation_cycle_id: evaluationCycleId })
    .eq('id', coachingCycleId)

  if (error) return { error: error.message }

  revalidatePath(`/evaluations/${evaluationCycleId}`)
  revalidatePath(`/coaching/${coachingCycleId}`)
  return { success: true }
}

export async function deleteEvaluationCycle(id: string) {
  const profile = await getCurrentProfile()
  if (!profile || !canDeleteScheduledRecords(profile.role)) {
    return { error: 'Only administrators and developers can delete evaluations.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('evaluation_cycles').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/evaluations')
  revalidatePath(`/evaluations/${id}`)
  revalidatePath('/coaching')
  revalidatePath('/workspace')
  revalidatePath('/calendar')
  return { success: true }
}
