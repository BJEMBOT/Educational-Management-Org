import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManageSystemRecords } from '@/lib/permissions'
import { getGoals } from '@/lib/queries/goals'
import { getSchools } from '@/lib/queries/schools'
import { GoalsTable } from '@/components/goals/goals-table'
import { GoalFormDialog } from '@/components/goals/goal-form-dialog'
import { PageHeader } from '@/components/ui/page-header'

export default async function GoalsPage() {
  const profile = await getCurrentProfile()
  const canManage = profile ? canManageSystemRecords(profile.role) : false
  const [goals, schools] = await Promise.all([getGoals(), getSchools()])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategic Goals"
        subtitle="Track and update performance goals across all schools"
        actions={
          canManage ? (
            <GoalFormDialog
              schools={schools}
              triggerSize="sm"
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </>
              }
            />
          ) : undefined
        }
      />

      <GoalsTable goals={goals} schools={schools} canManage={canManage} />
    </div>
  )
}
