import {
  getDashboardSummary,
  getSchoolsWithGoalStats,
} from '@/lib/queries/schools'
import { SchoolsTable } from '@/components/schools/schools-table'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Building2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export async function BoardDashboard() {
  const [schools, summary] = await Promise.all([
    getSchoolsWithGoalStats(),
    getDashboardSummary(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategic Overview"
        subtitle="Read-only portfolio summary for board governance and oversight"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Schools in Network" value={summary.totalSchools} icon={Building2} accent="primary" />
        <MetricCard label="Healthy" value={summary.healthyCount} icon={CheckCircle2} accent="success" />
        <MetricCard label="At Risk" value={summary.atRiskCount} icon={AlertTriangle} accent="warning" />
        <MetricCard label="Off Track" value={summary.offTrackCount} icon={XCircle} accent="danger" />
      </div>

      <SchoolsTable schools={schools} />
    </div>
  )
}
