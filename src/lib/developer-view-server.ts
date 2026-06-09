import { cookies } from 'next/headers'
import {
  appViewToRole,
  roleToAppView,
  type AppView,
} from '@/lib/app-views'
import {
  DEVELOPER_VIEW_COOKIE,
  isDeveloperPreviewView,
} from '@/lib/developer-view'
import type { UserRole } from '@/lib/database.types'

/** Legacy cookie values from before the four-view consolidation */
const LEGACY_PREVIEW_TO_VIEW: Record<string, AppView> = {
  regional_manager: 'admin',
  coach: 'staff',
  consultant: 'staff',
  board_member: 'staff',
  parent: 'teacher',
}

export async function getDeveloperPreviewView(): Promise<AppView | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(DEVELOPER_VIEW_COOKIE)?.value
  if (!value) return null
  if (isDeveloperPreviewView(value)) return value
  return LEGACY_PREVIEW_TO_VIEW[value] ?? null
}

export async function getEffectiveView(actualRole: UserRole): Promise<AppView> {
  if (actualRole !== 'developer') {
    return roleToAppView(actualRole)
  }
  const preview = await getDeveloperPreviewView()
  return preview ?? 'developer'
}

export async function getEffectiveRole(actualRole: UserRole): Promise<UserRole> {
  const view = await getEffectiveView(actualRole)
  return appViewToRole(view)
}
