import { createClient } from '@/lib/supabase/server'
import { canManageTimeOff } from '@/lib/permissions'
import type { Profile, TimeOffRequestWithDetails } from '@/lib/database.types'

export async function getTimeOffRequests(
  profile: Profile
): Promise<TimeOffRequestWithDetails[]> {
  const supabase = await createClient()

  let query = supabase
    .from('time_off_requests')
    .select(
      `
      *,
      employee:profiles!time_off_requests_user_id_fkey(name),
      submitter:profiles!time_off_requests_submitted_by_fkey(name),
      reviewer:profiles!time_off_requests_reviewed_by_fkey(name),
      partners(name)
    `
    )
    .order('created_at', { ascending: false })

  if (!canManageTimeOff(profile.role)) {
    query = query.eq('user_id', profile.id)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const r = row as TimeOffRequestWithDetails & {
      employee: { name: string | null } | { name: string | null }[] | null
      submitter: { name: string | null } | { name: string | null }[] | null
      reviewer: { name: string | null } | { name: string | null }[] | null
      partners: { name: string } | { name: string }[] | null
    }
    const employee = Array.isArray(r.employee) ? r.employee[0] : r.employee
    const submitter = Array.isArray(r.submitter) ? r.submitter[0] : r.submitter
    const reviewer = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer
    const partner = Array.isArray(r.partners) ? r.partners[0] : r.partners
    const {
      employee: _employee,
      submitter: _submitter,
      reviewer: _reviewer,
      partners: _partners,
      ...request
    } = r
    return {
      ...request,
      employee_name: employee?.name ?? null,
      submitter_name: submitter?.name ?? null,
      reviewer_name: reviewer?.name ?? null,
      partner_name: partner?.name ?? null,
    }
  })
}
