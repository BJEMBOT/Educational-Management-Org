import { redirect } from 'next/navigation'
import { getProfileViewContext } from '@/lib/queries/profile'
import { ExecutiveDashboard } from '@/components/dashboard/executive-dashboard'
import { TeacherWorkspace } from '@/components/dashboard/teacher-workspace'
import type { Profile } from '@/lib/database.types'
import type { AppView } from '@/lib/app-views'

export async function RoleDashboardRouter() {
  const { profile, effectiveView } = await getProfileViewContext()
  if (!profile) return <ExecutiveDashboard profile={null} />

  return <DashboardForView profile={profile} effectiveView={effectiveView} />
}

function DashboardForView({
  profile,
  effectiveView,
}: {
  profile: Profile
  effectiveView: AppView
}) {
  switch (effectiveView) {
    case 'teacher':
      return <TeacherWorkspace profile={profile} />
    case 'partner':
      redirect('/partners')
    case 'developer':
    case 'staff':
    case 'admin':
    default:
      return <ExecutiveDashboard profile={profile} />
  }
}
