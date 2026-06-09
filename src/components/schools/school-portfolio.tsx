import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManageSystemRecords } from '@/lib/permissions'
import { getSchoolsWithGoalStats } from '@/lib/queries/schools'
import { getPartnerCountsBySchool, getPartners } from '@/lib/queries/partners'
import { getGoals } from '@/lib/queries/goals'
import { getInterventions } from '@/lib/queries/interventions'
import { buildDistrictDetails, getTeachersBySchool } from '@/lib/queries/districts'
import { SchoolFormDialog } from '@/components/schools/school-form-dialog'
import { SchoolPortfolioTable } from '@/components/schools/school-portfolio-table'
import { DistrictRollupCards } from '@/components/schools/district-rollup-cards'
import { PortfolioSummary } from '@/components/schools/portfolio-summary'
import { PageHeader } from '@/components/ui/page-header'

export async function SchoolPortfolio() {
  const profile = await getCurrentProfile()
  const canManage = profile ? canManageSystemRecords(profile.role) : false
  const [schools, partnerCounts, goals, interventions, partners, teachers] =
    await Promise.all([
      getSchoolsWithGoalStats(),
      getPartnerCountsBySchool(),
      getGoals(),
      getInterventions(),
      getPartners(),
      getTeachersBySchool(),
    ])

  const districts = buildDistrictDetails({
    schools,
    goals,
    interventions,
    partners,
    teachers,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Portfolio"
        subtitle="Browse and manage schools across your network"
        actions={
          canManage ? (
            <SchoolFormDialog
              triggerSize="sm"
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add School
                </>
              }
            />
          ) : undefined
        }
      />

      {districts.length > 0 && (
        <div className="space-y-8">
          <PortfolioSummary
            districtCount={districts.length}
            schoolCount={schools.length}
            totalEnrollment={schools.reduce((s, sc) => s + sc.enrollment, 0)}
            openInterventions={districts.reduce((s, d) => s + d.openInterventionCount, 0)}
            schoolsNeedingAttention={schools.filter((s) => s.healthStatus !== 'healthy').length}
          />
          <DistrictRollupCards districts={districts} />
        </div>
      )}

      <SchoolPortfolioTable schools={schools} partnerCounts={partnerCounts} />
    </div>
  )
}
