import { createClient } from '@/lib/supabase/server'

export interface InterventionAssignee {
  id: string
  name: string
  role: string
}

const ADMIN_ROLES = ['admin', 'regional_manager']

/**
 * Resolves the administrator who should own an intervention for a school.
 * Priority: school-assigned admin > school-assigned regional manager > any org admin
 */
export async function resolveInterventionOwner(
  schoolId: string
): Promise<InterventionAssignee | null> {
  const supabase = await createClient()

  // 1. Admins explicitly assigned to this school
  const { data: schoolAssigned } = await supabase
    .from('user_school_assignments')
    .select('user_id, profiles(id, name, role)')
    .eq('school_id', schoolId)

  if (schoolAssigned?.length) {
    const candidates = schoolAssigned
      .map((row) => {
        const raw = row.profiles as
          | { id: string; name: string | null; role: string }
          | { id: string; name: string | null; role: string }[]
          | null
        const p = Array.isArray(raw) ? raw[0] : raw
        if (!p || !ADMIN_ROLES.includes(p.role)) return null
        return {
          id: p.id,
          name: p.name ?? 'Administrator',
          role: p.role,
          priority: p.role === 'admin' ? 0 : 1,
        }
      })
      .filter(Boolean) as (InterventionAssignee & { priority: number })[]

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.priority - b.priority)
      const best = candidates[0]
      return { id: best.id, name: best.name, role: best.role }
    }
  }

  // 2. Fallback: any org-wide administrator
  const { data: orgAdmins } = await supabase
    .from('profiles')
    .select('id, name, role')
    .in('role', ADMIN_ROLES)
    .order('role')
    .limit(1)

  if (orgAdmins?.[0]) {
    return {
      id: orgAdmins[0].id,
      name: orgAdmins[0].name ?? 'Administrator',
      role: orgAdmins[0].role,
    }
  }

  return null
}
