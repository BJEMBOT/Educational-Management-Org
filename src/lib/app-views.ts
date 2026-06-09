import type { UserRole } from '@/lib/database.types'

/** Personas developers can preview */
export type PreviewAppView = 'admin' | 'staff' | 'partner' | 'teacher'

export const PREVIEW_APP_VIEWS: PreviewAppView[] = [
  'admin',
  'staff',
  'partner',
  'teacher',
]

/** All navigable app views (preview personas + developer) */
export type AppView = PreviewAppView | 'developer'

export const appViewLabels: Record<AppView, string> = {
  developer: 'Developer',
  admin: 'Admins',
  staff: 'Staff',
  partner: 'Partners',
  teacher: 'Teachers',
}

/** Map a database role to its app view */
export function roleToAppView(role: UserRole): AppView {
  switch (role) {
    case 'developer':
      return 'developer'
    case 'partner':
      return 'partner'
    case 'teacher':
    case 'parent':
      return 'teacher'
    case 'staff':
    case 'coach':
    case 'consultant':
    case 'board_member':
      return 'staff'
    case 'admin':
    case 'regional_manager':
    default:
      return 'admin'
  }
}

/** Representative role for nav layout and UI when previewing a view */
export function appViewToRole(view: AppView): UserRole {
  switch (view) {
    case 'developer':
      return 'developer'
    case 'partner':
      return 'partner'
    case 'teacher':
      return 'teacher'
    case 'staff':
      return 'staff'
    case 'admin':
      return 'admin'
  }
}

export function getDefaultHomePathForView(view: AppView): string {
  switch (view) {
    case 'partner':
      return '/partners'
    case 'teacher':
      return '/workspace'
    case 'developer':
    case 'staff':
    case 'admin':
    default:
      return '/'
  }
}

export function isPreviewAppView(value: string): value is PreviewAppView {
  return PREVIEW_APP_VIEWS.includes(value as PreviewAppView)
}

export function isAppView(value: string): value is AppView {
  return value === 'developer' || isPreviewAppView(value)
}

/** Whether a nav item is visible for the given view */
export function isNavVisibleForView(
  itemViews: AppView[],
  view: AppView
): boolean {
  if (itemViews.includes(view)) return true
  // Developers see everything admins see, plus developer-only items
  if (view === 'developer' && itemViews.includes('admin')) return true
  return false
}
