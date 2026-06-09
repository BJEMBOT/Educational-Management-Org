import type { UserRole } from '@/lib/database.types'

export type Permission =
  | '*'
  | 'portfolio.read'
  | 'portfolio.write'
  | 'goals.read'
  | 'goals.write'
  | 'interventions.read'
  | 'interventions.write'
  | 'growth_plans.own'
  | 'growth_plans.read'
  | 'growth_plans.write'
  | 'coaching.manage'
  | 'coaching.read'
  | 'observations.write'
  | 'pd.read'
  | 'pd.manage'
  | 'pd.register'
  | 'certifications.read'
  | 'certifications.manage'
  | 'student.progress.read'
  | 'portfolio.read.public'
  | 'revenue.read'
  | 'revenue.manage'
  | 'calendar.read'
  | 'messages.read'
  | 'messages.send'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['*'],
  regional_manager: [
    'portfolio.read',
    'portfolio.write',
    'goals.read',
    'goals.write',
    'interventions.read',
    'interventions.write',
    'growth_plans.read',
    'coaching.read',
    'pd.read',
    'pd.manage',
    'certifications.read',
    'certifications.manage',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  staff: [
    'portfolio.read',
    'goals.read',
    'interventions.read',
    'pd.read',
    'pd.register',
    'certifications.read',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  teacher: [
    'growth_plans.own',
    'growth_plans.write',
    'coaching.read',
    'pd.read',
    'pd.register',
    'certifications.read',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  coach: [
    'coaching.manage',
    'coaching.read',
    'observations.write',
    'growth_plans.read',
    'pd.read',
    'pd.register',
    'certifications.read',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  consultant: [
    'coaching.manage',
    'coaching.read',
    'observations.write',
    'growth_plans.read',
    'pd.read',
    'certifications.read',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  parent: ['student.progress.read', 'portfolio.read.public'],
  board_member: ['portfolio.read.public', 'goals.read', 'interventions.read'],
  developer: ['*', 'revenue.read', 'revenue.manage'],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? []
  if (perms.includes('*')) return true
  return perms.includes(permission)
}

export function canAccessNav(role: UserRole, navRoles: UserRole[]): boolean {
  return navRoles.includes(role)
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  regional_manager: 'Regional Manager',
  staff: 'Staff',
  teacher: 'Teacher',
  coach: 'Instructional Coach',
  consultant: 'Consultant',
  parent: 'Parent',
  board_member: 'Board Member',
  developer: 'Developer',
}

export function getDefaultHomePath(role: UserRole): string {
  switch (role) {
    case 'teacher':
    case 'coach':
    case 'consultant':
      return '/workspace'
    case 'parent':
      return '/workspace'
    case 'board_member':
      return '/'
    case 'developer':
      return '/'
    default:
      return '/'
  }
}
