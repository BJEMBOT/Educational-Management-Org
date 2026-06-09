import { getCurrentProfile } from '@/lib/queries/profile'
import { canManageSystemRecords } from '@/lib/permissions'
import type { Profile } from '@/lib/database.types'

export const SYSTEM_MANAGER_DENIED =
  'Only administrators and developers can perform this action.' as const

export async function requireSystemManager(): Promise<
  | { ok: true; profile: Profile }
  | { ok: false; error: typeof SYSTEM_MANAGER_DENIED; profile: null }
> {
  const profile = await getCurrentProfile()
  if (!profile || !canManageSystemRecords(profile.role)) {
    return { ok: false, error: SYSTEM_MANAGER_DENIED, profile: null }
  }
  return { ok: true, profile }
}
