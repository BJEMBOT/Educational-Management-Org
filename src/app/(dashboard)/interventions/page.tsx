import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManageSystemRecords } from '@/lib/permissions'
import { getInterventions } from '@/lib/queries/interventions'
import { getSchools } from '@/lib/queries/schools'
import { InterventionsTable } from '@/components/interventions/interventions-table'
import { InterventionFormDialog } from '@/components/interventions/intervention-form-dialog'
import { PageHeader } from '@/components/ui/page-header'

export default async function InterventionsPage() {
  const profile = await getCurrentProfile()
  const canManage = profile ? canManageSystemRecords(profile.role) : false
  const [interventions, schools] = await Promise.all([
    getInterventions(),
    getSchools(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interventions"
        subtitle="Document and track corrective actions for off-track schools"
        actions={
          canManage ? (
            <InterventionFormDialog
              schools={schools}
              triggerSize="sm"
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Intervention
                </>
              }
            />
          ) : undefined
        }
      />

      <InterventionsTable
        interventions={interventions}
        schools={schools}
        canManage={canManage}
      />
    </div>
  )
}
