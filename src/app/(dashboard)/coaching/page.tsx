import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import {
  getCoachProfiles,
  getCoachingCycles,
  getProfilesByRole,
} from '@/lib/queries/coaching'
import { getSchools } from '@/lib/queries/schools'
import {
  canDeleteScheduledRecords,
  canManageCoaching,
  canViewAllCoachingCycles,
} from '@/lib/permissions'
import { CoachingCycleForm } from '@/components/coaching/coaching-cycle-form'
import { CoachingCyclesTable } from '@/components/coaching/coaching-cycles-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'

export default async function CoachingPage() {
  const profile = await getCurrentProfile()
  const canCreate = profile ? canManageCoaching(profile.role) : false
  const canDelete = profile ? canDeleteScheduledRecords(profile.role) : false
  const viewAll = profile ? canViewAllCoachingCycles(profile.role) : false
  const isCoach =
    profile?.role === 'coach' || profile?.role === 'consultant'
  const isTeacher = profile?.role === 'teacher'
  const showCoachPicker =
    profile?.role === 'admin' ||
    profile?.role === 'developer' ||
    profile?.role === 'regional_manager'

  const [cycles, schools, teachers, coaches] = await Promise.all([
    getCoachingCycles(
      viewAll
        ? undefined
        : isCoach && profile
          ? { coachId: profile.id }
          : isTeacher && profile
            ? { teacherId: profile.id }
            : undefined
    ),
    getSchools(),
    getProfilesByRole('teacher'),
    getCoachProfiles(),
  ])

  const defaultCoachId =
    isCoach && profile
      ? profile.id
      : coaches[0]?.id ?? profile?.id ?? ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructional Coaching"
        subtitle="Manage coaching cycles, observations, and teacher feedback"
        actions={
          canCreate && profile ? (
            <CoachingCycleForm
              schools={schools}
              teachers={teachers}
              coaches={coaches}
              defaultCoachId={defaultCoachId}
              showCoachPicker={showCoachPicker}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Cycle
                </>
              }
            />
          ) : undefined
        }
      />

      <DataTableWrapper>
        <CoachingCyclesTable cycles={cycles} canDelete={canDelete} />
      </DataTableWrapper>
    </div>
  )
}
