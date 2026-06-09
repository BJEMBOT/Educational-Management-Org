import {
  getDefaultHomePathForView,
  roleToAppView,
} from '@/lib/app-views'
import type { PartnerUserType, Profile, UserRole } from '@/lib/database.types'

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
  | 'evaluations.manage'
  | 'evaluations.conduct'
  | 'evaluations.read'
  | 'evaluations.artifacts.own'
  | 'pd.read'
  | 'pd.manage'
  | 'pd.register'
  | 'certifications.read'
  | 'certifications.manage'
  | 'student.progress.read'
  | 'portfolio.read.public'
  | 'partners.read'
  | 'partners.own'
  | 'partner_users.read'
  | 'partner_users.own'
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
    'evaluations.conduct',
    'evaluations.read',
    'pd.read',
    'pd.manage',
    'certifications.read',
    'certifications.manage',
    'partners.read',
    'partner_users.read',
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
    'partners.read',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  teacher: [
    'growth_plans.own',
    'growth_plans.write',
    'coaching.read',
    'evaluations.read',
    'evaluations.artifacts.own',
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
    'evaluations.conduct',
    'evaluations.read',
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
    'evaluations.conduct',
    'evaluations.read',
    'growth_plans.read',
    'pd.read',
    'certifications.read',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  partner: [
    'partners.own',
    'partner_users.own',
    'pd.read',
    'calendar.read',
    'messages.read',
    'messages.send',
  ],
  parent: ['student.progress.read', 'portfolio.read.public'],
  board_member: ['portfolio.read.public', 'goals.read', 'interventions.read', 'partners.read'],
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

export function isOrgWideAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'developer' || role === 'regional_manager'
}

/** Create calendar/PD events and edit core system records */
export function canManageSystemRecords(role: UserRole): boolean {
  return role === 'admin' || role === 'developer'
}

export function canManageCalendar(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canManageCertifications(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canManagePartners(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canViewAllPartnerData(role: UserRole): boolean {
  return (
    hasPermission(role, '*') ||
    role === 'admin' ||
    role === 'developer' ||
    role === 'regional_manager'
  )
}

export function isPartnerUser(profile: Pick<Profile, 'role' | 'partner_id'>): boolean {
  return profile.role === 'partner' && profile.partner_id !== null
}

export function canViewPartnerUserDirectory(role: UserRole): boolean {
  return role === 'admin' || role === 'developer' || role === 'partner'
}

export function canSubmitTimeOff(profile: Pick<Profile, 'role' | 'partner_id'>): boolean {
  if (profile.role === 'admin' || profile.role === 'developer') return true
  return isPartnerUser(profile)
}

export function canManageTimeOff(role: UserRole): boolean {
  return role === 'admin' || role === 'developer'
}

export function canManagePd(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canManageCoaching(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canViewAllCoachingCycles(role: UserRole): boolean {
  return hasPermission(role, '*') || role === 'regional_manager'
}

export function canManageEvaluations(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canConductEvaluations(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canViewAllEvaluations(role: UserRole): boolean {
  return canManageSystemRecords(role)
}

export function canEditGrowthPlan(
  role: UserRole,
  profileId: string,
  planUserId: string
): boolean {
  return canManageSystemRecords(role) || (role === 'teacher' && profileId === planUserId)
}

/** Hard-delete accidental coaching cycles, check-ins, evaluations, etc. */
export function canDeleteScheduledRecords(role: UserRole): boolean {
  return role === 'admin' || role === 'developer'
}

export function canAccessFinance(role: UserRole): boolean {
  return role === 'admin' || role === 'developer'
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  regional_manager: 'Regional Manager',
  staff: 'Staff',
  teacher: 'Teacher',
  coach: 'Instructional Coach',
  consultant: 'Consultant',
  partner: 'Partner',
  parent: 'Parent',
  board_member: 'Board Member',
  developer: 'Developer',
}

export const partnerUserTypeLabels: Record<PartnerUserType, string> = {
  employee: 'Employee',
  administrator: 'Administrator',
}

export function getDefaultHomePath(role: UserRole): string {
  return getDefaultHomePathForView(roleToAppView(role))
}
