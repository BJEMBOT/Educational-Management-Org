'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { hasPermission } from '@/lib/permissions'
import { computeCertificationStatus } from '@/lib/certification-expiry'
import type { CertificationStatus, PdEventStatus } from '@/lib/database.types'

export async function createPdEvent(data: {
  title: string
  description?: string
  credit_hours: number
  start_date: string
  end_date?: string
  format: string
  location?: string
  facilitator?: string
  meeting_url?: string
  meeting_id?: string
  meeting_passcode?: string
  materials_url?: string
  join_instructions?: string
  status?: PdEventStatus
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('pd_events').insert([data])
  if (error) return { error: error.message }
  revalidatePath('/pd')
  return { success: true }
}

export async function registerForPd(eventId: string, userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pd_registrations')
    .insert([{ event_id: eventId, user_id: userId }])
  if (error) return { error: error.message }
  revalidatePath('/pd')
  revalidatePath(`/pd/${eventId}`)
  revalidatePath('/workspace')
  return { success: true }
}

export async function markAttendance(registrationId: string, eventId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pd_registrations')
    .update({ attended: true, status: 'attended' })
    .eq('id', registrationId)
  if (error) return { error: error.message }
  revalidatePath(`/pd/${eventId}`)
  return { success: true }
}

export async function createCertification(data: {
  user_id: string
  certification_type: string
  issued_date: string
  expiry_date?: string
  school_id?: string
  location?: string
  status?: CertificationStatus
  notes?: string
}) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  const canManage = hasPermission(profile.role, 'certifications.manage')
  if (data.user_id !== profile.id && !canManage) {
    return { error: 'You can only add certifications for yourself.' }
  }

  const status =
    data.status ??
    computeCertificationStatus(data.expiry_date ?? null)

  const supabase = await createClient()
  const { error } = await supabase.from('certifications').insert([{ ...data, status }])
  if (error) return { error: error.message }
  revalidatePath('/certifications')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function submitCertificationRenewal(
  certificationId: string,
  data: { renewal_issued_date: string; renewal_expiry_date: string }
) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  const supabase = await createClient()
  const { data: cert, error: fetchError } = await supabase
    .from('certifications')
    .select('user_id, renewal_approval_status')
    .eq('id', certificationId)
    .single()

  if (fetchError || !cert) return { error: 'Certification not found' }
  if (cert.user_id !== profile.id) {
    return { error: 'You can only submit renewals for your own certifications.' }
  }
  if (cert.renewal_approval_status === 'pending') {
    return { error: 'A renewal is already pending admin approval.' }
  }

  const { error } = await supabase
    .from('certifications')
    .update({
      renewal_issued_date: data.renewal_issued_date,
      renewal_expiry_date: data.renewal_expiry_date,
      renewal_approval_status: 'pending',
      renewal_submitted_at: new Date().toISOString(),
      renewal_approved_by: null,
      renewal_approved_at: null,
    })
    .eq('id', certificationId)

  if (error) return { error: error.message }
  revalidatePath('/certifications')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function approveCertificationRenewal(certificationId: string) {
  const profile = await getCurrentProfile()
  if (!profile || !hasPermission(profile.role, 'certifications.manage')) {
    return { error: 'Only administrators can approve renewals.' }
  }

  const supabase = await createClient()
  const { data: cert, error: fetchError } = await supabase
    .from('certifications')
    .select('renewal_issued_date, renewal_expiry_date, renewal_approval_status')
    .eq('id', certificationId)
    .single()

  if (fetchError || !cert) return { error: 'Certification not found' }
  if (cert.renewal_approval_status !== 'pending') {
    return { error: 'No pending renewal to approve.' }
  }
  if (!cert.renewal_issued_date || !cert.renewal_expiry_date) {
    return { error: 'Renewal dates are missing.' }
  }

  const newStatus = computeCertificationStatus(cert.renewal_expiry_date)
  const { error } = await supabase
    .from('certifications')
    .update({
      issued_date: cert.renewal_issued_date,
      expiry_date: cert.renewal_expiry_date,
      status: newStatus,
      renewal_approval_status: 'approved',
      renewal_approved_by: profile.id,
      renewal_approved_at: new Date().toISOString(),
    })
    .eq('id', certificationId)

  if (error) return { error: error.message }
  revalidatePath('/certifications')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function rejectCertificationRenewal(certificationId: string) {
  const profile = await getCurrentProfile()
  if (!profile || !hasPermission(profile.role, 'certifications.manage')) {
    return { error: 'Only administrators can reject renewals.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('certifications')
    .update({ renewal_approval_status: 'rejected' })
    .eq('id', certificationId)
    .eq('renewal_approval_status', 'pending')

  if (error) return { error: error.message }
  revalidatePath('/certifications')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateCertification(
  id: string,
  data: Partial<{
    certification_type: string
    expiry_date: string
    status: CertificationStatus
    notes: string
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('certifications').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/certifications')
  return { success: true }
}

export async function deleteCertification(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('certifications').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/certifications')
  return { success: true }
}
