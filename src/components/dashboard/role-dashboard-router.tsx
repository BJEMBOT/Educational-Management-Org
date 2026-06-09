import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import { ExecutiveDashboard } from '@/components/dashboard/executive-dashboard'
import { TeacherWorkspace } from '@/components/dashboard/teacher-workspace'
import { CoachWorkspace } from '@/components/dashboard/coach-workspace'
import { ParentWorkspace } from '@/components/dashboard/parent-workspace'
import { BoardDashboard } from '@/components/dashboard/board-dashboard'
import type { Profile } from '@/lib/database.types'

export async function RoleDashboardRouter() {
  const profile = await getCurrentProfile()
  if (!profile) return <ExecutiveDashboard profile={null} />

  return <DashboardForRole profile={profile} />
}

function DashboardForRole({ profile }: { profile: Profile }) {
  switch (profile.role) {
    case 'teacher':
      return <TeacherWorkspace profile={profile} />
    case 'coach':
    case 'consultant':
      return <CoachWorkspace profile={profile} />
    case 'parent':
      return <ParentWorkspace profile={profile} />
    case 'board_member':
      return <BoardDashboard />
    case 'partner':
      redirect('/partners')
    case 'admin':
    case 'regional_manager':
    case 'staff':
    case 'developer':
    default:
      return <ExecutiveDashboard profile={profile} />
  }
}
