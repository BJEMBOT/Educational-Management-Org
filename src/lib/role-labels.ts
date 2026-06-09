import type { UserRole } from '@/lib/database.types'

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  regional_manager: 'Regional Manager',
  staff: 'Staff',
  teacher: 'Teacher',
  coach: 'Coach',
  consultant: 'Consultant',
  partner: 'Partner',
  parent: 'Parent',
  board_member: 'Board Member',
  developer: 'Developer',
}
