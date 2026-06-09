import { createClient } from '@/lib/supabase/server'
import {
  CERT_EXPIRY_WARNING_DAYS,
  certificationNeedsReminder,
  computeCertificationStatus,
  daysUntilExpiry,
  type CertificationReminder,
} from '@/lib/certification-expiry'
import type {
  CertificationWithSchool,
  PdEvent,
  PdEventWithCount,
  PdRegistrationWithEvent,
} from '@/lib/database.types'

export async function getPdEvents(): Promise<PdEventWithCount[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pd_events')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) throw error

  return Promise.all(
    (data ?? []).map(async (event) => {
      const { count } = await supabase
        .from('pd_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
      return { ...(event as PdEvent), registration_count: count ?? 0 }
    })
  )
}

export async function getPdEventById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('pd_events').select('*').eq('id', id).single()
  if (error) return null
  return data as PdEvent
}

export async function getUserRegistrations(userId: string): Promise<PdRegistrationWithEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pd_registrations')
    .select('*, pd_events(title, credit_hours, start_date), assigner:profiles!pd_registrations_assigned_by_fkey(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as PdRegistrationWithEvent & {
      pd_events: { title: string; credit_hours: number; start_date: string }
      assigner: { name: string | null } | { name: string | null }[] | null
    }
    const { pd_events, assigner, ...reg } = r
    const assignerRaw = Array.isArray(assigner) ? assigner[0] : assigner
    return {
      ...reg,
      event_title: pd_events.title,
      credit_hours: pd_events.credit_hours,
      start_date: pd_events.start_date,
      assigned_by_name: assignerRaw?.name ?? null,
    }
  })
}

export async function getEventRegistrations(eventId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pd_registrations')
    .select('*, user:profiles!pd_registrations_user_id_fkey(name, role), assigner:profiles!pd_registrations_assigned_by_fkey(name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as {
      id: string
      status: string
      assigned_by: string | null
      user: { name: string | null; role: string } | { name: string | null; role: string }[]
      assigner: { name: string | null } | { name: string | null }[] | null
    }
    const user = Array.isArray(r.user) ? r.user[0] : r.user
    const assigner = Array.isArray(r.assigner) ? r.assigner[0] : r.assigner
    return {
      id: r.id,
      status: r.status,
      user_name: user?.name ?? 'Unknown',
      user_role: user?.role ?? 'staff',
      assigned_by_name: assigner?.name ?? null,
    }
  })
}

export async function getCertifications(userId?: string): Promise<CertificationWithSchool[]> {
  const supabase = await createClient()
  let query = supabase
    .from('certifications')
    .select('*, schools(name), employee:profiles!certifications_user_id_fkey(name)')
    .order('expiry_date', { ascending: true, nullsFirst: false })

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as CertificationWithSchool & {
      schools: { name: string } | { name: string }[] | null
      employee: { name: string | null } | { name: string | null }[] | null
    }
    const school = Array.isArray(r.schools) ? r.schools[0] : r.schools
    const employee = Array.isArray(r.employee) ? r.employee[0] : r.employee
    const { schools, employee: _employee, ...cert } = r
    return {
      ...cert,
      school_name: school?.name ?? null,
      employee_name: employee?.name ?? null,
    }
  })
}

export async function getExpiringCertificationCount(userId: string): Promise<number> {
  const certs = await getCertifications(userId)
  return certs.filter((c) => certificationNeedsReminder(c)).length
}

export async function getCertificationReminders(
  userId: string
): Promise<CertificationReminder[]> {
  const certs = await getCertifications(userId)
  return certs
    .filter((c) => c.expiry_date && certificationNeedsReminder(c))
    .map((c) => ({
      id: c.id,
      certification_type: c.certification_type,
      expiry_date: c.expiry_date!,
      days_remaining: daysUntilExpiry(c.expiry_date)!,
      renewal_approval_status: c.renewal_approval_status,
      school_name: c.school_name,
      location: c.location,
    }))
    .sort((a, b) => a.days_remaining - b.days_remaining)
}

export async function getPendingCertificationRenewals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certifications')
    .select('*, schools(name), employee:profiles!certifications_user_id_fkey(name)')
    .eq('renewal_approval_status', 'pending')
    .order('renewal_submitted_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as CertificationWithSchool & {
      schools: { name: string } | { name: string }[] | null
      employee: { name: string | null } | { name: string | null }[] | null
    }
    const school = Array.isArray(r.schools) ? r.schools[0] : r.schools
    const employee = Array.isArray(r.employee) ? r.employee[0] : r.employee
    const { schools, employee: _employee, ...cert } = r
    return {
      ...cert,
      school_name: school?.name ?? null,
      employee_name: employee?.name ?? null,
    }
  })
}

export { CERT_EXPIRY_WARNING_DAYS, computeCertificationStatus }

export async function getPdSummary() {
  const events = await getPdEvents()
  return {
    upcoming: events.filter((e) => e.status === 'scheduled').length,
    totalCredits: events.reduce((s, e) => s + Number(e.credit_hours), 0),
  }
}
