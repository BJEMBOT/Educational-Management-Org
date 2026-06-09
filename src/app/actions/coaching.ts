'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { requireSystemManager } from '@/lib/action-auth'
import { canDeleteScheduledRecords } from '@/lib/permissions'
import {
  DEFAULT_CHECK_IN_COUNT,
  addFrequencyInterval,
  generateCheckInDates,
} from '@/lib/coaching-schedule'
import type {
  CheckInFrequency,
  CoachingCycleStatus,
  CoachingSupportLevel,
  FrequencySource,
  ObservationType,
} from '@/lib/database.types'

async function insertCheckIns(
  cycleId: string,
  startDate: string,
  frequency: CheckInFrequency,
  count = DEFAULT_CHECK_IN_COUNT
) {
  const supabase = await createClient()
  const dates = generateCheckInDates(new Date(startDate), frequency, count)
  const rows = dates.map((d) => ({
    cycle_id: cycleId,
    scheduled_at: d.toISOString(),
    status: 'scheduled' as const,
  }))

  const { error } = await supabase.from('coaching_check_ins').insert(rows)
  if (error) return { error: error.message }

  const nextAt = dates[0]?.toISOString() ?? null
  await supabase
    .from('coaching_cycles')
    .update({ next_check_in_at: nextAt })
    .eq('id', cycleId)

  return { success: true as const, nextAt }
}

export async function createCoachingCycle(data: {
  coach_id: string
  teacher_id: string
  school_id: string
  focus_area: string
  start_date?: string
  check_in_frequency: CheckInFrequency
  frequency_source: FrequencySource
  support_level: CoachingSupportLevel
  end_date?: string
  evaluation_cycle_id?: string
}) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const startDate = data.start_date ?? new Date().toISOString().slice(0, 10)

  const { data: cycle, error } = await supabase
    .from('coaching_cycles')
    .insert([
      {
        coach_id: data.coach_id,
        teacher_id: data.teacher_id,
        school_id: data.school_id,
        focus_area: data.focus_area,
        start_date: startDate,
        end_date: data.end_date,
        check_in_frequency: data.check_in_frequency,
        frequency_source: data.frequency_source,
        support_level: data.support_level,
        evaluation_cycle_id: data.evaluation_cycle_id ?? null,
      },
    ])
    .select()
    .single()

  if (error) return { error: error.message }

  const checkInResult = await insertCheckIns(
    cycle.id,
    startDate,
    data.check_in_frequency
  )
  if (checkInResult.error) return { error: checkInResult.error }

  revalidatePath('/coaching')
  revalidatePath('/workspace')
  revalidatePath('/calendar')
  if (data.evaluation_cycle_id) {
    revalidatePath(`/evaluations/${data.evaluation_cycle_id}`)
  }
  return { success: true, id: cycle.id }
}

export async function updateCoachingCycle(
  id: string,
  data: Partial<{
    focus_area: string
    status: CoachingCycleStatus
    end_date: string
    check_in_frequency: CheckInFrequency
    frequency_source: FrequencySource
    support_level: CoachingSupportLevel
  }>
) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('coaching_cycles').update(data).eq('id', id)
  if (error) return { error: error.message }

  if (data.check_in_frequency) {
    await supabase
      .from('coaching_check_ins')
      .delete()
      .eq('cycle_id', id)
      .eq('status', 'scheduled')

    const { data: cycle } = await supabase
      .from('coaching_cycles')
      .select('start_date, check_in_frequency')
      .eq('id', id)
      .single()

    if (cycle) {
      await insertCheckIns(id, cycle.start_date, cycle.check_in_frequency as CheckInFrequency)
    }
  }

  revalidatePath('/coaching')
  revalidatePath(`/coaching/${id}`)
  revalidatePath('/calendar')
  return { success: true }
}

export async function completeCheckIn(checkInId: string, notes?: string) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: checkIn, error: fetchError } = await supabase
    .from('coaching_check_ins')
    .select('cycle_id, scheduled_at')
    .eq('id', checkInId)
    .single()

  if (fetchError || !checkIn) return { error: 'Check-in not found.' }

  const { error } = await supabase
    .from('coaching_check_ins')
    .update({
      status: 'completed',
      completed_at: now,
      notes: notes?.trim() || null,
    })
    .eq('id', checkInId)

  if (error) return { error: error.message }

  const { data: cycle } = await supabase
    .from('coaching_cycles')
    .select('check_in_frequency')
    .eq('id', checkIn.cycle_id)
    .single()

  const frequency = (cycle?.check_in_frequency ?? 'biweekly') as CheckInFrequency

  const { data: remaining } = await supabase
    .from('coaching_check_ins')
    .select('scheduled_at')
    .eq('cycle_id', checkIn.cycle_id)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(1)

  let nextAt = remaining?.[0]?.scheduled_at ?? null

  if (!nextAt) {
    const lastDate = new Date(checkIn.scheduled_at)
    const nextDate = addFrequencyInterval(lastDate, frequency)
    nextAt = nextDate.toISOString()

    await supabase.from('coaching_check_ins').insert([
      {
        cycle_id: checkIn.cycle_id,
        scheduled_at: nextAt,
        status: 'scheduled',
      },
    ])
  }

  await supabase
    .from('coaching_cycles')
    .update({ next_check_in_at: nextAt })
    .eq('id', checkIn.cycle_id)

  revalidatePath(`/coaching/${checkIn.cycle_id}`)
  revalidatePath('/coaching')
  revalidatePath('/calendar')
  revalidatePath('/workspace')
  return { success: true }
}

export async function rescheduleCheckIn(checkInId: string, scheduledAt: string) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()

  const { data: checkIn, error: fetchError } = await supabase
    .from('coaching_check_ins')
    .select('cycle_id')
    .eq('id', checkInId)
    .single()

  if (fetchError || !checkIn) return { error: 'Check-in not found.' }

  const { error } = await supabase
    .from('coaching_check_ins')
    .update({ scheduled_at: new Date(scheduledAt).toISOString() })
    .eq('id', checkInId)

  if (error) return { error: error.message }

  const { data: next } = await supabase
    .from('coaching_check_ins')
    .select('scheduled_at')
    .eq('cycle_id', checkIn.cycle_id)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single()

  if (next) {
    await supabase
      .from('coaching_cycles')
      .update({ next_check_in_at: next.scheduled_at })
      .eq('id', checkIn.cycle_id)
  }

  revalidatePath(`/coaching/${checkIn.cycle_id}`)
  revalidatePath('/calendar')
  return { success: true }
}

export async function cancelCheckIn(checkInId: string) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()

  const { data: checkIn, error: fetchError } = await supabase
    .from('coaching_check_ins')
    .select('cycle_id')
    .eq('id', checkInId)
    .single()

  if (fetchError || !checkIn) return { error: 'Check-in not found.' }

  const { error } = await supabase
    .from('coaching_check_ins')
    .update({ status: 'cancelled' })
    .eq('id', checkInId)

  if (error) return { error: error.message }

  const { data: next } = await supabase
    .from('coaching_check_ins')
    .select('scheduled_at')
    .eq('cycle_id', checkIn.cycle_id)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single()

  await supabase
    .from('coaching_cycles')
    .update({ next_check_in_at: next?.scheduled_at ?? null })
    .eq('id', checkIn.cycle_id)

  revalidatePath(`/coaching/${checkIn.cycle_id}`)
  revalidatePath('/calendar')
  return { success: true }
}

export async function createObservation(data: {
  cycle_id?: string
  evaluation_cycle_id?: string
  observer_id?: string
  observation_type: ObservationType
  notes: string
  feedback: string
  observation_date?: string
  walkthrough_data?: Record<string, string>
  ratings?: Record<string, number>
}) {
  if (!data.cycle_id && !data.evaluation_cycle_id) {
    return { error: 'Observation must be linked to a coaching or evaluation cycle.' }
  }

  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('observations').insert([
    {
      cycle_id: data.cycle_id ?? null,
      evaluation_cycle_id: data.evaluation_cycle_id ?? null,
      observer_id: data.observer_id ?? null,
      observation_type: data.observation_type,
      notes: data.notes,
      feedback: data.feedback,
      observation_date: data.observation_date,
      walkthrough_data: data.walkthrough_data ?? {},
      ratings: data.ratings ?? {},
    },
  ])
  if (error) return { error: error.message }
  if (data.cycle_id) revalidatePath(`/coaching/${data.cycle_id}`)
  if (data.evaluation_cycle_id) {
    revalidatePath(`/evaluations/${data.evaluation_cycle_id}`)
  }
  revalidatePath('/coaching')
  revalidatePath('/calendar')
  return { success: true }
}

export async function addCoachingLog(data: {
  cycle_id: string
  content: string
  created_by: string
}) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('coaching_logs').insert([data])
  if (error) return { error: error.message }
  revalidatePath(`/coaching/${data.cycle_id}`)
  return { success: true }
}

export async function deleteCoachingCycle(id: string) {
  const profile = await getCurrentProfile()
  if (!profile || !canDeleteScheduledRecords(profile.role)) {
    return { error: 'Only administrators and developers can delete coaching cycles.' }
  }

  const supabase = await createClient()
  const { data: cycle } = await supabase
    .from('coaching_cycles')
    .select('evaluation_cycle_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('coaching_cycles').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/coaching')
  revalidatePath(`/coaching/${id}`)
  revalidatePath('/calendar')
  revalidatePath('/workspace')
  if (cycle?.evaluation_cycle_id) {
    revalidatePath(`/evaluations/${cycle.evaluation_cycle_id}`)
  }
  return { success: true }
}

export async function deleteCheckIn(checkInId: string) {
  const profile = await getCurrentProfile()
  if (!profile || !canDeleteScheduledRecords(profile.role)) {
    return { error: 'Only administrators and developers can delete check-ins.' }
  }

  const supabase = await createClient()
  const { data: checkIn, error: fetchError } = await supabase
    .from('coaching_check_ins')
    .select('cycle_id')
    .eq('id', checkInId)
    .single()

  if (fetchError || !checkIn) return { error: 'Check-in not found.' }

  const { error } = await supabase.from('coaching_check_ins').delete().eq('id', checkInId)
  if (error) return { error: error.message }

  const { data: next } = await supabase
    .from('coaching_check_ins')
    .select('scheduled_at')
    .eq('cycle_id', checkIn.cycle_id)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  await supabase
    .from('coaching_cycles')
    .update({ next_check_in_at: next?.scheduled_at ?? null })
    .eq('id', checkIn.cycle_id)

  revalidatePath(`/coaching/${checkIn.cycle_id}`)
  revalidatePath('/coaching')
  revalidatePath('/calendar')
  revalidatePath('/workspace')
  return { success: true }
}
