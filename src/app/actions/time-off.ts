'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManageTimeOff, canSubmitTimeOff, isPartnerUser } from '@/lib/permissions'
import type { RequestStatus, TimeOffType } from '@/lib/database.types'

export async function submitTimeOffRequest(formData: {
  user_id?: string
  type: TimeOffType
  start_date: string
  end_date: string
  reason: string
}) {
  const profile = await getCurrentProfile()
  if (!profile || !canSubmitTimeOff(profile)) {
    return { error: 'You do not have permission to submit time-off requests.' }
  }

  if (!formData.start_date || !formData.end_date) {
    return { error: 'Start and end dates are required.' }
  }

  if (formData.end_date < formData.start_date) {
    return { error: 'End date must be on or after start date.' }
  }

  const reason = formData.reason.trim()
  if (reason.length < 3) {
    return { error: 'Please add notes (at least 3 characters).' }
  }

  const supabase = await createClient()
  let userId = profile.id
  let partnerId = profile.partner_id

  if (canManageTimeOff(profile.role)) {
    if (!formData.user_id) {
      return { error: 'Please select an employee.' }
    }
    userId = formData.user_id

    const { data: subject, error: subjectError } = await supabase
      .from('profiles')
      .select('id, partner_id, role, partner_user_type')
      .eq('id', userId)
      .single()

    if (subjectError || !subject) {
      return { error: 'Selected employee not found.' }
    }

    if (
      subject.role !== 'partner' ||
      subject.partner_user_type !== 'employee' ||
      !subject.partner_id
    ) {
      return { error: 'Time-off can only be submitted for partner employees.' }
    }

    partnerId = subject.partner_id
  } else if (!isPartnerUser(profile) || !partnerId) {
    return { error: 'Partner account not configured.' }
  }

  const { error } = await supabase.from('time_off_requests').insert([
    {
      user_id: userId,
      partner_id: partnerId,
      submitted_by: profile.id,
      type: formData.type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason,
      status: 'pending' as RequestStatus,
    },
  ])

  if (error) return { error: error.message }

  revalidatePath('/partners/employees')
  return { success: true }
}

export async function updateTimeOffRequestStatus(
  id: string,
  status: 'approved' | 'denied',
  reviewNotes?: string
) {
  const profile = await getCurrentProfile()
  if (!profile || !canManageTimeOff(profile.role)) {
    return { error: 'Only administrators can review time-off requests.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('time_off_requests')
    .update({
      status,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')

  if (error) return { error: error.message }

  revalidatePath('/partners/employees')
  return { success: true }
}
